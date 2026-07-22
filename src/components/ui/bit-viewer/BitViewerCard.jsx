/**
 * The shared card shell for the bit visualisers: header, body, and an
 * optional range slider with a gradient fill track. Matches the "warm paper"
 * zen design system used by TimelineCard, so bit viewers sit visually
 * alongside the timeline visualisations.
 *
 * Also injects the one shared style block used by every bit viewer:
 * the `.bitv-slide` flip transition, the range-input chrome, the `.bitv-btn`
 * hover, and the reduced-motion opt-out.
 *
 * @param {Object} props
 * @param {string} props.title - Header label (mono).
 * @param {import('react').ReactNode} [props.headerRight] - Optional right-aligned header content (e.g. buttons).
 * @param {import('react').ReactNode} props.children - Body content.
 * @param {Object} [props.slider] - Optional range slider config.
 * @param {number} [props.slider.min]
 * @param {number} [props.slider.max]
 * @param {number} [props.slider.step]
 * @param {number} [props.slider.value]
 * @param {(e: import('react').ChangeEvent<HTMLInputElement>) => void} [props.slider.onChange]
 * @param {string} [props.slider.fill] - Filled-track colour.
 * @param {string} [props.slider.ariaLabel]
 */

const RULE = 'var(--rule)';
const TRACK = 'var(--rule)';

export const BIT_VIEWER_CSS = `
	.bitv-slide { transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
	input.bitv-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; outline: none; cursor: pointer; margin: 0; }
	input.bitv-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--ink); border: none; cursor: pointer; }
	input.bitv-range::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--ink); border: none; cursor: pointer; }
	.bitv-btn:hover { border-color: var(--ink-faint); }
	@media (prefers-reduced-motion: reduce) { .bitv-slide { transition: none; } }
`;

export default function BitViewerCard({ title, headerRight, children, slider }) {
	return (
		<div
			style={{
				fontFamily: 'var(--font-viz), sans-serif',
				background: 'var(--paper-card)',
				border: `1px solid ${RULE}`,
				borderRadius: '12px',
				overflow: 'hidden',
				margin: '2rem 0',
				color: 'var(--ink)',
			}}
		>
			<style>{BIT_VIEWER_CSS}</style>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0.85rem 1.25rem',
					borderBottom: `1px solid ${RULE}`,
				}}
			>
				<span
					style={{
						fontSize: '0.85rem',
						fontWeight: 500,
						color: 'var(--ink-soft)',
						letterSpacing: '0.02em',
					}}
				>
					{title}
				</span>
				{headerRight}
			</div>

			<div
				style={{
					padding: '1.25rem',
					borderBottom: slider ? `1px solid ${RULE}` : 'none',
					overflowX: 'auto',
				}}
			>
				{children}
			</div>

			{slider && (
				<div style={{ padding: '1.1rem 1.25rem' }}>
					<input
						className="bitv-range"
						type="range"
						min={slider.min}
						max={slider.max}
						step={slider.step}
						value={slider.value}
						aria-label={slider.ariaLabel}
						onChange={slider.onChange}
						style={{
							background: `linear-gradient(to right, ${slider.fill} 0%, ${slider.fill} ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, ${TRACK} ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, ${TRACK} 100%)`,
						}}
					/>
				</div>
			)}
		</div>
	);
}
