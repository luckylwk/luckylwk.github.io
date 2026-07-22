/**
 * A shared card shell for timeline visualizations.
 *
 * Provides consistent layout with header (title + play/reset buttons),
 * SVG content area, readouts section, and optional footer.
 * Matches the "warm paper" zen design system.
 *
 * @param {Object} props
 * @param {string} props.title - Header label
 * @param {boolean} props.playing - Current play state
 * @param {number} props.progress - Current animation progress
 * @param {number} props.total - Maximum progress value
 * @param {Function} props.onToggle - Play/pause toggle handler
 * @param {Function} props.onReset - Reset handler
 * @param {Function} [props.onStepBack] - Optional step-backward handler (shows a ‹ button)
 * @param {Function} [props.onStepForward] - Optional step-forward handler (shows a › button)
 * @param {import('react').ReactNode} props.children - SVG content
 * @param {import('react').ReactNode} [props.readouts] - Optional readouts section
 * @param {import('react').ReactNode} [props.footer] - Optional footer content
 */

const INK = 'var(--ink)';
const INK_SOFT = 'var(--ink-soft)';
const INK_FAINT = 'var(--ink-faint)';
const RULE = 'var(--rule)';

const btnStyle = {
	height: '2rem',
	padding: '0 0.8rem',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'transparent',
	border: `1px solid ${RULE}`,
	borderRadius: '6px',
	color: INK_SOFT,
	fontSize: '0.8rem',
	cursor: 'pointer',
	fontFamily: 'inherit',
};

export default function TimelineCard({
	title,
	playing,
	progress,
	total,
	onToggle,
	onReset,
	onStepBack,
	onStepForward,
	children,
	readouts,
	footer,
}) {
	const playLabel = progress >= total ? '↻ replay' : playing ? '❚❚ pause' : '▶ play';

	return (
		<div
			style={{
				fontFamily: 'var(--font-viz), sans-serif',
				background: 'var(--paper-card)',
				border: `1px solid ${RULE}`,
				borderRadius: '12px',
				overflow: 'hidden',
				margin: '2rem 0',
				color: INK,
			}}
		>
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
					style={{ fontSize: '0.85rem', fontWeight: 500, color: INK_SOFT, letterSpacing: '0.02em' }}
				>
					{title}
				</span>
				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<button type="button" onClick={onToggle} style={btnStyle}>
						{playLabel}
					</button>
					{onStepBack && (
						<button
							type="button"
							onClick={onStepBack}
							disabled={progress <= 0}
							aria-label="Step back"
							style={{
								...btnStyle,
								width: '2rem',
								padding: 0,
								fontSize: '1.1rem',
								lineHeight: 1,
								opacity: progress <= 0 ? 0.4 : 1,
							}}
						>
							‹
						</button>
					)}
					{onStepForward && (
						<button
							type="button"
							onClick={onStepForward}
							disabled={progress >= total}
							aria-label="Step forward"
							style={{
								...btnStyle,
								width: '2rem',
								padding: 0,
								fontSize: '1.1rem',
								lineHeight: 1,
								opacity: progress >= total ? 0.4 : 1,
							}}
						>
							›
						</button>
					)}
					<button
						type="button"
						onClick={onReset}
						aria-label="Reset"
						style={{ ...btnStyle, width: '2rem', padding: 0, fontSize: '1.1rem', lineHeight: 1 }}
					>
						↺
					</button>
				</div>
			</div>

			<div style={{ padding: '0.5rem 1rem 0.25rem', overflowX: 'auto' }}>{children}</div>

			{readouts && (
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: '0.75rem',
						padding: '0.6rem 1.25rem',
					}}
				>
					{readouts}
				</div>
			)}

			{footer && (
				<p
					style={{
						margin: 0,
						padding: '0.75rem 1.25rem 0.9rem',
						borderTop: `1px solid ${RULE}`,
						fontSize: '0.68rem',
						lineHeight: 1.55,
						color: INK_FAINT,
					}}
				>
					{footer}
				</p>
			)}
		</div>
	);
}
