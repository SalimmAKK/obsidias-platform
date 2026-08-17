'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './marketing/MarketingChrome';
import { LeadStackArtifact } from './marketing/LeadStackArtifact';
import { PipelineArtifact } from './marketing/PipelineArtifact';
import { AuditTrailArtifact } from './marketing/AuditTrailArtifact';
import { useReveal } from '@/lib/useReveal';
import './marketing/Marketing.css';
import './Landing.css';

/* ── SECTION RULE ─────────────────────────────────────────────────────────
   The roman-numeral strip that opens every section. Shared here rather than
   repeated inline seven times. */
function Rule({ roman, title, meta, n }: { roman: string; title: string; meta: string; n: string }) {
  return (
    <div className="o-rule">
      <span className="o-rule-roman">{roman}</span>
      <span className="o-rule-grp">
        <span>{title}</span>
        <span className="o-rule-dot">•</span>
        <span>{meta}</span>
      </span>
      <span>{n} / 007</span>
    </div>
  );
}

/* ── I. HERO ──────────────────────────────────────────────────────────────
   The headline uses the load-triggered line reveal (.m-lines-auto), not the
   scroll-triggered one — above the fold, nothing may wait on hydration to
   become visible.

   The plate on the right is a fanned, auto-cycling deck of qualification
   cards — reskinning a stacked-card hero mechanic (seen on Vertex,
   vertex-one-lovat.vercel.app) onto this site's own visual language and
   real product content, rather than a static image or a literal dark clone.
   See LeadStackArtifact.tsx for how the cycle runs without JS. */
function Hero() {
  return (
    <section className="l-hero" id="top">
      <div className="o-wide l-hero-grid">
        <div className="l-hero-copy">
          <span className="o-label m-enter">
            AI lead qualification <span className="o-ix">· Real estate</span>
          </span>

          <h1 className="o-display l-hero-title m-lines m-lines-auto">
            <span className="m-line-mask"><span className="m-line">Answered<span className="o-dot">.</span></span></span>
            <span className="m-line-mask"><span className="m-line"><em>Qualified.</em></span></span>
            <span className="m-line-mask"><span className="m-line"><em>Booked.</em></span></span>
          </h1>

          <p className="o-lede l-hero-lede m-enter m-e2">
            A lead messages your agency at 11:40pm. Obsidias replies in under
            90 seconds on the channel they used, checks budget, authority,
            need, and timeline before an agent opens the thread, and books the
            viewing if they&rsquo;re ready.
          </p>

          <div className="l-hero-actions m-enter m-e3">
            <Link href="/login" className="o-btn o-btn-primary">
              Request access
              <span className="o-btn-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
              </span>
            </Link>
            <Link href="/how-it-works" className="o-btn o-btn-ghost">
              See how it works
              <span className="o-btn-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M9 12h6M12 9v6" /></svg>
              </span>
            </Link>
          </div>

          <div className="l-hero-stats m-enter m-e4">
            <div className="l-stat">
              <span className="l-stat-ring solid">4</span>
              <span className="l-stat-label"><b>criteria</b>scored per lead</span>
            </div>
            <div className="l-stat">
              <span className="l-stat-ring">3</span>
              <span className="l-stat-label"><b>channels</b>one inbox</span>
            </div>
            <div className="l-stat">
              <span className="l-stat-ring coral">90</span>
              <span className="l-stat-label"><b>seconds</b>reply target</span>
            </div>
          </div>

          <div className="l-hero-foot m-enter m-e4">
            <span className="o-meta">↳ &nbsp; Human approval on anything below threshold</span>
            <span className="o-mono">WhatsApp · Instagram · Email</span>
          </div>
        </div>

        <div className="l-hero-art m-enter m-e2">
          <span className="l-corner tl" aria-hidden="true" />
          <span className="l-corner tr" aria-hidden="true" />
          <span className="l-corner bl" aria-hidden="true" />
          <span className="l-corner br" aria-hidden="true" />
          <span className="l-annot tl o-mono">FIG. 01 / OBS-01</span>
          <span className="l-annot tr o-meta">Plate Nº 01</span>
          <span className="l-annot bl o-mono">STATUS · live</span>
          <span className="l-annot br o-meta">
            Composed in&nbsp;<span style={{ color: 'var(--coral-text)' }}>Obsidias</span>
          </span>
          <div className="l-plate">
            <LeadStackArtifact />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── WIRE ─────────────────────────────────────────────────────────────────
   The design calls for a customer-logo marquee here. We don't have customers
   to name, and inventing logos would be exactly the performative filler the
   copy avoids everywhere else. This runs the integrations the platform
   actually ships with instead — same visual role, nothing fabricated. */
const INTEGRATIONS: { tag: string; name: string }[] = [
  { tag: 'MSG', name: 'WhatsApp Cloud API' },
  { tag: 'MSG', name: 'Instagram DM' },
  { tag: 'MAIL', name: 'Email' },
  { tag: 'CRM', name: 'HubSpot' },
  { tag: 'CAL', name: 'Cal.com' },
  { tag: 'OPS', name: 'Slack' },
  { tag: 'DATA', name: 'Apollo' },
  { tag: 'DB', name: 'Supabase' },
];

const PIPELINE_FILES: { handle: string; role: string }[] = [
  { handle: 'capture.inbound', role: 'capture' },
  { handle: 'qualify.bant', role: 'score' },
  { handle: 'converse.reply', role: 'respond' },
  { handle: 'review.threshold', role: 'gate' },
  { handle: 'book.calendar', role: 'book' },
  { handle: 'sync.crm', role: 'record' },
];

function Wire() {
  return (
    <section className="l-wire" aria-label="Integrations and pipeline stages">
      <div className="o-wide l-wire-inner">
        <div className="l-wire-left">
          <span className="l-wire-mark" aria-hidden="true"><span className="l-wire-pulse" /></span>
          <span className="l-wire-title">
            <b>Under the hood</b>
            <span>6 stages · 8 integrations</span>
          </span>
        </div>
        <div className="l-wire-rows">
          <div className="l-wire-row">
            <div className="m-marquee-track" aria-hidden="true">
              {[0, 1].flatMap((copy) =>
                INTEGRATIONS.map((item, i) => (
                  <span className="l-wire-item" key={`${copy}-${i}`}>
                    <span className="l-wire-dot">&middot;</span>
                    <span className="l-wire-coord">{item.tag}</span>
                    <span className="l-wire-name">{item.name}</span>
                  </span>
                )),
              )}
            </div>
          </div>
          <div className="l-wire-row reverse">
            <div className="m-marquee-track" aria-hidden="true">
              {[0, 1].flatMap((copy) =>
                PIPELINE_FILES.map((item, i) => (
                  <span className="l-wire-item" key={`${copy}-${i}`}>
                    <span className="l-wire-dot">&middot;</span>
                    <span className="l-wire-handle">{item.handle}</span>
                    <span className="l-wire-role">{item.role}</span>
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── II. CAPABILITIES ─────────────────────────────────────────────────── */
interface Capability {
  num: string;
  tag: string;
  title: React.ReactNode;
  body: string;
  icon: React.ReactNode;
}

const CAPABILITIES: Capability[] = [
  {
    num: '01',
    tag: 'Capture',
    title: <>Every channel,<br />one inbox</>,
    body: 'WhatsApp, Instagram DM, and email land in the same place the moment a lead reaches out, not three apps nobody checks after 6pm.',
    icon: (
      <svg className="l-cap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 7h18v11H3z" /><path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    num: '02',
    tag: 'Qualify',
    title: <>Scored before<br />anyone opens it</>,
    body: 'Budget, authority, need, and timeline checked against what the lead actually said, with the reasoning attached to every line.',
    icon: (
      <svg className="l-cap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3.5" y="3.5" width="8" height="8" /><rect x="12.5" y="3.5" width="8" height="8" />
        <rect x="3.5" y="12.5" width="8" height="8" /><rect x="12.5" y="12.5" width="8" height="8" />
      </svg>
    ),
  },
  {
    num: '03',
    tag: 'Converse',
    title: <>Replies that<br />keep it moving</>,
    body: 'Follow-up questions answered in context on the same channel. It never invents a price or an availability it was not given.',
    icon: (
      <svg className="l-cap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="8" cy="12" r="4.5" /><circle cx="16" cy="12" r="4.5" />
      </svg>
    ),
  },
  {
    num: '04',
    tag: 'Book',
    title: <>Viewings booked,<br />leads synced</>,
    body: 'A ready lead gets a real calendar slot and lands in your CRM, with nobody retyping a name and a number.',
    icon: (
      <svg className="l-cap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3.5" y="5" width="17" height="15" /><path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    ),
  },
];

function Capabilities() {
  return (
    <section className="o-section" id="capabilities">
      <div className="o-wide">
        <Rule roman="II." title="Capabilities" meta="4 stages / 1 loop" n="002" />

        <header className="l-head m-reveal">
          <span className="o-label">Capabilities <span className="o-ix">· Nº 02</span></span>
          <h2 className="o-h2 l-head-title">
            Built for one job: a lead <em>worth</em> an agent&rsquo;s time<span className="o-dot">.</span>
          </h2>
          <p className="o-lede">
            No manual triage, no chasing across three apps. An agent opens a
            thread already knowing who this is and whether it is worth the
            hour.
          </p>
        </header>

        <div className="l-cap-grid">
          {CAPABILITIES.map((cap, i) => (
            <article className={`o-card m-card m-reveal m-d${(i % 4) + 1}`} key={cap.num}>
              <div className="o-card-num">
                {cap.num}
                <span className="o-card-tag">{cap.tag}</span>
              </div>
              {cap.icon}
              <h3 className="o-h3">{cap.title}</h3>
              <p className="o-body">{cap.body}</p>
              <Link className="o-arrow-mark l-cap-arrow" href="/features" aria-label={`More about ${cap.tag}`}>
                <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── III. METHOD ──────────────────────────────────────────────────────────
   The export used a photographic plate per step. These are typographic
   plates instead: the oversized serif numeral is the visual, and the mono
   spec line under each step carries the detail the image never could. */
interface MethodStep {
  num: string;
  title: string;
  body: string;
  spec: string;
}

const METHOD: MethodStep[] = [
  {
    num: '01',
    title: 'Arrives',
    body: 'A lead messages on WhatsApp, Instagram, or email. It lands in one inbox immediately, whatever the hour.',
    spec: 'capture.inbound · 3 channels',
  },
  {
    num: '02',
    title: 'Scored',
    body: 'Budget, authority, need, and timeline are judged on what was actually said, and a confidence figure comes with it.',
    spec: 'qualify.bant · 0.00–1.00',
  },
  {
    num: '03',
    title: 'Answered',
    body: 'Above your threshold the AI replies directly. Below it, the lead queues for a human with the reasoning attached.',
    spec: 'converse.reply · <90s',
  },
  {
    num: '04',
    title: 'Booked',
    body: 'A ready lead gets a viewing on your team’s real calendar, and the qualified record is pushed to your CRM.',
    spec: 'book.calendar · sync.crm',
  },
];

function Method() {
  return (
    <section className="o-section" id="method">
      <div className="o-wide">
        <Rule roman="III." title="Method / Loop" meta="04 stages, unattended" n="003" />

        <div className="l-method-head">
          <div className="m-reveal">
            <span className="o-label">Method <span className="o-ix">· Nº 03</span></span>
            <h2 className="o-h2 l-head-title">
              From first <em>message</em> to booked <em>viewing</em><span className="o-dot">.</span>
            </h2>
          </div>
          <div className="l-method-aside m-reveal m-d1">
            <span className="l-method-plus">+</span>
            <p className="o-body">
              Every stage runs unattended until a human decision is genuinely
              required — then it stops and waits for one.
            </p>
          </div>
        </div>

        <div className="l-method-grid">
          {METHOD.map((step, i) => (
            <div className={`l-method-step m-reveal m-d${(i % 4) + 1}`} key={step.num}>
              <div className="l-method-num">{step.num}</div>
              <h4 className="l-method-title">
                {step.title}
                {i < METHOD.length - 1 && <span className="l-method-arrow" aria-hidden="true">→</span>}
              </h4>
              <p className="o-body l-method-body">{step.body}</p>
              <p className="o-mono l-method-spec">{step.spec}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── IV. CONTROL ──────────────────────────────────────────────────────── */
function Control() {
  return (
    <section className="o-section" id="control">
      <div className="o-wide">
        <Rule roman="IV." title="Control / Audit" meta="Human approval, non-negotiable" n="004" />

        <div className="l-split">
          <div className="m-reveal">
            <span className="o-label">On control <span className="o-ix">· Nº 04</span></span>
            <h2 className="o-h2 l-head-title">
              The AI doesn&rsquo;t get <em>final say</em><span className="o-dot">.</span> Your team does.
            </h2>
            <p className="o-lede l-split-lede">
              Every agency asks the same thing before switching this on: what
              happens when it gets one wrong. The answer is that it stops. If
              confidence falls below the threshold you set, the lead queues for
              a human with the reasoning attached, and any agent can take a
              thread over mid-conversation in one click.
            </p>
            <ul className="l-checks">
              <li>Threshold is yours to set, per agency</li>
              <li>Below it, a person decides — never a guess</li>
              <li>Every message and score change logged against the lead</li>
            </ul>
            <Link href="/features" className="o-read-more l-split-link">See all features</Link>
          </div>
          <div className="l-split-art m-reveal m-d1">
            <span className="l-annot tr o-meta">Plate Nº 03</span>
            <AuditTrailArtifact />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── V. VOLUME (dark slab) ────────────────────────────────────────────── */
function Volume() {
  return (
    <section className="o-section tight">
      <div className="o-slab grain-dark">
        <div className="o-slab-inner">
          <div className="o-rule">
            <span className="o-rule-roman">V.</span>
            <span className="o-rule-grp">
              <span>Volume / A week in aggregate</span>
              <span className="o-rule-dot">•</span>
              <span>Stage by stage</span>
            </span>
            <span>005 / 007</span>
          </div>

          <div className="l-slab-grid">
            <div className="m-reveal">
              <span className="o-label">Throughput</span>
              <h2 className="o-h2 l-slab-title">
                Every lead, <em>every</em> outcome, on the <em>record</em><span className="o-dot">.</span>
              </h2>
              <p className="o-lede l-slab-lede">
                Not a vanity funnel where nothing is ever lost. Leads that fall
                below threshold are held for a person, and leads that are not a
                fit are archived with a reason, so the numbers you are reading
                are the ones that actually happened.
              </p>
              <Link href="/how-it-works" className="o-btn o-btn-light">
                See the full sequence
                <span className="o-btn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
                </span>
              </Link>
            </div>
            <div className="l-slab-art m-reveal m-d1">
              <PipelineArtifact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── VI. STACK ────────────────────────────────────────────────────────── */
const STACK: { name: string; role: string; href: string }[] = [
  { name: 'WhatsApp', role: 'Capture', href: 'https://developers.facebook.com/docs/whatsapp' },
  { name: 'Instagram', role: 'Capture', href: 'https://developers.facebook.com/docs/instagram-api' },
  { name: 'Cal.com', role: 'Booking', href: 'https://cal.com' },
  { name: 'HubSpot', role: 'CRM sync', href: 'https://hubspot.com' },
  { name: 'Slack', role: 'Alerts', href: 'https://slack.com' },
  { name: 'Supabase', role: 'Records', href: 'https://supabase.com' },
];

function Stack() {
  return (
    <section className="o-section" id="stack">
      <div className="o-wide">
        <Rule roman="VI." title="Stack / Integrations" meta="Connects to what you run" n="006" />

        <div className="l-split">
          <div className="m-reveal">
            <span className="o-label">Design principle <span className="o-ix">· Nº 05</span></span>
            <h2 className="o-h2 l-quote">
              &ldquo;Confidence should reflect real <em>signal,</em> not how promising a lead <em>sounds.</em>&rdquo;
            </h2>
            <div className="l-author">
              <span className="l-author-mark">O</span>
              <p>
                Obsidias
                <span>Key design decision</span>
              </p>
            </div>
          </div>

          <div className="m-reveal m-d1">
            <p className="o-body l-stack-intro">
              Built on infrastructure agencies already run, so nothing has to
              be migrated to switch it on.
            </p>
            <div className="l-stack-grid">
              {STACK.map((s) => (
                <a
                  className="l-stack-item"
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={s.name}
                >
                  <span className="l-stack-name">{s.name}</span>
                  <small>{s.role}</small>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── VII. CTA ─────────────────────────────────────────────────────────── */
function FinalCta() {
  return (
    <section className="o-section l-cta" id="contact">
      <div className="o-wide">
        <Rule roman="VII." title="Contact / Conversation" meta="Setup takes an afternoon" n="007" />

        <div className="l-cta-inner m-reveal">
          <span className="o-label">Get started <span className="o-ix">· Nº 06</span></span>
          <h2 className="o-display l-cta-title">
            The next lead who messages you<br />
            <em>will message someone else too</em><span className="o-dot">.</span>
          </h2>
          <p className="o-lede l-cta-lede">
            Every hour without a reply is an hour a competing agency has to
            reach them first. Setup takes an afternoon, not a quarter.
          </p>
          <div className="l-cta-actions">
            <Link href="/login" className="o-btn o-btn-primary">
              Request access
              <span className="o-btn-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
              </span>
            </Link>
            <Link href="/pricing" className="o-btn o-btn-ghost">See pricing</Link>
          </div>
          <div className="l-cta-foot">
            <span className="l-cta-stamp">● Live</span>
            <span>v1.0.0</span>
            <span className="l-cta-spacer">WhatsApp · Instagram · Email</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PAGE ─────────────────────────────────────────────────────────────── */
export default function Landing() {
  useReveal();

  return (
    <>
      <MarketingNav />
      <div className="o-shell">
        <main>
          <Hero />
          <Wire />
          <Capabilities />
          <Method />
          <Control />
          <Volume />
          <Stack />
          <FinalCta />
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
