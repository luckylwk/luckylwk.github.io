import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A reusable animation loop hook for timeline visualizations.
 *
 * Manages requestAnimationFrame-based animation with play/pause/reset controls.
 * The tick function receives elapsed time and should return the next progress value.
 * When the animation completes, it automatically pauses.
 *
 * @param {Function} tick - Function(progress, deltaTime) => nextProgress
 * @param {number} total - Maximum progress value (animation completes when reached)
 * @returns {Object} { progress, playing, toggle, reset, seek }
 */
export default function useAnimationLoop(tick, total) {
	const [progress, setProgress] = useState(0);
	const [playing, setPlaying] = useState(false);
	const rafRef = useRef(null);
	const lastRef = useRef(null);

	const tickCallback = useCallback(
		(now) => {
			if (lastRef.current == null) lastRef.current = now;
			const dt = now - lastRef.current;
			lastRef.current = now;
			setProgress((prev) => {
				const next = tick(prev, dt);
				if (next >= total) {
					setPlaying(false);
					return total;
				}
				rafRef.current = requestAnimationFrame(tickCallback);
				return next;
			});
		},
		[tick, total],
	);

	useEffect(() => {
		if (!playing) return;
		lastRef.current = null;
		rafRef.current = requestAnimationFrame(tickCallback);
		return () => cancelAnimationFrame(rafRef.current);
	}, [playing, tickCallback]);

	const toggle = () => {
		if (progress >= total) {
			setProgress(0);
			setPlaying(true);
		} else {
			setPlaying((p) => !p);
		}
	};

	const reset = () => {
		setPlaying(false);
		setProgress(0);
	};

	// Jump to an exact progress value, pausing playback.
	const seek = (value) => {
		setPlaying(false);
		setProgress(Math.max(0, Math.min(total, value)));
	};

	return { progress, playing, toggle, reset, seek };
}
