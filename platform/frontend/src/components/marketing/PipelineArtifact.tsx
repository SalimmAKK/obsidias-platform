/* ============================================================================
   PIPELINE ARTIFACT
   ----------------------------------------------------------------------------
   Companion to QualificationReportCard, built on the same technique: the
   correct final state is rendered directly from data in plain markup, and a
   pure-CSS @keyframes animation is layered on top with delays computed per
   row from its index. No useState, no IntersectionObserver, no mounted gate
   — correct with JavaScript disabled, and no flash of wrong state because
   `animation-fill-mode: backwards` pins each bar to its 0% keyframe for the
   length of its own delay.

   Where the report card shows one lead in depth, this shows the shape of a
   week: how many leads entered at each stage and what fell away between
   them. Bars use scaleX rather than opacity on purpose — a value that fills
   reads as measured, a value that fades reads as merely appearing.

   Self-contained (own `pa-` prefix, own <style>) so it can be dropped on any
   page without pulling in a stylesheet.

   Numbers are illustrative, and deliberately show real drop-off rather than
   a clean funnel — a stage chart where nothing is lost isn't a pipeline,
   it's a marketing graphic.
   ========================================================================= */

interface Stage {
  label: string;
  note: string;
  count: number;
}

const STAGES: Stage[] = [
  { label: 'Captured',   note: 'WhatsApp, Instagram, email', count: 412 },
  { label: 'Qualified',  note: 'Cleared the BANT threshold', count: 268 },
  { label: 'In review',  note: 'Below threshold, sent to a human', count: 91 },
  { label: 'Booked',     note: 'Viewing on the calendar', count: 74 },
  { label: 'Synced',     note: 'Pushed to the CRM', count: 268 },
];

const PEAK = Math.max(...STAGES.map((s) => s.count));

const BASE = 180;
const STEP = 90;

export function PipelineArtifact() {
  return (
    <div className="pa-wrap">
      <style>{CSS}</style>

      <article className="pa">
        <div className="pa-core">
          <header className="pa-head">
            <div>
              <p className="pa-mono pa-dim">Pipeline · last 7 days</p>
              <h3>Where the week went</h3>
            </div>
            <span className="pa-badge">Live</span>
          </header>

          <ul className="pa-rows">
            {STAGES.map((stage, i) => {
              const delay = BASE + i * STEP;
              const pct = Math.round((stage.count / PEAK) * 100);
              return (
                <li className="pa-row" key={stage.label}>
                  <div className="pa-row-top">
                    <span className="pa-label">{stage.label}</span>
                    <span
                      className="pa-count pa-fade"
                      style={{ animationDelay: `${delay + 120}ms` }}
                    >
                      {stage.count}
                    </span>
                  </div>
                  <div className="pa-track">
                    <div
                      className="pa-bar"
                      style={{ width: `${pct}%`, animationDelay: `${delay}ms` }}
                    />
                  </div>
                  <p className="pa-note">{stage.note}</p>
                </li>
              );
            })}
          </ul>

          <footer className="pa-foot pa-fade" style={{ animationDelay: `${BASE + STAGES.length * STEP}ms` }}>
            <div>
              <p className="pa-mono pa-dim">Median first reply</p>
              <p className="pa-stat">41<span>s</span></p>
            </div>
            <div className="pa-foot-divider" aria-hidden="true" />
            <div>
              <p className="pa-mono pa-dim">Handled without a human</p>
              <p className="pa-stat">65<span>%</span></p>
            </div>
          </footer>

          <p className="pa-disclaimer">Illustrative figures, not live account data.</p>
        </div>
      </article>
    </div>
  );
}

export default PipelineArtifact;

const CSS = `
.pa-wrap{
  --pa-ink:#18181B; --pa-muted:#71717A; --pa-faint:#A1A1AA;
  --pa-line:rgba(24,24,27,0.06); --pa-core:#FAFAF9; --pa-sunk:#F2F2F0;
  --pa-accent:#C1662E; --pa-accent-dim:#E8A96C; --pa-accent-deep:#A8501F;
  --pa-accent-soft:#F7EADF;
  --pa-ease:cubic-bezier(.22,.61,.36,1);
  font-family: var(--font-geist), 'Geist', system-ui, sans-serif;
}
/* Double bezel — outer 32px, 6px pad, inner 26px, concentric. */
.pa{
  max-width:470px; margin:0 auto; background:#fff;
  padding:6px; border-radius:32px; transform:rotate(0.4deg);
  box-shadow: inset 0 0 0 1px var(--pa-line), 0 30px 60px -20px rgba(24,24,27,.13);
}
.pa-core{
  background:var(--pa-core); border-radius:26px; padding:26px;
  box-shadow: inset 0 0 0 1px var(--pa-line);
}
.pa-head{display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
  padding-bottom:18px; border-bottom:1px solid var(--pa-line);}
.pa-head h3{font-size:19px; font-weight:800; letter-spacing:-0.03em; margin-top:6px; color:var(--pa-ink);}
.pa-mono{font-family: var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace;
  font-size:10px; font-weight:500; letter-spacing:.2em; text-transform:uppercase;}
.pa-dim{color:var(--pa-faint);}
.pa-badge{
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 11px; border-radius:999px; flex-shrink:0;
  background:var(--pa-accent-soft); color:var(--pa-accent-deep);
  font-size:11px; font-weight:600;
}
.pa-badge::before{content:''; width:5px; height:5px; border-radius:50%; background:var(--pa-accent);}

.pa-rows{list-style:none; margin:0; padding:0;}
.pa-row{padding:15px 0; border-bottom:1px solid var(--pa-line);}
.pa-row-top{display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:9px;}
.pa-label{font-size:14px; font-weight:600; letter-spacing:-0.01em; color:var(--pa-ink);}
.pa-count{font-size:15px; font-weight:800; letter-spacing:-0.02em; color:var(--pa-ink);}

.pa-track{height:8px; border-radius:999px; background:var(--pa-sunk); box-shadow: inset 0 0 0 1px var(--pa-line);}
.pa-bar{
  height:100%; border-radius:999px;
  background:linear-gradient(90deg, var(--pa-accent-dim), var(--pa-accent));
  transform-origin:left;
  animation: pa-fill .55s var(--pa-ease) backwards;
}
.pa-note{font-size:12px; color:var(--pa-muted); margin-top:8px; line-height:1.5;}

.pa-foot{
  margin-top:18px; padding:16px 20px; background:#fff; border-radius:20px;
  box-shadow: inset 0 0 0 1px var(--pa-line);
  display:flex; align-items:center; gap:20px;
}
.pa-foot-divider{width:1px; align-self:stretch; background:var(--pa-line);}
.pa-stat{font-size:24px; font-weight:800; letter-spacing:-0.035em; margin-top:5px; color:var(--pa-ink); line-height:1;}
.pa-stat span{font-size:12px; font-weight:500; color:var(--pa-faint); letter-spacing:0; margin-left:3px;}

.pa-disclaimer{margin-top:16px; font-family: var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--pa-faint); text-align:center;}

/* ===================== THE TWO KEYFRAMES =====================
   Everything above is presentation; this is the whole technique. */
@keyframes pa-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pa-fade { from { opacity: 0; } to { opacity: 1; } }
.pa-fade{ animation: pa-fade .4s ease backwards; }

@media (prefers-reduced-motion: reduce){
  .pa-bar, .pa-fade { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;
