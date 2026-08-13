/* ============================================================================
   QUALIFICATION REPORT ARTIFACT — portable
   ----------------------------------------------------------------------------
   Adapted from a report-card artifact built for another project. The
   technique carries over exactly: render the CORRECT final state directly
   from data in plain markup, then layer a pure-CSS @keyframes animation on
   top of it. No useState, no IntersectionObserver, no "mounted" gate — this
   means it's correct even with JavaScript fully disabled (CSS animations
   don't need JS to run), and there's no flash-of-wrong-state, because
   `animation-fill-mode: backwards` holds each element at its first keyframe
   for the length of its own `animation-delay`.

   Self-contained on purpose: its own class prefix (qr-), its own <style>
   block, no dependency on Landing.css. Drop it on any page — a features
   page, a future case-study page — without pulling in the rest of the
   marketing stylesheet.

   Content note: Sara Al-Mutairi is an illustrative example, not a real
   lead. Deliberately mixed (not a slam-dunk on every row) so the BandScale
   actually shows its range, and so the artifact demonstrates the honest
   framing used throughout the site: confidence reflects real signal, not
   how promising a lead sounds.
   ========================================================================= */

interface ReportRow {
  name: string;
  band: 1 | 2 | 3 | 4;
  note: string;
}

const ROWS: ReportRow[] = [
  { name: 'Budget', band: 3, note: 'SAR 1.2 to 1.5M mentioned, financing not yet confirmed.' },
  { name: 'Authority', band: 4, note: 'Sole contact on the account, no other decision-maker referenced.' },
  { name: 'Need', band: 4, note: 'Asked for a second viewing within the week.' },
  { name: 'Timeline', band: 3, note: 'Targeting a move next quarter, not immediate.' },
];

const OVERALL = {
  band: 3 as const,
  note: 'Routed to the pipeline as qualified. Confidence was above the review threshold.',
};

const BAND_LABEL: Record<number, string> = {
  1: 'Low signal',
  2: 'Developing',
  3: 'Qualified',
  4: 'Strongly qualified',
};
const BAND_VAR: Record<number, string> = {
  1: 'var(--qr-b1)',
  2: 'var(--qr-b2)',
  3: 'var(--qr-b3)',
  4: 'var(--qr-b4)',
};

/* Stagger timing: row i's bar starts filling at BASE + i*ROW_STEP ms. Cells
   within a row offset a further CELL_STEP ms each so the fill visibly
   sweeps left to right instead of snapping all four cells at once. */
const BASE = 150;
const ROW_STEP = 90;
const CELL_STEP = 45;
const OVERALL_DELAY = BASE + ROWS.length * ROW_STEP + 150;

function BandScale({ band, delayMs = 0, size = 'sm' }: { band: number; delayMs?: number; size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? { w: 34, h: 10 } : { w: 22, h: 7 };
  return (
    <span className="qr-scale" aria-hidden="true">
      {[1, 2, 3, 4].map((cell) => {
        const filled = cell <= band;
        return (
          <span
            key={cell}
            className={filled ? 'qr-cell qr-cell-fill' : 'qr-cell'}
            style={{
              width: dims.w,
              height: dims.h,
              background: filled ? BAND_VAR[band] : undefined,
              // The key line: delay is computed from static data, not client
              // state — this is what makes it work without JS.
              animationDelay: filled ? `${delayMs + (cell - 1) * CELL_STEP}ms` : undefined,
            }}
          />
        );
      })}
    </span>
  );
}

export function QualificationReportCard() {
  return (
    <div className="qr-wrap">
      <style>{CSS}</style>

      <article className="qr">
        <div className="qr-core">
        <header className="qr-head">
          <div>
            <p className="qr-mono qr-dim">AI qualification</p>
            <h3>Sara Al-Mutairi</h3>
          </div>
          <p className="qr-mono qr-dim">WhatsApp</p>
        </header>

        <ul className="qr-rows">
          {ROWS.map((row, i) => {
            const delay = BASE + i * ROW_STEP;
            return (
              <li key={row.name} className="qr-row">
                <div className="qr-row-top">
                  <span className="qr-name">{row.name}</span>
                  <div className="qr-row-right">
                    <BandScale band={row.band} delayMs={delay} />
                    <span className="qr-mono qr-label qr-fade" style={{ animationDelay: `${delay}ms` }}>
                      {BAND_LABEL[row.band]}
                    </span>
                  </div>
                </div>
                <p className="qr-finding">{row.note}</p>
              </li>
            );
          })}
        </ul>

        <footer className="qr-foot">
          <div className="qr-fade" style={{ animationDelay: `${OVERALL_DELAY}ms` }}>
            <p className="qr-mono qr-dim">Overall</p>
            <div className="qr-overall">
              <span className="qr-overall-band">{BAND_LABEL[OVERALL.band]}</span>
              <BandScale band={OVERALL.band} delayMs={OVERALL_DELAY} size="md" />
            </div>
          </div>
          <p className="qr-note qr-fade" style={{ animationDelay: `${OVERALL_DELAY + 100}ms` }}>
            {OVERALL.note}
          </p>
        </footer>

        <p className="qr-disclaimer qr-fade" style={{ animationDelay: `${OVERALL_DELAY + 200}ms` }}>
          Illustrative example, not a real lead record.
        </p>
        </div>
      </article>
    </div>
  );
}

export default QualificationReportCard;

/* ------------------------------- THE CSS ---------------------------------
   Fully portable. The two @keyframes at the bottom are the whole trick;
   everything else is presentation, retuned to Obsidias' palette (warm
   terracotta accent, Plus Jakarta Sans, hairline rules) instead of the
   original's forest green. */
const CSS = `
.qr-wrap{
  --qr-ink:#18181B; --qr-paper:#fff; --qr-muted:#71717A; --qr-faint:#A1A1AA;
  --qr-line:rgba(24,24,27,0.06); --qr-chalk:#FAFAF9; --qr-sunk:#F4F4F2;
  --qr-b1:#D9D9D6; --qr-b2:#E8A96C; --qr-b3:#C1662E; --qr-b4:#A8501F;
  --qr-ease: cubic-bezier(.22,.61,.36,1);
  font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
}
/* Double bezel: outer shell holds the ring + shadow + 6px of padding, inner
   core drops its radius by exactly that so the corners stay concentric. */
.qr{
  max-width:470px; margin:0 auto; background:#fff;
  padding:6px; border-radius:32px; transform:rotate(-0.5deg);
  box-shadow: inset 0 0 0 1px var(--qr-line), 0 30px 60px -20px rgba(24,24,27,.13);
}
.qr-core{
  background:var(--qr-chalk); border-radius:26px; padding:26px;
  box-shadow: inset 0 0 0 1px var(--qr-line);
}
.qr-head{display:flex; justify-content:space-between; align-items:flex-start;
  padding-bottom:18px; border-bottom:1px solid var(--qr-line); gap:12px;}
.qr-head h3{font-size:19px; font-weight:800; letter-spacing:-0.03em; margin-top:6px; color:var(--qr-ink);}
.qr-mono{font-family: var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace; font-size:10px;
  font-weight:500; letter-spacing:.2em; text-transform:uppercase;}
.qr-dim{color:var(--qr-faint);}
.qr-rows{list-style:none; margin:0; padding:0;}
.qr-row{padding:15px 0; border-bottom:1px solid var(--qr-line);}
.qr-row-top{display:flex; justify-content:space-between; align-items:center; gap:12px;}
.qr-name{font-size:14px; font-weight:600; letter-spacing:-0.01em; color:var(--qr-ink);}
.qr-row-right{display:flex; align-items:center; gap:10px;}
.qr-label{width:118px; text-align:right; color:var(--qr-muted);}
.qr-finding{font-size:12.5px; color:var(--qr-muted); margin-top:6px; line-height:1.55;}

/* --- the scale primitive --- */
.qr-scale{display:flex; gap:3px;}
.qr-cell{display:block; border-radius:999px; background:var(--qr-sunk);}
.qr-cell-fill{ transform-origin:left; animation: qr-fill .5s var(--qr-ease) backwards; }

/* --- footer --- */
.qr-foot{margin-top:18px; padding:18px 20px; background:#fff; border-radius:20px;
  box-shadow: inset 0 0 0 1px var(--qr-line);
  display:flex; justify-content:space-between; align-items:center; gap:12px;}
.qr-overall{display:flex; align-items:center; gap:10px; margin-top:6px;}
.qr-overall-band{font-size:20px; font-weight:800; letter-spacing:-0.03em; color:var(--qr-b4);}
.qr-note{font-size:11.5px; color:var(--qr-muted); text-align:right; max-width:170px; line-height:1.5;}

.qr-disclaimer{margin-top:16px; font-family: var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--qr-faint); text-align:center;}

/* ======================= THE TWO KEYFRAMES ============================
   This is the entire technique. Everything above is presentation. */

@keyframes qr-fill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes qr-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.qr-fade { animation: qr-fade .4s ease backwards; }

/* Both animations use fill-mode "backwards" — this holds the element at its
   FIRST keyframe state for the entire animation-delay period, so there is
   no flash of default/unstyled content before the delay elapses. */

@media (prefers-reduced-motion: reduce) {
  .qr-cell-fill, .qr-fade { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;
