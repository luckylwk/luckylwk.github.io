import useAnimationLoop from './ui/hooks/useAnimationLoop';
import TimelineCard from './ui/TimelineCard';

/**
 * A waterfall view of prefill vs decode as forward passes (island).
 *
 * A staircase: the sequence runs left-to-right across columns (token positions)
 * and each forward pass is a row stacked top-to-bottom (time). Every computed
 * cell is drawn as two joined blocks
 * that fill left-to-right: a memory load (warm) then the math (green sliver),
 * matching AutoregressiveTimeline.
 *
 * The point is the pass count. Prefill swallows the whole prompt in ONE pass —
 * for a short prompt that costs about as much wall-clock as generating a single
 * token — so it's drawn as one block, not one per prompt token. Decode then
 * spends a full pass on every token, reusing the cached keys and values (faint
 * green) from every earlier position. Collapsing that tower of decode passes
 * back toward a single pass is exactly what speculative decoding chases.
 *
 * Light "warm paper" card matching the site's zen design system: hairline
 * borders, recessed tracks, one warm accent, no shadows or gradients.
 */

const PROMPT = ['The', 'quick', 'brown', 'fox'];
const DECODED = ['jumps', 'over', 'the', 'lazy', 'dog', '.'];
const TOKENS = [...PROMPT, ...DECODED];
const N = TOKENS.length;

// Rows (forward passes): row 0 is the prefill pass over the whole prompt; each
// later row is one decode pass that produces the next token.
// A row's `hot` cells are the positions computed in that pass; `newAt` is the
// column the pass emits (its output token, which becomes the next row's input).
// Prefill is drawn as a SINGLE block (hot: [0]): for a short prompt it costs
// about one decode pass, so it reads as one block rather than one per token.
const ROWS = [
	{ kind: 'prefill', hot: [0], newAt: PROMPT.length },
	...DECODED.map((_, i) => {
		const pos = PROMPT.length + i; // the token being fed in this pass
		return { kind: 'decode', hot: [pos], newAt: pos + 1 };
	}),
];
// Drop the final row's phantom output (nothing consumes it in the view).
ROWS[ROWS.length - 1].newAt = null;
const NROWS = ROWS.length;

// SVG coordinate space (scales to 100% width via viewBox).
const PL = 116; // left gutter for row labels
const PR = 24;
const PT = 38; // top gutter for the prompt/generated headers (with a little breathing room)
const LABEL_Y = 22; // baseline for the top labels + legend
const CELL = 74;
const GAP = 8;
const ROW_H = 44;
const ROW_GAP = 10;
const OUTPUT_GAP = 18; // extra space between the grid and the output row
const JOINT = 3; // hairline gap between a cell's memory and compute blocks
const MEM_FRAC = 0.85; // memory share of every cell's width (memory-bound, one split for all)
const GRID_W = N * CELL + (N - 1) * GAP;
const W = PL + GRID_W + PR;

const colX = (c) => PL + c * (CELL + GAP);
const rowY = (r) => PT + r * (ROW_H + ROW_GAP);
const OUTPUT_Y = rowY(NROWS - 1) + ROW_H + OUTPUT_GAP;
const H = OUTPUT_Y + ROW_H + 14;

const MEM = 'var(--accent)'; // memory load (warm, dominant in decode)
const COMPUTE = '#5f7d6e'; // the math (green, dominant in prefill)
const CACHE = '#5f7d6e'; // reused keys/values — same green, kept faint
const IDLE = 'var(--paper-inset)';
const INK = 'var(--ink)';
const INK_SOFT = 'var(--ink-soft)';
const INK_FAINT = 'var(--ink-faint)';
const RULE = 'var(--rule)';

// Legend swatches (top-right), matching the block fills.
const LEGEND = [
	{ label: 'memory', fill: MEM, opacity: 1 },
	{ label: 'compute', fill: COMPUTE, opacity: 1 },
	{ label: 'kv cache', fill: CACHE, opacity: 0.32 },
];
const LEGEND_STEP = 82; // horizontal spacing between legend items
const LEGEND_X0 = PL + GRID_W - LEGEND.length * LEGEND_STEP + 12; // right-aligned to the grid

const MS_PER_ROW = 950;

const tick = (prev, dt) => prev + dt / MS_PER_ROW;

export default function PrefillVsDecodeCompute() {
	const { progress: step, playing, toggle, reset } = useAnimationLoop(tick, NROWS);

	// Output-row token colour. Prompt tokens are given (black from the start).
	// A generated token is grey while the pass that emits it is running its
	// memory+compute block, then turns black once that pass finishes — so it
	// commits one full pass after its input.
	const tokenFill = (c) => {
		if (c < PROMPT.length) return INK; // prompt is given
		const rIdx = ROWS.findIndex((r) => r.newAt === c);
		if (rIdx < 0 || step < rIdx) return RULE; // not being computed yet
		return step >= rIdx + 1 ? INK : INK_FAINT; // black when done, grey while computing
	};

	return (
		<TimelineCard
			title="Prefill & Autoregressive Decode"
			playing={playing}
			progress={step}
			total={NROWS}
			onToggle={toggle}
			onReset={reset}
			footer={
				<>
					Every forward pass streams the weights (memory, warm) and then runs the math (compute, the
					green sliver). Prefill does the whole prompt in a single pass — for a short prompt that's
					about the wall-clock of generating one token — so it's one block, not one per prompt token.
					Decode then spends a full pass on every token, reusing the cached keys and values (faint
					green) from every earlier position. Collapsing that tower of decode passes back toward a
					single pass is exactly what speculative decoding chases.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				width="100%"
				style={{ minWidth: '40rem', display: 'block', userSelect: 'none' }}
				aria-label="Forward passes: prefill is a single block for the whole prompt; decode is one pass per token"
			>
				{/* prompt / generated headers + boundary */}
				<line
					x1={colX(PROMPT.length) - GAP / 2}
					x2={colX(PROMPT.length) - GAP / 2}
					y1={8}
					y2={OUTPUT_Y + ROW_H + 6}
					stroke={RULE}
					strokeWidth="1"
				/>
				<text
					x={colX(0)}
					y={LABEL_Y}
					textAnchor="start"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px', fontWeight: 700 }}
				>
					PROMPT
				</text>
				<text
					x={colX(PROMPT.length)}
					y={LABEL_Y}
					textAnchor="start"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px', fontWeight: 700 }}
				>
					GENERATED
				</text>

				{/* legend, top-right */}
				{LEGEND.map((it, i) => {
					const x = LEGEND_X0 + i * LEGEND_STEP;
					return (
						<g key={`legend-${it.label}`}>
							<rect
								x={x}
								y={LABEL_Y - 9}
								width={11}
								height={11}
								rx="2"
								fill={it.fill}
								opacity={it.opacity}
							/>
							<text
								x={x + 16}
								y={LABEL_Y}
								textAnchor="start"
								fill={INK_SOFT}
								style={{ fontSize: '11px' }}
							>
								{it.label}
							</text>
						</g>
					);
				})}

				{ROWS.map((row, r) => {
					const shown = step > r; // row has started animating
					const rowProgress = Math.max(0, Math.min(1, step - r));
					const y = rowY(r);
					const isPrefill = row.kind === 'prefill';
					return (
						<g key={`row-${r}`} opacity={shown ? 1 : 0.18}>
							{/* row label */}
							<text
								x={PL - 14}
								y={y + ROW_H / 2 - 3}
								textAnchor="end"
								fill={isPrefill ? MEM : INK_SOFT}
								style={{ fontSize: '12px', fontWeight: 700 }}
							>
								{isPrefill ? 'prefill' : `decode ${r}`}
							</text>
							<text
								x={PL - 14}
								y={y + ROW_H / 2 + 13}
								textAnchor="end"
								fill={INK_FAINT}
								style={{ fontSize: '10px' }}
							>
								pass {r + 1}
							</text>

							{TOKENS.map((_, c) => {
								const isHot = row.hot.includes(c);
								// Cells left of the hot region are cached (KV cache) in decode rows;
								// in prefill everything active is hot.
								const isCache = !isHot && c < (isPrefill ? row.hot.length : row.hot[0]);
								if (isHot) {
									// Two joined blocks — memory (warm) then compute (green), identical for
									// every pass. They fill left-to-right as the pass sweeps across the cell,
									// matching AutoregressiveTimeline: memory streams first, then the math.
									const memFull = CELL * MEM_FRAC - JOINT / 2;
									const compFull = CELL * (1 - MEM_FRAC) - JOINT / 2;
									const sweep = rowProgress * CELL; // playhead across the cell
									const memW = Math.min(sweep, memFull);
									const compW = Math.min(Math.max(sweep - CELL * MEM_FRAC, 0), compFull);
									const compX = colX(c) + CELL * MEM_FRAC + JOINT / 2;
									return (
										<g key={`c-${r}-${c}`}>
											{memW > 0.5 && (
												<rect x={colX(c)} y={y} width={memW} height={ROW_H} fill={MEM} rx="5" />
											)}
											{compW > 0.5 && (
												<rect x={compX} y={y} width={compW} height={ROW_H} fill={COMPUTE} rx="4" />
											)}
										</g>
									);
								}
								return (
									<rect
										key={`c-${r}-${c}`}
										x={colX(c)}
										y={y}
										width={CELL}
										height={ROW_H}
										fill={isCache ? CACHE : IDLE}
										rx="5"
										opacity={isCache ? (shown ? 0.32 : 0) : 0.5}
									/>
								);
							})}

							{/* arrow: this pass emits a new token into the next column */}
							{row.newAt != null && step > r + 0.5 && (
								<text
									x={colX(row.newAt) + CELL / 2}
									y={y + ROW_H / 2 + 5}
									textAnchor="middle"
									fill={INK_SOFT}
									style={{ fontSize: '14px', fontWeight: 700 }}
									opacity={Math.min(1, (step - r - 0.5) * 2)}
								>
									↳
								</text>
							)}
						</g>
					);
				})}

				{/* OUTPUT row: the generated sequence assembles along the bottom */}
				<text
					x={PL - 14}
					y={OUTPUT_Y + ROW_H / 2 - 3}
					textAnchor="end"
					fill={INK_SOFT}
					style={{ fontSize: '12px', fontWeight: 700 }}
				>
					output
				</text>
				<text
					x={PL - 14}
					y={OUTPUT_Y + ROW_H / 2 + 13}
					textAnchor="end"
					fill={INK_FAINT}
					style={{ fontSize: '10px' }}
				>
					the tokens
				</text>
				<rect x={PL} y={OUTPUT_Y} width={GRID_W} height={ROW_H} fill={IDLE} rx="6" opacity="0.5" />
				{TOKENS.map((tok, c) => (
					<text
						key={`out-${c}`}
						x={colX(c) + CELL / 2}
						y={OUTPUT_Y + ROW_H / 2 + 5}
						textAnchor="middle"
						fill={tokenFill(c)}
						style={{ fontSize: '14px', fontWeight: 600 }}
					>
						{tok}
					</text>
				))}
			</svg>
		</TimelineCard>
	);
}
