import useAnimationLoop from './ui/hooks/useAnimationLoop';
import TimelineCard from './ui/TimelineCard';

/**
 * Speculative decoding as one chronological staircase (island).
 *
 * A single interleaved timeline in the shared forward-pass grid language —
 * columns are token positions, rows are steps in time, and every pass is the
 * same memory-load (warm) + compute (green sliver) two-block:
 *
 *   PREFILL   one wide target pass over the whole prompt
 *   DECODE    one ordinary decode step — the entire model streamed from memory
 *             for a SINGLE token; the expensive baseline the trick beats
 *   then, per speculative round (the staircase shifts right as text commits):
 *   DRAFTER   the small draft model flicks out K tiny passes — almost no
 *             weights to stream, so each is a mostly-green sliver
 *   VERIFIER  the big target model checks all K guesses in ONE wide pass —
 *             the prefill trick applied to decoding
 *   DRAFTED   the verdicts: the matching prefix is kept (sage ✓), the first
 *             miss struck (warm-red ✕) with the target's own token committed
 *             in its place, and later guesses discarded (faint ✕)
 *   OUTCOME   the committed text at the bottom, prompt | generated
 *
 * Same tokens and two-block language as PrefillVsDecodeCompute, so the payoff
 * is direct: 9 tokens from 4 target passes where plain decoding needs 10.
 *
 * Light "warm paper" card matching the site's zen design system: hairline
 * borders, recessed tracks, muted accents, no shadows or gradients.
 */

const PROMPT = ['The', 'quick', 'brown', 'fox'];
const DECODE_TOKEN = 'jumps'; // one ordinary decode pass — the baseline beat
const K = 4; // draft length (guesses per round)

// Scripted rounds. `accepted` = how many leading guesses the target confirms;
// the next guess is the first miss, and `correction` is the token the target
// supplies in its place (null = the target stops here).
const RAW_ROUNDS = [
	{ proposals: ['over', 'the', 'lazy', 'cat'], accepted: 3, correction: 'dog' },
	{ proposals: ['and', 'runs', 'away', '!'], accepted: 3, correction: '.' },
];

// Enrich each round with grid coordinates: `base` is its first generated
// column, `beat0` its first beat, `committed` the tokens it commits.
const ROUNDS = [];
{
	let base = PROMPT.length + 1; // prompt + the ordinary decode token
	let beat0 = 2; // beats 0–1 are prefill + decode
	for (const rd of RAW_ROUNDS) {
		const committed = rd.proposals.slice(0, rd.accepted);
		if (rd.correction) committed.push(rd.correction);
		ROUNDS.push({ ...rd, base, beat0, committed, committedCount: committed.length });
		base += committed.length;
		beat0 += 3; // draft + verify + resolve
	}
}
const NCOLS = Math.max(...ROUNDS.map((r) => r.base + r.proposals.length));

// Animation is stepped in "beats": prefill, decode, then per round one draft
// beat (the K slivers cascade inside it), one verify beat, one resolve beat.
const draftBeat = (r) => ROUNDS[r].beat0;
const verifyBeat = (r) => ROUNDS[r].beat0 + 1;
const resolveBeat = (r) => ROUNDS[r].beat0 + 2;

// Stagger of the K draft slivers (and their tokens) inside the draft beat.
const SLIVER_STAGGER = 0.2;
const SLIVER_DUR = 0.35;
const sliverStart = (r, pi) => draftBeat(r) + pi * SLIVER_STAGGER;
const sliverDone = (r, pi) => sliverStart(r, pi) + SLIVER_DUR;

// The committed output sequence and, per column, its provenance + landing beat.
const COMMITTED = [...PROMPT, DECODE_TOKEN];
const OUT_ROLE = [...PROMPT.map(() => 'prompt'), 'decode'];
const OUT_BEAT = [...PROMPT.map(() => -1), 1];
ROUNDS.forEach((r, ri) => {
	r.committed.forEach((tok, j) => {
		COMMITTED.push(tok);
		OUT_ROLE.push(j < r.accepted ? 'accept' : 'correction');
		OUT_BEAT.push(resolveBeat(ri));
	});
});
const N_GEN = COMMITTED.length - PROMPT.length;

// The phase of each beat, in order — the single source of truth for the timeline.
const BEATS = ['prefill', 'decode'];
ROUNDS.forEach(() => BEATS.push('draft', 'verify', 'resolve'));
const NBEATS = BEATS.length;

// SVG coordinate space (scales to 100% width via viewBox).
const PL = 128; // left gutter for row labels
const PR = 20;
const CELL = 56;
const GAP = 6;
const GRID_W = NCOLS * CELL + (NCOLS - 1) * GAP;
const W = PL + GRID_W + PR;

const PT = 34; // top band: legend
const HEADER_Y = 20;
const TARGET_H = 38; // target-model pass rows
const DRAFT_H = TARGET_H; // drafter rows — same height as the target passes
const VERDICT_H = 34; // drafted/verdict rows
const ROW_GAP = 10;
const ROUND_GAP = 8; // extra breathing room before each round
const SLIVER_W = 12;

// Row y-positions, laid out top-to-bottom in strict story order.
const ROW = { drafter: [], verifier: [], drafted: [] };
{
	let y = PT;
	ROW.prefill = y;
	y += TARGET_H + ROW_GAP;
	ROW.decode = y;
	y += TARGET_H + ROW_GAP;
	for (let i = 0; i < ROUNDS.length; i++) {
		y += ROUND_GAP;
		ROW.drafter.push(y);
		y += DRAFT_H + ROW_GAP;
		ROW.verifier.push(y);
		y += TARGET_H + ROW_GAP;
		ROW.drafted.push(y);
		y += VERDICT_H + ROW_GAP;
	}
	ROW.outLabel = y + 10;
	ROW.out = y + 18;
}
const OUT_H = 36;
const H = ROW.out + OUT_H + 14;

const colX = (c) => PL + c * (CELL + GAP);

const MEM = 'var(--accent)'; // memory load (warm, dominant in target passes)
const COMPUTE = '#5f7d6e'; // the math (sage) + the cheap draft model
const ACCEPT = '#5f7d6e'; // confirmed guesses
const REJECT = '#b0503f'; // the first miss (+ faint discards)
const CORRECT = 'var(--accent)'; // the target's own replacement token
const CACHE = '#5f7d6e'; // reused keys/values — faint green, matches PrefillVsDecodeCompute
const IDLE = 'var(--paper-inset)';
const INK = 'var(--ink)';
const INK_SOFT = 'var(--ink-soft)';
const INK_FAINT = 'var(--ink-faint)';
const RULE = 'var(--rule)';

const LEGEND = [
	{ label: 'memory', fill: MEM, opacity: 1 },
	{ label: 'compute', fill: COMPUTE, opacity: 1 },
	{ label: 'kv cache', fill: CACHE, opacity: 0.32 },
	{ label: 'accept', fill: ACCEPT, opacity: 0.5 },
	{ label: 'reject', fill: REJECT, opacity: 0.75 },
	{ label: 'correct', fill: CORRECT, opacity: 0.6 },
];
const LEGEND_STEP = 72;
const LEGEND_X0 = PL + GRID_W - LEGEND.length * LEGEND_STEP + 10;

const MS_PER_BEAT = 620;
const tick = (prev, dt) => prev + dt / MS_PER_BEAT;

const clamp01 = (x) => Math.max(0, Math.min(1, x));

const dividerX = colX(PROMPT.length) - GAP / 2;

// Two joined blocks — memory (warm) then compute (sage) — sweeping left-to-right,
// identical to AutoregressiveTimeline / PrefillVsDecodeCompute.
const twoBlock = (x, y, w, h, memFrac, prog, rx = 5) => {
	const joint = 3;
	const sweep = prog * w;
	const memW = Math.min(sweep, w * memFrac - joint / 2);
	const compW = Math.min(Math.max(sweep - w * memFrac, 0), w * (1 - memFrac) - joint / 2);
	const compX = x + w * memFrac + joint / 2;
	return (
		<>
			{memW > 0.5 && <rect x={x} y={y} width={memW} height={h} fill={MEM} rx={rx} />}
			{compW > 0.5 && (
				<rect x={compX} y={y} width={compW} height={h} fill={COMPUTE} rx={Math.max(2, rx - 1)} />
			)}
		</>
	);
};

// Gutter label: bold row name + faint sub-line, right-aligned like the siblings.
const RowLabel = ({ y, h, main, sub, color }) => (
	<>
		<text
			x={PL - 12}
			y={y + h / 2 - 2}
			textAnchor="end"
			fill={color}
			style={{ fontSize: '12px', fontWeight: 700 }}
		>
			{main}
		</text>
		<text
			x={PL - 12}
			y={y + h / 2 + 11}
			textAnchor="end"
			fill={INK_FAINT}
			style={{ fontSize: '10px' }}
		>
			{sub}
		</text>
	</>
);

// Faint-green KV-cache cells over the already-computed columns [0, count) —
// the reused keys/values a pass streams for every earlier position.
const CacheCells = ({ count, y, keyBase }) =>
	Array.from({ length: count }, (_, c) => (
		<rect
			key={`${keyBase}-${c}`}
			x={colX(c)}
			y={y}
			width={CELL}
			height={TARGET_H}
			rx="5"
			fill={CACHE}
			opacity={0.32}
		/>
	));

export default function SpeculativeDecoding() {
	const { progress: step, playing, toggle, reset, seek } = useAnimationLoop(tick, NBEATS);

	// Step to whole-beat boundaries: forward completes the active beat, back
	// rewinds to its start (a completed beat, mid-beat, rewinds to that beat).
	const stepBack = () => seek(Math.max(0, Math.ceil(step - 1)));
	const stepForward = () => seek(Math.min(NBEATS, Math.floor(step + 1)));

	// Readouts.
	let draftDone = 0;
	let verifiesStarted = 0;
	let resolvedRounds = 0;
	let resolvedCommits = 0;
	ROUNDS.forEach((r, ri) => {
		r.proposals.forEach((_, pi) => {
			if (step > sliverDone(ri, pi)) draftDone++;
		});
		if (step > verifyBeat(ri)) verifiesStarted++;
		if (step > resolveBeat(ri)) {
			resolvedRounds++;
			resolvedCommits += r.committedCount;
		}
	});
	const targetPasses = (step > 0 ? 1 : 0) + (step > 1 ? 1 : 0) + verifiesStarted;
	const perPass = resolvedRounds > 0 ? (resolvedCommits / resolvedRounds).toFixed(1) : '—';

	return (
		<TimelineCard
			title="Speculative Decoding — a draft model guesses, the target verifies"
			playing={playing}
			progress={step}
			total={NBEATS}
			onToggle={toggle}
			onReset={reset}
			onStepBack={stepBack}
			onStepForward={stepForward}
			readouts={
				<>
					<div style={{ fontSize: '0.8rem', color: INK_FAINT }}>
						<span style={{ color: MEM, fontWeight: 700 }}>{targetPasses}</span> target passes ·{' '}
						<span style={{ color: COMPUTE }}>{draftDone}</span> draft passes ·{' '}
						<span style={{ color: INK_SOFT, fontWeight: 700 }}>{perPass}</span> tokens / verify
						<span style={{ color: INK_FAINT }}> · plain decode: {N_GEN} passes</span>
					</div>
				</>
			}
			footer={
				<>
					A schematic, not a benchmark: the block sizes here are illustrative only and do{' '}
					<span style={{ fontStyle: 'italic' }}>not</span> reflect the true ratio of memory to
					compute, or the real cost of any single pass — they are drawn to make the sequence
					legible, not to scale. What they show is the trick: a tiny draft model guesses {K} tokens
					ahead in a blink, and the expensive target model checks the whole batch in one pass,
					reusing its cached keys and values (faint green) for every earlier position. Everything
					up to the first wrong guess is kept, and the rejection itself yields the target's
					corrected token for free — {N_GEN} tokens from {2 + ROUNDS.length} target passes instead of {1 + N_GEN}.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				width="100%"
				style={{ minWidth: '52rem', display: 'block', userSelect: 'none' }}
				aria-label="Speculative decoding as one timeline: prefill, one ordinary decode pass, then rounds of cheap draft guesses verified by the target model in single wide passes"
			>
				{/* prompt / generated boundary, full height down to the outcome row */}
				<line
					x1={dividerX}
					x2={dividerX}
					y1={12}
					y2={ROW.out + OUT_H + 6}
					stroke={RULE}
					strokeWidth="1"
				/>

				{/* legend, top-right */}
				{LEGEND.map((it, i) => {
					const x = LEGEND_X0 + i * LEGEND_STEP;
					return (
						<g key={`legend-${it.label}`}>
							<rect
								x={x}
								y={HEADER_Y - 9}
								width={11}
								height={11}
								rx="2"
								fill={it.fill}
								opacity={it.opacity}
							/>
							<text
								x={x + 15}
								y={HEADER_Y}
								textAnchor="start"
								fill={INK_SOFT}
								style={{ fontSize: '10.5px' }}
							>
								{it.label}
							</text>
						</g>
					);
				})}

				{/* ============================== PREFILL ============================== */}
				{(() => {
					const y = ROW.prefill;
					const x0 = colX(0);
					const prog = clamp01(step);
					return (
						<g key="prefill">
							<RowLabel y={y} h={TARGET_H} main="prefill" sub="target · pass 1" color={MEM} />
							<rect x={x0} y={y} width={CELL} height={TARGET_H} rx="6" fill={IDLE} opacity="0.5" />
							{step > 0 && twoBlock(x0, y, CELL, TARGET_H, 0.85, prog, 6)}
						</g>
					);
				})()}

				{/* ============================== DECODE =============================== */}
				{(() => {
					const y = ROW.decode;
					const x0 = colX(PROMPT.length);
					const prog = clamp01(step - 1);
					return (
						<g key="decode">
							<RowLabel y={y} h={TARGET_H} main="decode" sub="target · pass 2" color={MEM} />
							{step > 1 && <CacheCells count={PROMPT.length} y={y} keyBase="decode-cache" />}
							<rect x={x0} y={y} width={CELL} height={TARGET_H} rx="6" fill={IDLE} opacity="0.5" />
							{step > 1 && twoBlock(x0, y, CELL, TARGET_H, 0.85, prog, 6)}
							{step > 1 && (
								<text
									x={x0 + CELL + 10}
									y={y + TARGET_H / 2 + 4}
									textAnchor="start"
									fill={INK_FAINT}
									style={{ fontSize: '10.5px' }}
									opacity={clamp01(prog * 1.4)}
								>
									the whole model streamed in → one token: “{DECODE_TOKEN}”
								</text>
							)}
						</g>
					);
				})()}

				{/* ======================== SPECULATIVE ROUNDS ========================= */}
				{ROUNDS.map((r, ri) => {
					const vB = verifyBeat(ri);
					const rB = resolveBeat(ri);
					const yDraft = ROW.drafter[ri];
					const yVerify = ROW.verifier[ri];
					const yVerdict = ROW.drafted[ri];
					const x0 = colX(r.base);
					const draftProg = clamp01((step - draftBeat(ri)) / SLIVER_DUR);
					const sweep = clamp01(step - vB);
					const appear = clamp01(step - rB);
					const resolved = step > rB;
					return (
						<g key={`round-${ri}`}>
							{/* drafter: one small mostly-compute pass, left-aligned — the cheap draft model */}
							<RowLabel
								y={yDraft}
								h={DRAFT_H}
								main="drafter"
								sub={`small model · ${r.proposals.length} passes`}
								color={COMPUTE}
							/>
							<rect
								x={x0}
								y={yDraft}
								width={SLIVER_W}
								height={DRAFT_H}
								rx="3"
								fill={IDLE}
								opacity={draftProg > 0 ? 0 : 0.4}
							/>
							{draftProg > 0 && (
								<g opacity={0.9}>{twoBlock(x0, yDraft, SLIVER_W, DRAFT_H, 0.3, draftProg, 3)}</g>
							)}

							{/* verifier: ONE wide target pass sweeping all K guess columns */}
							<RowLabel
								y={yVerify}
								h={TARGET_H}
								main="verifier"
								sub={`target · pass ${ri + 3}`}
								color={MEM}
							/>
							{step > vB && <CacheCells count={r.base} y={yVerify} keyBase={`verify-cache-${ri}`} />}
							<rect
								x={x0}
								y={yVerify}
								width={CELL}
								height={TARGET_H}
								rx="5"
								fill={IDLE}
								opacity={step > vB ? 0 : 0.5}
							/>
							{step > vB && <g>{twoBlock(x0, yVerify, CELL, TARGET_H, 0.85, sweep, 6)}</g>}

							{/* drafted: the guessed tokens, then their verdicts stamped in place */}
							<RowLabel
								y={yVerdict}
								h={VERDICT_H}
								main="drafted"
								sub={`${r.accepted} kept · ${r.correction ? '1 fixed' : 'stop'}`}
								color={INK_SOFT}
							/>
							{r.proposals.map((tok, pi) => {
								const cx = colX(r.base + pi);
								const shownTok = step > sliverDone(ri, pi);
								const isAccept = pi < r.accepted;
								const isReject = pi === r.accepted;
								const isDiscard = pi > r.accepted;
								const col = isAccept ? ACCEPT : REJECT;
								return (
									<g key={`verdict-${ri}-${pi}`}>
										<rect
											x={cx}
											y={yVerdict}
											width={CELL}
											height={VERDICT_H}
											rx="6"
											fill={IDLE}
											stroke={INK_FAINT}
											strokeWidth="1"
											strokeDasharray="3 3"
											opacity={resolved ? 0 : shownTok ? 0.45 : 0.3}
										/>
										{resolved && (
											<rect
												x={cx}
												y={yVerdict}
												width={CELL}
												height={VERDICT_H}
												rx="6"
												fill={col}
												fillOpacity={(isDiscard ? 0.06 : 0.16) * appear}
												stroke={col}
												strokeOpacity={(isDiscard ? 0.3 : 0.65) * appear}
												strokeWidth="1.5"
												strokeDasharray="3 3"
											/>
										)}
										{shownTok && (
											<text
												x={cx + CELL / 2}
												y={yVerdict + VERDICT_H / 2 + 4}
												textAnchor="middle"
												fill={resolved && isAccept ? INK : INK_FAINT}
												opacity={resolved && isDiscard ? 0.55 : 1}
												style={{
													fontSize: '12.5px',
													fontWeight: 600,
													textDecoration: resolved && !isAccept ? 'line-through' : 'none',
												}}
											>
												{tok}
											</text>
										)}
										{resolved && (
											<g opacity={(isDiscard ? 0.45 : 1) * clamp01(appear * 1.5)}>
												<circle cx={cx + CELL - 4} cy={yVerdict + 2} r="7.5" fill={col} />
												<text
													x={cx + CELL - 4}
													y={yVerdict + 2 + 3.5}
													textAnchor="middle"
													fill="#fff"
													style={{ fontSize: '10px', fontWeight: 700 }}
												>
													{isAccept ? '✓' : '✕'}
												</text>
											</g>
										)}
									</g>
								);
							})}
						</g>
					);
				})}

				{/* ======================= OUTCOME (committed tokens) ================== */}
				<text
					x={colX(0)}
					y={ROW.outLabel}
					textAnchor="start"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px', fontWeight: 700 }}
				>
					PROMPT
				</text>
				<text
					x={colX(PROMPT.length)}
					y={ROW.outLabel}
					textAnchor="start"
					fill={INK_FAINT}
					style={{ fontSize: '10.5px', fontWeight: 700 }}
				>
					GENERATED
				</text>
				<RowLabel y={ROW.out} h={OUT_H} main="outcome" sub="committed" color={INK_SOFT} />
				<rect x={PL} y={ROW.out} width={GRID_W} height={OUT_H} rx="6" fill={IDLE} opacity="0.5" />
				{COMMITTED.map((tok, c) => {
					const role = OUT_ROLE[c];
					const b = OUT_BEAT[c];
					const isPrompt = role === 'prompt';
					const shown = isPrompt || step > b;
					if (!shown) return null;
					const done = isPrompt || step >= Math.min(b + 1, NBEATS);
					const op = isPrompt ? 1 : clamp01(step - b);
					const tint = role === 'correction' ? CORRECT : role === 'accept' ? ACCEPT : null;
					return (
						<g key={`out-${c}`} opacity={op}>
							{tint && (
								<rect
									x={colX(c) + 3}
									y={ROW.out + 4}
									width={CELL - 6}
									height={OUT_H - 8}
									rx="5"
									fill={tint}
									fillOpacity={role === 'correction' ? 0.18 : 0.1}
									stroke={tint}
									strokeOpacity={role === 'correction' ? 0.6 : 0}
									strokeWidth="1"
								/>
							)}
							<text
								x={colX(c) + CELL / 2}
								y={ROW.out + OUT_H / 2 + 4}
								textAnchor="middle"
								fill={done ? INK : INK_FAINT}
								style={{ fontSize: '12.5px', fontWeight: 600 }}
							>
								{tok}
							</text>
						</g>
					);
				})}
			</svg>
		</TimelineCard>
	);
}
