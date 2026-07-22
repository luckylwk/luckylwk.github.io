import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Inline citation marker (island).
 *
 * Renders a superscript bracketed number — `[1]` — that links down to the
 * matching entry in the References appendix. Hovering or keyboard-focusing the
 * marker (desktop) or tapping it (touch) reveals a small popover with the
 * source's title, author, publication and date. Escape or an outside click
 * closes it.
 *
 * The number is derived from the reference's position in the shared `refs`
 * array, so it always matches the appendix ordering.
 *
 * Usage: <Cite id="ngrok-quant" refs={references} client:visible />
 */
export default function Cite({ id, refs = [] }) {
	const index = refs.findIndex((r) => r.id === id);
	const ref = index === -1 ? null : refs[index];

	const [open, setOpen] = useState(false);
	const wrapRef = useRef(null);
	const tipId = useId();

	// Close on outside click / tap and on Escape.
	useEffect(() => {
		if (!open) return;
		const onPointer = (e) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
		};
		const onKey = (e) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	const show = useCallback(() => setOpen(true), []);
	const hide = useCallback(() => setOpen(false), []);
	const toggle = useCallback((e) => {
		// Let the anchor still navigate to the appendix on click, but on touch
		// the first tap should reveal the popover rather than jump away.
		if (e.pointerType === 'touch' || e.pointerType === '') {
			e.preventDefault();
			setOpen((v) => !v);
		}
	}, []);

	// Unknown id: render nothing rather than a broken marker.
	if (!ref) return null;

	const num = index + 1;

	return (
		<span
			ref={wrapRef}
			style={{ position: 'relative', whiteSpace: 'nowrap' }}
			onMouseEnter={show}
			onMouseLeave={hide}
		>
			<sup>
				<a
					href={`#ref-${ref.id}`}
					aria-describedby={open ? tipId : undefined}
					onFocus={show}
					onBlur={hide}
					onPointerDown={toggle}
					style={{
						fontFamily: 'var(--font-ui)',
						fontSize: '0.72em',
						fontWeight: 600,
						color: 'var(--accent)',
						textDecoration: 'none',
						padding: '0 0.05em',
					}}
				>
					[{num}]
				</a>
			</sup>
			{open && (
				<span
					id={tipId}
					role="tooltip"
					style={{
						position: 'absolute',
						bottom: 'calc(100% + 0.4rem)',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 20,
						width: 'max-content',
						maxWidth: 'min(18rem, 80vw)',
						whiteSpace: 'normal',
						textAlign: 'left',
						background: '#fff',
						border: '1px solid var(--rule)',
						borderRadius: '6px',
						boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
						padding: '0.6rem 0.75rem',
						fontFamily: 'var(--font-ui)',
						fontSize: '0.74rem',
						lineHeight: 1.5,
						color: 'var(--ink-soft)',
					}}
				>
					<span style={{ display: 'block', color: 'var(--ink)', fontWeight: 600 }}>
						{ref.title}
					</span>
					<span style={{ display: 'block', color: 'var(--ink-faint)', marginTop: '0.15rem' }}>
						{[ref.author, ref.source, ref.date].filter(Boolean).join(' · ')}
					</span>
				</span>
			)}
		</span>
	);
}
