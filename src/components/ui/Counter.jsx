import { useState } from 'react';

/**
 * A minimal interactive island: local state only, no external data.
 * Used to demonstrate React hydration inside MDX posts.
 */
const buttonStyle = {
	border: '1px solid var(--rule)',
	borderRadius: '3px',
	background: 'var(--paper)',
	color: 'var(--ink)',
	width: '1.9rem',
	height: '1.9rem',
	fontSize: '1rem',
	lineHeight: 1,
	cursor: 'pointer',
};

export default function Counter({ start = 0 }) {
	const [count, setCount] = useState(start);

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '1.25rem',
				padding: '0.5rem 1rem',
				border: '1px solid var(--rule)',
				borderRadius: '4px',
				fontFamily: 'var(--font-ui)',
			}}
		>
			<button
				type="button"
				onClick={() => setCount((c) => c - 1)}
				aria-label="Decrement"
				style={buttonStyle}
			>
				−
			</button>
			<strong style={{ minWidth: '3ch', textAlign: 'center', fontWeight: 500 }}>{count}</strong>
			<button
				type="button"
				onClick={() => setCount((c) => c + 1)}
				aria-label="Increment"
				style={buttonStyle}
			>
				+
			</button>
		</div>
	);
}
