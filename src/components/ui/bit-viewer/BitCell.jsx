/**
 * A single bit cell: a bold "1" stacked over an outlined "0", clipped to one
 * row. Toggling `on` slides the column vertically (0↕1) via a CSS transform.
 * The `.bitv-slide` transition and reduced-motion rule live in the shared
 * style block injected by BitViewerCard.
 *
 * @param {Object} props
 * @param {boolean} props.on - Whether the bit is set (shows "1").
 * @param {string} props.onColor - Colour of the set "1".
 * @param {string} props.offColor - Colour of the unset "0" pill outline.
 * @param {string} props.height - Cell height (also the slide distance).
 * @param {string} props.oneFontSize - Font size of the "1".
 * @param {string} props.zeroFontSize - Font size of the "0".
 */
export default function BitCell({ on, onColor, offColor, height, oneFontSize, zeroFontSize }) {
	return (
		<div style={{ height, overflow: 'hidden', width: '100%' }}>
			<div
				className="bitv-slide"
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					transform: on ? 'translateY(0)' : `translateY(-${height})`,
				}}
			>
				<span
					style={{
						height,
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: 'var(--font-ui), monospace',
						fontSize: oneFontSize,
						fontWeight: 700,
						color: onColor,
						lineHeight: 1,
					}}
				>
					1
				</span>
				<span
					style={{
						height,
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<span
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '1.15em',
							height: '1.62em',
							border: `2px solid ${offColor}`,
							borderRadius: '999px',
							fontFamily: 'var(--font-ui), monospace',
							fontSize: zeroFontSize,
							color: offColor,
							lineHeight: 1,
						}}
					>
						0
					</span>
				</span>
			</div>
		</div>
	);
}
