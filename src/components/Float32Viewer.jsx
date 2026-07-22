import { useState } from 'react';
import BitCell from './ui/bit-viewer/BitCell.jsx';
import BitViewerCard from './ui/bit-viewer/BitViewerCard.jsx';
import IconButton from './ui/IconButton.jsx';

/**
 * An interactive IEEE-754 float32 bit-layout visualiser (island).
 *
 * The slider picks a value in [-8, 8]; the +/- buttons nudge it and ↻ resets
 * to 1.5. The 32 bits (1 sign · 8 exponent · 23 significand) update live, each
 * digit sliding vertically 0↕1 as it flips.
 */

const MIN = -8;
const MAX = 8;
const STEP = 0.05;
const DEFAULT = 1.5;

// [set colour, unset (outline) colour] per field.
const SIGN = ['var(--ink)', 'var(--ink-faint)'];
const EXP = ['var(--accent)', 'var(--ink-faint)'];
const SIG = ['#5f7d6e', 'var(--ink-faint)'];

const FILL = 'var(--accent)';

/** Decompose a JS number into its 32 IEEE-754 float32 bits (index 0 = sign). */
function floatBits(value) {
	const buf = new ArrayBuffer(4);
	new Float32Array(buf)[0] = value;
	const u = new Uint32Array(buf)[0];
	const bits = [];
	for (let i = 31; i >= 0; i--) bits.push((u >>> i) & 1);
	return bits;
}

function Bit({ on, colors }) {
	// Wrapper owns the flex distribution across the field's row; BitCell just
	// fills the given width and clips to its fixed height.
	return (
		<div style={{ flex: 1, minWidth: 0 }}>
			<BitCell
				on={on}
				onColor={colors[0]}
				offColor={colors[1]}
				height="1.9rem"
				oneFontSize="1.3rem"
				zeroFontSize="0.85rem"
			/>
		</div>
	);
}

function FieldLabel({ text, color, flex }) {
	return (
		<div style={{ flex, display: 'flex', alignItems: 'center', gap: '0.4rem', color, minWidth: 0 }}>
			<span style={{ flex: 1, height: '1px', background: color, opacity: 0.55 }} />
			<span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
				{text}
			</span>
			<span style={{ flex: 1, height: '1px', background: color, opacity: 0.55 }} />
		</div>
	);
}

function formatValue(v) {
	const rounded = Number(v.toFixed(2));
	return Number.isInteger(rounded) ? rounded.toFixed(1) : String(rounded);
}

function clamp(v) {
	return Math.min(MAX, Math.max(MIN, Number(v.toFixed(2))));
}

export default function Float32Viewer({ initial = DEFAULT }) {
	const [value, setValue] = useState(() => clamp(initial));
	const bits = floatBits(value);
	const exponent = bits.slice(1, 9);
	const significand = bits.slice(9);

	const headerRight = (
		<span style={{ display: 'flex', gap: '0.5rem' }}>
			<IconButton
				icon="−"
				onClick={() => setValue((v) => clamp(v - STEP))}
				ariaLabel="Decrease value"
			/>
			<IconButton
				icon="+"
				onClick={() => setValue((v) => clamp(v + STEP))}
				ariaLabel="Increase value"
			/>
			<IconButton icon="↻" onClick={() => setValue(DEFAULT)} ariaLabel="Reset value" />
		</span>
	);

	return (
		<BitViewerCard
			title="float32"
			headerRight={headerRight}
			slider={{
				min: MIN,
				max: MAX,
				step: STEP,
				value,
				onChange: (e) => setValue(clamp(Number(e.target.value))),
				fill: FILL,
				ariaLabel: 'float32 value',
			}}
		>
			<div style={{ minWidth: '34rem' }}>
				{/* Field labels */}
				<div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
					<div style={{ display: 'flex', flex: 1, justifyContent: 'center', color: SIGN[0] }}>
						<span style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}>S</span>
					</div>
					<FieldLabel text="EXPONENT" color={EXP[0]} flex={8} />
					<FieldLabel text="SIGNIFICAND" color={SIG[0]} flex={23} />
				</div>

				{/* Bits */}
				<div style={{ display: 'flex', gap: '2px' }}>
					<div style={{ display: 'flex', flex: 1 }}>
						<Bit on={!!bits[0]} colors={SIGN} />
					</div>
					<div style={{ display: 'flex', flex: 8 }}>
						{exponent.map((b, i) => (
							<Bit key={i} on={!!b} colors={EXP} />
						))}
					</div>
					<div style={{ display: 'flex', flex: 23 }}>
						{significand.map((b, i) => (
							<Bit key={i} on={!!b} colors={SIG} />
						))}
					</div>
				</div>

				{/* Decoded value */}
				<div style={{ textAlign: 'center', marginTop: '1rem' }}>
					<span
						style={{
							fontSize: '2rem',
							fontWeight: 700,
							color: 'var(--ink)',
							borderBottom: '2px solid var(--rule)',
							padding: '0 0.4rem 0.15rem',
							letterSpacing: '0.08em',
						}}
					>
						{formatValue(value)}
					</span>
				</div>
			</div>
		</BitViewerCard>
	);
}
