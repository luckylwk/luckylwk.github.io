import { useCallback, useRef, useState } from 'react';
import BitViewerCard from './ui/bit-viewer/BitViewerCard';
import IconButton from './ui/IconButton';

/**
 * An interactive "round onto a grid" visualiser (island).
 *
 * Drag the dot (or focus it and use the arrow keys) to pick a real
 * value; each row shows where that value lands on a lower-precision floating
 * grid — BF16, FP8 (E4M3), FP4 (E2M1). The horizontal offset between the true
 * value and each snapped marker is the rounding error.
 */

// Visible value window. Positive and small so FP4's sparse grid (0, 0.5, 1)
// reads clearly, matching the reference framing.
const LO = 0;
const HI = 1;
const DEFAULT = 0.59375;

// SVG coordinate space (scales to 100% width via viewBox).
const W = 1000;
const H = 470;
const PL = 130; // left gutter for row labels
const PR = 34;
const AXIS_W = W - PL - PR;

const FORMATS = [
	{
		key: 'bf16',
		name: 'BFLOAT16',
		expBits: 8,
		mantBits: 7,
		color: 'var(--accent)',
		y: 96,
		dense: true,
	},
	{ key: 'fp8', name: 'FLOAT8', expBits: 4, mantBits: 3, color: '#5f7d6e', y: 250 },
	{ key: 'fp4', name: 'FLOAT4', expBits: 2, mantBits: 1, color: '#b0503f', y: 404 },
];

/** Round-half-to-even on a real number. */
function rne(v) {
	const f = Math.floor(v);
	const d = v - f;
	if (d < 0.5) return f;
	if (d > 0.5) return f + 1;
	return f % 2 === 0 ? f : f + 1;
}

/**
 * Round `x` to the nearest value representable by a float format with the given
 * exponent / mantissa bit-widths, using round-to-nearest-even. Handles the sign,
 * zero, subnormals, and clamps to the largest finite magnitude.
 *
 * (Treats the top exponent field as a normal number rather than reserving it for
 * inf/NaN — irrelevant inside the visible [0, 1] window, and it keeps the grid
 * uniform per binade.)
 */
function roundToFloat(x, expBits, mantBits) {
	if (x === 0 || !Number.isFinite(x)) return 0;
	const sign = x < 0 ? -1 : 1;
	const a = Math.abs(x);
	const bias = (1 << (expBits - 1)) - 1;
	const levels = 1 << mantBits;

	const minNormalExp = 1 - bias;
	const maxExp = (1 << expBits) - 1 - bias;
	const maxFinite = (2 - 1 / levels) * Math.pow(2, maxExp);
	if (a >= maxFinite) return sign * maxFinite;

	let e = Math.floor(Math.log2(a));
	let rounded;
	if (e < minNormalExp) {
		// Subnormal: uniform spacing of 2^(minNormalExp - mantBits).
		const step = Math.pow(2, minNormalExp - mantBits);
		rounded = rne(a / step) * step;
	} else {
		// Normal binade: spacing of 2^(e - mantBits).
		const step = Math.pow(2, e - mantBits);
		rounded = rne(a / step) * step;
	}
	return sign * Math.min(rounded, maxFinite);
}

/** Enumerate every representable value of a format within [lo, hi] (sorted). */
function representable(expBits, mantBits, lo, hi) {
	const bias = (1 << (expBits - 1)) - 1;
	const levels = 1 << mantBits;
	const vals = new Set();
	const subStep = Math.pow(2, 1 - bias - mantBits);
	for (let m = 0; m < levels; m++) {
		const v = m * subStep;
		if (v >= lo && v <= hi) vals.add(v);
	}
	for (let ef = 1; ef < 1 << expBits; ef++) {
		const scale = Math.pow(2, ef - bias);
		for (let m = 0; m < levels; m++) {
			const v = (1 + m / levels) * scale;
			if (v >= lo && v <= hi) vals.add(v);
		}
	}
	return [...vals].sort((p, q) => p - q);
}

// Discrete grids only for the coarse formats; BF16 is drawn as a dense hatch.
const TICKS = Object.fromEntries(
	FORMATS.filter((f) => !f.dense).map((f) => [f.key, representable(f.expBits, f.mantBits, LO, HI)]),
);

function formatNum(v) {
	if (v === 0) return '0';
	const s = Number(v.toFixed(6)).toString();
	return s;
}

const valueToX = (v) => PL + ((v - LO) / (HI - LO)) * AXIS_W;

export default function PrecisionRounder({ initial = DEFAULT }) {
	const clamp = (v) => Math.min(HI, Math.max(LO, v));
	const [value, setValue] = useState(() => clamp(initial));
	const svgRef = useRef(null);
	const draggingRef = useRef(false);

	const setFromClientX = useCallback((clientX) => {
		const svg = svgRef.current;
		if (!svg) return;
		const rect = svg.getBoundingClientRect();
		const xSvg = ((clientX - rect.left) / rect.width) * W;
		const v = LO + ((xSvg - PL) / AXIS_W) * (HI - LO);
		setValue(Math.min(HI, Math.max(LO, v)));
	}, []);

	const onPointerDown = (e) => {
		draggingRef.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);
		setFromClientX(e.clientX);
	};
	const onPointerMove = (e) => {
		if (draggingRef.current) setFromClientX(e.clientX);
	};
	const onPointerUp = (e) => {
		draggingRef.current = false;
		if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
	};

	const trueX = valueToX(value);
	const rows = FORMATS.map((f) => {
		const snapped = roundToFloat(value, f.expBits, f.mantBits);
		return { ...f, snapped, x: valueToX(snapped), err: Math.abs(value - snapped) };
	});
	const connector = rows.map((r) => `${r.x},${r.y}`).join(' ');

	return (
		<BitViewerCard
			title="round onto a grid"
			headerRight={
				<IconButton icon="↻" onClick={() => setValue(DEFAULT)} ariaLabel="Reset value" />
			}
			slider={{
				min: LO,
				max: HI,
				step: (HI - LO) / 400,
				value,
				onChange: (e) => setValue(clamp(Number(e.target.value))),
				fill: FORMATS[0].color,
				ariaLabel: 'value to round',
			}}
		>
			<style>{`
				.pr-hit { cursor: ew-resize; touch-action: none; }
				.pr-dot { cursor: grab; }
				.pr-dot:active { cursor: grabbing; }
			`}</style>
			<div style={{ padding: '0.5rem 1rem 1rem', overflowX: 'auto' }}>
				<svg
					ref={svgRef}
					className="pr-svg"
					viewBox={`0 0 ${W} ${H}`}
					width="100%"
					style={{ minWidth: '32rem', display: 'block', userSelect: 'none' }}
					aria-label="Value rounded onto BF16, FP8 and FP4 grids"
				>
					<defs>
						<pattern id="pr-hatch" width="4" height="10" patternUnits="userSpaceOnUse">
							<line x1="0" y1="0" x2="0" y2="10" stroke="var(--rule)" strokeWidth="1" />
						</pattern>
					</defs>

					{/* vertical connector between the snapped markers */}
					<polyline points={connector} fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" />

					{rows.map((r) => {
						const ticks = TICKS[r.key];
						let bin = null;
						if (ticks) {
							const i = ticks.reduce(
								(best, v, idx) =>
									Math.abs(v - r.snapped) < Math.abs(ticks[best] - r.snapped) ? idx : best,
								0,
							);
							const left = i > 0 ? (ticks[i - 1] + ticks[i]) / 2 : LO;
							const right = i < ticks.length - 1 ? (ticks[i] + ticks[i + 1]) / 2 : HI;
							bin = { left: valueToX(left), right: valueToX(right) };
						}
						return (
							<g key={r.key}>
								{/* row label */}
								<text
									x={PL}
									y={r.y - 42}
									fill={r.color}
									style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '0.06em' }}
								>
									{r.name}
								</text>

								{/* grid */}
								{r.dense ? (
									<rect
										x={PL}
										y={r.y - 9}
										width={AXIS_W}
										height={18}
										fill="url(#pr-hatch)"
										opacity="0.9"
									/>
								) : (
									ticks.map((v, idx) => (
										<line
											key={idx}
											x1={valueToX(v)}
											x2={valueToX(v)}
											y1={r.y - 9}
											y2={r.y + 9}
											stroke="var(--rule)"
											strokeWidth="1"
										/>
									))
								)}
								{/* baseline */}
								<line x1={PL} x2={W - PR} y1={r.y} y2={r.y} stroke="var(--rule)" strokeWidth="1" />

								{/* rounding-error segment: true value -> snapped */}
								{r.err > 0 && (
									<line
										x1={trueX}
										x2={r.x}
										y1={r.y}
										y2={r.y}
										stroke={r.color}
										strokeWidth="2"
										opacity="0.35"
									/>
								)}

								{/* quantization bin bracket (coarse formats only) */}
								{bin && (
									<g stroke={r.color} strokeWidth="1.5" opacity="0.7">
										<line x1={bin.left} x2={bin.left} y1={r.y - 12} y2={r.y + 12} />
										<line x1={bin.left} x2={r.x} y1={r.y} y2={r.y} />
									</g>
								)}

								{/* snapped value label */}
								<text
									x={r.x}
									y={r.y - 18}
									textAnchor="middle"
									fill={r.color}
									style={{ fontSize: '19px', fontWeight: 700 }}
								>
									{formatNum(r.snapped)}
								</text>

								{/* snapped marker */}
								<circle cx={r.x} cy={r.y} r={r.dense ? 15 : 13} fill={r.color} />

								{/* rounding error readout (below the baseline, so it never
									 collides with the value label above the marker) */}
								{!r.dense && (
									<text
										x={W - PR}
										y={r.y + 30}
										textAnchor="end"
										fill="var(--ink-faint)"
										style={{ fontSize: '12px' }}
									>
										{r.err === 0 ? 'exact' : `err ${formatNum(Number(r.err.toFixed(5)))}`}
									</text>
								)}
							</g>
						);
					})}

					{/* draggable hit-strip + handle over the top (true value) row */}
					<rect
						className="pr-hit"
						x={PL - 12}
						y={FORMATS[0].y - 34}
						width={AXIS_W + 24}
						height={68}
						fill="transparent"
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
					/>
					<circle
						className="pr-dot"
						cx={trueX}
						cy={FORMATS[0].y}
						r="15"
						fill={FORMATS[0].color}
						stroke="var(--paper-card)"
						strokeWidth="2"
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
					/>
				</svg>
			</div>
		</BitViewerCard>
	);
}
