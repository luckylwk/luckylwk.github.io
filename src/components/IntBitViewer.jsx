import { useState } from 'react';
import BitCell from './ui/bit-viewer/BitCell.jsx';
import BitViewerCard from './ui/bit-viewer/BitViewerCard.jsx';

/**
 * An interactive integer bit-layout visualiser (island).
 *
 * Drag the slider and watch the binary representation update, each bit digit
 * sliding vertically 0↕1 as it flips.
 *
 * @param {Object} props
 * @param {number} [props.bitWidth=8] - Number of bits.
 * @param {boolean} [props.signed=false] - Two's-complement signed if true.
 * @param {number} [props.initial] - Starting value (default 133 unsigned / -42 signed).
 */

const AMBER = 'var(--accent)';
const AMBER_OFF = 'var(--ink-faint)';
const LABEL_OFF = 'var(--ink-faint)';
const VALUE = 'var(--ink)';

export default function IntBitViewer({ bitWidth = 8, signed = false, initial }) {
	const minVal = signed ? -(2 ** (bitWidth - 1)) : 0;
	const maxVal = signed ? 2 ** (bitWidth - 1) - 1 : 2 ** bitWidth - 1;
	const [value, setValue] = useState(() => {
		const d = initial ?? (signed ? -42 : 133);
		return Math.min(maxVal, Math.max(minVal, d));
	});

	// Unsigned bit pattern (two's complement for negatives).
	const raw = value < 0 ? value + 2 ** bitWidth : value;
	const bits = [];
	for (let i = bitWidth - 1; i >= 0; i--) {
		const weight = signed && i === bitWidth - 1 ? -(2 ** i) : 2 ** i;
		bits.push({ on: (raw >> i) & 1, weight });
	}

	return (
		<BitViewerCard
			title={`${signed ? 'signed' : 'unsigned'} int${bitWidth}`}
			slider={{
				min: minVal,
				max: maxVal,
				step: 1,
				value,
				onChange: (e) => setValue(Number(e.target.value)),
				fill: AMBER,
				ariaLabel: `${signed ? 'signed' : 'unsigned'} int${bitWidth} value`,
			}}
		>
			<div
				style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 'min-content' }}
			>
				<span
					style={{
						fontSize: '3rem',
						fontWeight: 700,
						color: VALUE,
						lineHeight: 1,
						marginRight: '0.25rem',
					}}
				>
					{value}
				</span>
				<span style={{ fontSize: '2rem', color: 'var(--ink-faint)', margin: '0 0.5rem' }}>=</span>
				{bits.map((b, i) => (
					<div
						key={i}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							minWidth: '2rem',
						}}
					>
						<span
							style={{
								fontSize: '0.85rem',
								fontWeight: b.on ? 600 : 400,
								color: b.on ? AMBER : LABEL_OFF,
								marginBottom: '0.5rem',
							}}
						>
							{b.weight}
						</span>
						<BitCell
							on={!!b.on}
							onColor={AMBER}
							offColor={AMBER_OFF}
							height="2.6rem"
							oneFontSize="2rem"
							zeroFontSize="1.25rem"
						/>
					</div>
				))}
			</div>
		</BitViewerCard>
	);
}
