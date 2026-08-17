/* ============================================================================
   LEAD STACK ARTIFACT
   ----------------------------------------------------------------------------
   A fanned, auto-cycling deck of qualification cards for the hero plate.
   Mechanically this reskins a pattern from a reference SaaS site (Vertex,
   vertex-one-lovat.vercel.app): several full contact panels stacked with a
   scale/offset fan, one expanded up front while the others recede to a
   header-only sliver, cycling automatically. The reference built that with
   Framer Motion tweening inline styles off a `setInterval`-driven React
   state. This is the same visual mechanic done the way every other artifact
   on this site is done: one shared `@keyframes` block and a per-card
   NEGATIVE `animation-delay` (index * -1/3 of the cycle), so the browser's
   own animation engine drives the loop forever with no JS, no interval, no
   state, and nothing to hydrate before it's correct.

   Same technique as QualificationReportCard/PipelineArtifact/
   AuditTrailArtifact: the DOM already contains the right content for every
   card; only the fan geometry and the front card's expanded detail animate.
   `prefers-reduced-motion` simply removes the animation, and the base
   (un-animated) per-card rules already describe a correct static fan with
   card 1 expanded — there is no "frozen mid-transition" state to fall into.

   Content note: three illustrative leads, deliberately not all clean wins —
   Omar is held below threshold, which is the same honest-mixed-signal
   framing used throughout the site and ties directly into the Control
   section immediately below this one on the page.
   ========================================================================= */

interface StackRow {
  name: string;
  band: 1 | 2 | 3 | 4;
}

interface StackLead {
  name: string;
  channel: string;
  rows: StackRow[];
  overallBand: 1 | 2 | 3 | 4;
  overallNote: string;
}

const LEADS: StackLead[] = [
  {
    name: 'Yousef Al-Harbi',
    channel: 'WhatsApp',
    rows: [
      { name: 'Budget', band: 3 },
      { name: 'Authority', band: 3 },
      { name: 'Need', band: 4 },
      { name: 'Timeline', band: 3 },
    ],
    overallBand: 3,
    overallNote: 'Routed to the pipeline as qualified.',
  },
  {
    name: 'Lina Fahad',
    channel: 'Instagram',
    rows: [
      { name: 'Budget', band: 4 },
      { name: 'Authority', band: 4 },
      { name: 'Need', band: 4 },
      { name: 'Timeline', band: 3 },
    ],
    overallBand: 4,
    overallNote: 'Viewing offered on the first reply.',
  },
  {
    name: 'Omar Al-Rashid',
    channel: 'Email',
    rows: [
      { name: 'Budget', band: 2 },
      { name: 'Authority', band: 1 },
      { name: 'Need', band: 3 },
      { name: 'Timeline', band: 2 },
    ],
    overallBand: 2,
    overallNote: 'Below threshold — held for a human.',
  },
];

const BAND_LABEL: Record<number, string> = {
  1: 'Low signal',
  2: 'Developing',
  3: 'Qualified',
  4: 'Strongly qualified',
};

function Rows({ rows }: { rows: StackRow[] }) {
  return (
    <ul className="ls-rows">
      {rows.map((r) => (
        <li className="ls-row" key={r.name}>
          <span className="ls-row-name">{r.name}</span>
          <span className="ls-scale" aria-hidden="true">
            {[1, 2, 3, 4].map((cell) => (
              <span key={cell} className={cell <= r.band ? 'ls-cell ls-cell-on' : 'ls-cell'} />
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LeadStackArtifact() {
  return (
    <div className="ls-wrap">
      <style>{CSS}</style>
      <div className="ls-deck">
        {LEADS.map((lead, i) => (
          // --i drives the negative animation-delay that phases this card
          // to its slot in the shared cycle — see the @keyframes below.
          <article className="ls-card" style={{ ['--i' as string]: i }} key={lead.name}>
            <div className="ls-core">
              <header className="ls-head">
                <span className={`ls-dot ${lead.overallBand <= 2 ? 'ls-dot-warn' : 'ls-dot-good'}`} aria-hidden="true" />
                <span className="ls-name">{lead.name}</span>
                <span className="ls-chan">{lead.channel}</span>
              </header>
              <div className="ls-body">
                <Rows rows={lead.rows} />
                <div className="ls-overall">
                  <span className="ls-overall-label">{BAND_LABEL[lead.overallBand]}</span>
                  <span className="ls-overall-note">{lead.overallNote}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="ls-disclaimer">Illustrative leads, not real records.</p>
    </div>
  );
}

export default LeadStackArtifact;

const CSS = `
.ls-wrap{
  --ls-ink:#17181c; --ls-muted:#56585f; --ls-faint:#86878d;
  --ls-line:rgba(23,24,28,0.1); --ls-core:#fafafa;
  --ls-good:#41602f; --ls-good-bg:#e9eee0;
  --ls-warn:#7d6112; --ls-warn-bg:#f7eed6;
  --ls-accent:#ed6f5c; --ls-accent-deep:#d63118; --ls-accent-soft:rgba(237,111,92,0.14);
  --ls-ease:cubic-bezier(.22,1,.36,1);
  --ls-cycle:13.5s;
  font-family: var(--font-inter-tight), 'Inter Tight', system-ui, sans-serif;
}

.ls-deck{
  position:relative;
  height:400px;
  margin:0 auto;
  max-width:440px;
}

.ls-card{
  position:absolute;
  inset:0 0 auto 0;
  transform-origin:center top;
  border-radius:20px;
  background:#fff;
  box-shadow: inset 0 0 0 1px var(--ls-line), 0 30px 60px -30px rgba(23,24,28,.24);
  /* Base (un-animated) resting state — this is what prefers-reduced-motion
     falls back to, and it is already a correct static fan: card 1 expanded
     up front, 2 and 3 collapsed behind it. Nothing here depends on the
     animation having run. */
  animation: ls-cycle var(--ls-cycle) var(--ls-ease) infinite;
  animation-delay: calc(var(--i) * var(--ls-cycle) / -3);
}

.ls-core{
  border-radius:20px;
  overflow:hidden;
  box-shadow: inset 0 0 0 1px var(--ls-line);
}

.ls-head{
  display:flex; align-items:center; gap:10px;
  padding:16px 20px;
  background:var(--ls-core);
  border-bottom:1px solid var(--ls-line);
}
.ls-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.ls-dot-good{ background:var(--ls-good); }
.ls-dot-warn{ background:var(--ls-warn); }
.ls-name{ font-size:14px; font-weight:700; letter-spacing:-0.015em; color:var(--ls-ink); }
.ls-chan{
  margin-left:auto;
  font-family: var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ls-faint);
}

.ls-body{
  padding:18px 20px 20px;
  background:#fff;
  overflow:hidden;
  /* Its own copy of the same cycle, not the card's — a nested element can't
     be driven by its ancestor's @keyframes directly. It stays phase-locked
     to the card's fan position because --i is an inherited custom property:
     set once on .ls-card, read here unchanged, so both animations always
     agree on which third of the cycle this card is in. */
  animation: ls-body-cycle var(--ls-cycle) var(--ls-ease) infinite;
  animation-delay: calc(var(--i) * var(--ls-cycle) / -3);
}

.ls-rows{ list-style:none; margin:0 0 14px; padding:0; display:flex; flex-direction:column; gap:9px; }
.ls-row{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.ls-row-name{ font-size:12.5px; font-weight:600; color:var(--ls-ink); }
.ls-scale{ display:flex; gap:3px; }
.ls-cell{ width:18px; height:6px; border-radius:999px; background:#e2e2e4; }
.ls-cell-on{ background: linear-gradient(90deg, var(--ls-accent), var(--ls-accent-deep)); }

.ls-overall{
  display:flex; align-items:baseline; justify-content:space-between; gap:12px;
  padding-top:12px; border-top:1px dashed var(--ls-line);
}
.ls-overall-label{ font-size:13px; font-weight:800; letter-spacing:-0.02em; color:var(--ls-accent-deep); }
.ls-overall-note{ font-size:11px; color:var(--ls-muted); text-align:right; max-width:22ch; line-height:1.4; }

.ls-disclaimer{
  margin-top:18px;
  font-family: var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--ls-faint); text-align:center;
}

/* ===================== THE CYCLE =====================
   Three slots — front (expanded), mid, back — each held for 75% of its
   third of the cycle and transitioning for the remaining 25%. 0% and 100%
   are identical (front), so the loop has no seam. Every card shares this
   one block; --i (0/1/2, set inline per card) shifts each into its own
   third via a negative animation-delay, so they're always exactly one slot
   apart without any JS keeping them in sync. */
@keyframes ls-cycle {
  0%, 25%          { transform: translateY(48px) scale(1);     z-index: 3; }
  33.333%, 58.333% { transform: translateY(24px) scale(0.965); z-index: 2; }
  66.667%, 91.667% { transform: translateY(0)    scale(0.93);  z-index: 1; }
  100%             { transform: translateY(48px) scale(1);     z-index: 3; }
}

/* Same three slots, same stops — front is expanded, mid and back are
   collapsed to the header-only sliver. Kept as a second block (rather than
   folding into ls-cycle) because max-height/opacity live on a different
   element than transform/z-index. */
@keyframes ls-body-cycle {
  0%, 25%          { max-height: 280px; opacity: 1; }
  33.333%, 58.333% { max-height: 0;     opacity: 0; }
  66.667%, 91.667% { max-height: 0;     opacity: 0; }
  100%             { max-height: 280px; opacity: 1; }
}

@media (prefers-reduced-motion: reduce){
  .ls-card, .ls-body{ animation: none !important; }
  /* Recreate the resting fan by hand, since the keyframes (and the state
     they'd otherwise hold at 0%) are gone with the animation. */
  .ls-card:nth-child(1){ transform: translateY(48px) scale(1);     z-index: 3; }
  .ls-card:nth-child(2){ transform: translateY(24px) scale(0.965); z-index: 2; }
  .ls-card:nth-child(3){ transform: translateY(0)    scale(0.93);  z-index: 1; }
  .ls-card:nth-child(1) .ls-body{ max-height: 280px; opacity: 1; }
  .ls-card:nth-child(2) .ls-body,
  .ls-card:nth-child(3) .ls-body{ max-height: 0; opacity: 0; }
}
`;
