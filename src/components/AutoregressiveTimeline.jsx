import useAnimationLoop from './ui/hooks/useAnimationLoop';
import TimelineCard from './ui/TimelineCard';

/**
 * An animated view of autoregressive decoding (island).
 *
 * Plays out generation one token at a time across two lanes: a MEMORY lane
 * (streaming the model's weights from GPU memory into the on-chip compute units
 * — busy almost the whole time) and a COMPUTE lane (the actual matrix math — a
 * tiny sliver, idle the rest of the time). Because each token can only start
 * once the previous one has finished, the steps are strictly sequential.
 * Together those two facts are the bottleneck speculative decoding attacks.
 *
 * Light "warm paper" card matching the site's zen design system: hairline
 * borders, recessed tracks, one warm accent, no shadows or gradients.
 */

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.'];

// Per-token time budget in relative units: streaming weights dwarfs the math.
const MEM = 9;
const COMPUTE = 1;
const STEP = MEM + COMPUTE;
const TOTAL = TOKENS.length * STEP;

// SVG coordinate space (scales to 100% width via viewBox).
const W = 1000;
const H = 288;
const PL = 150; // left gutter for lane labels
const PR = 70; // right gutter for the per-row utilisation %
const AXIS_W = W - PL - PR;

const MEM_Y = 30;
const COMPUTE_Y = 120;
const OUTPUT_Y = 210;
const LANE_H = 46;
const PCT_X = PL + AXIS_W + 12; // left edge of the row-end % labels

// One warm accent (memory, dominant) and one quiet sage (compute, the rare
// active sliver) — kept muted so the card stays zen.
const MEM_COLOR = 'var(--accent)';
const COMPUTE_COLOR = '#5f7d6e';
const IDLE = 'var(--paper-inset)';
const INK = 'var(--ink)';
const INK_FAINT = 'var(--ink-faint)';
const RULE = 'var(--rule)';

const UNITS_PER_MS = TOTAL / 5200; // full sweep ≈ 5.2s

const tToX = (t) => PL + (t / TOTAL) * AXIS_W;

const tick = (prev, dt) => prev + dt * UNITS_PER_MS;

// Segments for each token: [memory phase, compute phase].
const STEPS = TOKENS.map((tok, i) => {
	const start = i * STEP;
	return {
		tok,
		i,
		memStart: start,
		memEnd: start + MEM,
		computeStart: start + MEM,
		computeEnd: start + STEP,
	};
});

export default function AutoregressiveTimeline() {
	const { progress: t, playing, toggle, reset } = useAnimationLoop(tick, TOTAL);

	const playX = tToX(t);
	// Percentage of the elapsed time a phase has actually been active: memory
	// streaming weights dominates (~90%), compute is the rare active sliver (~10%).
	const utilPct = (startKey, endKey) => {
		if (t <= 0) return 0;
		const busy = STEPS.reduce((acc, s) => acc + Math.max(0, Math.min(t, s[endKey]) - s[startKey]), 0);
		return Math.round((busy / t) * 100);
	};
	const util = utilPct('computeStart', 'computeEnd');
	const memUtil = utilPct('memStart', 'memEnd');

	return (
		<TimelineCard
			title="Autoregressive: Memory vs Compute"
			playing={playing}
			progress={t}
			total={TOTAL}
			onToggle={toggle}
			onReset={reset}
			footer={
				<>
					The weights aren't cold — they live in the GPU's high-bandwidth memory (HBM) for the whole
					session. "Stream weights" means moving them from HBM into the tiny on-chip memory beside
					the compute cores, which is far too small to hold the model, so every forward pass
					re-streams the full set. That HBM→chip trip, once per token, is the bottleneck — not a
					disk load.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				width="100%"
				style={{ minWidth: '32rem', display: 'block', userSelect: 'none' }}
				aria-label="Autoregressive decoding: memory-bound, one token per pass"
			>
				{/* lane labels */}
				<text
					x={PL - 16}
					y={MEM_Y + LANE_H / 2 + 5}
					textAnchor="end"
					fill={MEM_COLOR}
					style={{ fontSize: '14px', fontWeight: 700 }}
				>
					MEMORY
				</text>
				<text
					x={PL - 16}
					y={MEM_Y + LANE_H / 2 + 24}
					textAnchor="end"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px' }}
				>
					stream weights
				</text>
				<text
					x={PL - 16}
					y={COMPUTE_Y + LANE_H / 2 + 5}
					textAnchor="end"
					fill={COMPUTE_COLOR}
					style={{ fontSize: '14px', fontWeight: 700 }}
				>
					COMPUTE
				</text>
				<text
					x={PL - 16}
					y={COMPUTE_Y + LANE_H / 2 + 24}
					textAnchor="end"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px' }}
				>
					the math
				</text>
				<text
					x={PL - 16}
					y={OUTPUT_Y + LANE_H / 2 + 5}
					textAnchor="end"
					fill={INK}
					style={{ fontSize: '14px', fontWeight: 700 }}
				>
					OUTPUT
				</text>
				<text
					x={PL - 16}
					y={OUTPUT_Y + LANE_H / 2 + 24}
					textAnchor="end"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px' }}
				>
					generated text
				</text>

				{/* per-row utilisation, at the end of each lane */}
				<text
					x={PCT_X}
					y={MEM_Y + LANE_H / 2 + 5}
					textAnchor="start"
					fill={MEM_COLOR}
					style={{ fontSize: '14px', fontWeight: 700 }}
				>
					~{memUtil}%
				</text>
				<text
					x={PCT_X}
					y={COMPUTE_Y + LANE_H / 2 + 5}
					textAnchor="start"
					fill={COMPUTE_COLOR}
					style={{ fontSize: '14px', fontWeight: 700 }}
				>
					~{util}%
				</text>

				{/* idle lane backgrounds (recessed tracks) */}
				<rect x={PL} y={MEM_Y} width={AXIS_W} height={LANE_H} fill={IDLE} rx="4" />
				<rect x={PL} y={COMPUTE_Y} width={AXIS_W} height={LANE_H} fill={IDLE} rx="4" />
				<rect x={PL} y={OUTPUT_Y} width={AXIS_W} height={LANE_H} fill={IDLE} rx="4" />

				{STEPS.map((s) => {
					// How far the playhead has progressed into each phase (0..1 width reveal).
					const memW = Math.max(0, Math.min(t, s.memEnd) - s.memStart);
					const compW = Math.max(0, Math.min(t, s.computeEnd) - s.computeStart);
					const done = t >= s.computeEnd;
					return (
						<g key={s.i}>
							{/* step separator */}
							<line
								x1={tToX(s.memStart)}
								x2={tToX(s.memStart)}
								y1={MEM_Y - 6}
								y2={OUTPUT_Y + LANE_H + 6}
								stroke={RULE}
								strokeWidth="1"
							/>
							{/* memory phase fill */}
							{memW > 0 && (
								<rect
									x={tToX(s.memStart)}
									y={MEM_Y}
									width={(memW / TOTAL) * AXIS_W}
									height={LANE_H}
									fill={MEM_COLOR}
									opacity="0.9"
									rx="4"
								/>
							)}
							{/* compute phase fill */}
							{compW > 0 && (
								<rect
									x={tToX(s.computeStart)}
									y={COMPUTE_Y}
									width={(compW / TOTAL) * AXIS_W}
									height={LANE_H}
									fill={COMPUTE_COLOR}
									rx="4"
								/>
							)}
							{/* token in the OUTPUT row, once generated */}
							<text
								x={tToX((s.memStart + s.computeEnd) / 2)}
								y={OUTPUT_Y + LANE_H / 2 + 5}
								textAnchor="middle"
								fill={done ? INK : RULE}
								style={{ fontSize: '14px', fontWeight: 600 }}
							>
								{s.tok}
							</text>
						</g>
					);
				})}

				{/* playhead */}
				<line
					x1={playX}
					x2={playX}
					y1={MEM_Y - 15}
					y2={OUTPUT_Y + LANE_H + 10}
					stroke={INK}
					strokeWidth="1.5"
					opacity={t > 0 && t < TOTAL ? 0.55 : 0}
				/>
			</svg>
		</TimelineCard>
	);
}
