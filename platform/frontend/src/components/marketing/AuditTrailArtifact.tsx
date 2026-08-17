/* ============================================================================
   AUDIT TRAIL ARTIFACT
   ----------------------------------------------------------------------------
   Third in the artifact set, built on the same technique as
   QualificationReportCard and PipelineArtifact: the correct final state is
   rendered directly from data in plain markup, and a pure-CSS @keyframes
   animation is layered on top with a delay computed per row from its index.
   No useState, no IntersectionObserver, no mounted gate — correct with
   JavaScript disabled, and `animation-fill-mode: backwards` pins each row to
   its 0% keyframe for the length of its own delay so nothing flashes.

   Where the report card shows one lead judged and the pipeline artifact
   shows a week in aggregate, this shows the thing agencies actually ask
   about before switching it on: what got written down when the AI acted, and
   whether a human can see it afterwards.

   Rows deliberately include a below-threshold hold and a human takeover, not
   just a clean happy path — an audit log where the AI never hesitates isn't
   an audit log, it's a highlight reel.

   Self-contained (own `at-` prefix, own <style>) so it can be dropped on any
   page without pulling in a stylesheet.
   ========================================================================= */

interface Entry {
  time: string;
  actor: 'ai' | 'system' | 'human';
  event: string;
  detail: string;
}

const ENTRIES: Entry[] = [
  { time: '23:40:12', actor: 'system', event: 'Inbound received', detail: 'WhatsApp · +966 ·· ··· 4471' },
  { time: '23:40:31', actor: 'ai', event: 'Qualified 0.91', detail: 'Budget, authority, need, timeline all evidenced' },
  { time: '23:40:53', actor: 'ai', event: 'Reply sent', detail: 'Availability confirmed, two viewing slots offered' },
  { time: '23:48:07', actor: 'ai', event: 'Held for review', detail: 'Financing question below 0.55 threshold' },
  { time: '08:02:44', actor: 'human', event: 'Taken over', detail: 's.kamara · AI stopped on this thread' },
];

const ACTOR_LABEL: Record<Entry['actor'], string> = {
  ai: 'AI',
  system: 'SYS',
  human: 'HUMAN',
};

const BASE = 160;
const STEP = 85;

export function AuditTrailArtifact() {
  return (
    <div className="at-wrap">
      <style>{CSS}</style>

      <article className="at">
        <div className="at-core">
          <header className="at-head">
            <div>
              <p className="at-mono at-dim">Lead activity · immutable</p>
              <h3>Every decision, written down</h3>
            </div>
            <span className="at-fig at-mono">FIG. 03</span>
          </header>

          <ol className="at-rows">
            {ENTRIES.map((entry, i) => (
              <li
                className="at-row at-fade"
                key={entry.time}
                style={{ animationDelay: `${BASE + i * STEP}ms` }}
              >
                <span className="at-time at-mono">{entry.time}</span>
                <span className={`at-actor at-actor-${entry.actor}`}>{ACTOR_LABEL[entry.actor]}</span>
                <span className="at-body">
                  <span className="at-event">{entry.event}</span>
                  <span className="at-detail">{entry.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <footer
            className="at-foot at-fade"
            style={{ animationDelay: `${BASE + ENTRIES.length * STEP}ms` }}
          >
            <span className="at-mono at-dim">Retention</span>
            <span className="at-foot-value">Permanent, per lead</span>
          </footer>

          <p
            className="at-disclaimer at-fade"
            style={{ animationDelay: `${BASE + ENTRIES.length * STEP + 100}ms` }}
          >
            Illustrative log, not a real lead record.
          </p>
        </div>
      </article>
    </div>
  );
}

export default AuditTrailArtifact;

const CSS = `
.at-wrap{
  --at-ink:#17181c; --at-muted:#56585f; --at-faint:#86878d;
  --at-line:rgba(23,24,28,0.08); --at-core:#fafafa;
  --at-accent:#ed6f5c; --at-accent-deep:#d63118; --at-accent-soft:#fbe4de;
  --at-olive:#6e7448; --at-olive-soft:#edf0e4;
  --at-ease:cubic-bezier(.22,1,.36,1);
  font-family: var(--font-inter-tight), 'Inter Tight', system-ui, sans-serif;
}
/* Double bezel — outer 24px, 6px pad, inner 18px, concentric. */
.at{
  max-width:470px; margin:0 auto; background:#fff;
  padding:6px; border-radius:24px; transform:rotate(-0.35deg);
  box-shadow: inset 0 0 0 1px var(--at-line), 0 30px 60px -30px rgba(23,24,28,.22);
}
.at-core{
  background:var(--at-core); border-radius:18px; padding:26px;
  box-shadow: inset 0 0 0 1px var(--at-line);
}
.at-head{display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
  padding-bottom:18px; border-bottom:1px solid var(--at-line);}
.at-head h3{font-size:19px; font-weight:800; letter-spacing:-0.03em; margin-top:6px; color:var(--at-ink);}
.at-mono{font-family: var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace;
  font-size:10px; font-weight:500; letter-spacing:.2em; text-transform:uppercase;}
.at-dim{color:var(--at-faint);}
.at-fig{color:var(--at-faint); flex-shrink:0;}

.at-rows{list-style:none; margin:0; padding:0;}
.at-row{
  display:grid; grid-template-columns:auto auto minmax(0,1fr);
  gap:12px; align-items:baseline;
  padding:13px 0; border-bottom:1px solid var(--at-line);
}
.at-time{color:var(--at-faint); letter-spacing:.06em; flex-shrink:0;}
.at-actor{
  font-family: var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace;
  font-size:9px; font-weight:500; letter-spacing:.14em;
  padding:3px 7px; border-radius:4px; flex-shrink:0;
}
.at-actor-ai{background:var(--at-accent-soft); color:var(--at-accent-deep);}
.at-actor-system{background:rgba(23,24,28,0.06); color:var(--at-muted);}
.at-actor-human{background:var(--at-olive-soft); color:var(--at-olive);}
.at-body{display:flex; flex-direction:column; gap:3px; min-width:0;}
.at-event{font-size:13.5px; font-weight:600; letter-spacing:-0.01em; color:var(--at-ink);}
.at-detail{font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  font-size:12px; color:var(--at-muted); line-height:1.5;}

.at-foot{
  margin-top:18px; padding:14px 20px; background:#fff; border-radius:14px;
  box-shadow: inset 0 0 0 1px var(--at-line);
  display:flex; justify-content:space-between; align-items:center; gap:12px;
}
.at-foot-value{font-size:13px; font-weight:700; letter-spacing:-0.015em; color:var(--at-ink);}

.at-disclaimer{margin-top:16px; font-family: var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--at-faint); text-align:center;}

/* ===================== THE KEYFRAME =====================
   Everything above is presentation; this is the whole technique. */
@keyframes at-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.at-fade{ animation: at-fade .45s var(--at-ease) backwards; }

@media (prefers-reduced-motion: reduce){
  .at-fade { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;
