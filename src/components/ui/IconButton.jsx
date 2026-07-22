/**
 * A reusable icon button component for visualization controls.
 *
 * Standardized styling for icon-only buttons (reset, play/pause controls).
 * Matches the "warm paper" theme used across the site's visualizations.
 *
 * @param {Object} props
 * @param {string} props.icon - Icon character or emoji to display
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.ariaLabel] - Accessibility label
 * @param {string} [props.size='2rem'] - Button width/height
 * @param {string} [props.fontSize='1.1rem'] - Icon font size
 */

const iconBtnStyle = {
	width: '2rem',
	height: '2rem',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'transparent',
	border: '1px solid var(--rule)',
	borderRadius: '6px',
	color: 'var(--ink-soft)',
	fontSize: '1.1rem',
	lineHeight: 1,
	cursor: 'pointer',
};

export default function IconButton({
	icon,
	onClick,
	ariaLabel,
	size = '2rem',
	fontSize = '1.1rem',
}) {
	return (
		<button
			type="button"
			className="bitv-btn"
			onClick={onClick}
			aria-label={ariaLabel}
			style={{ ...iconBtnStyle, width: size, height: size, fontSize }}
		>
			{icon}
		</button>
	);
}
