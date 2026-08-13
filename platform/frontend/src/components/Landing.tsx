"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './marketing/MarketingChrome';
import { QualificationReportCard } from './marketing/QualificationReportCard';
import { useReveal } from '@/lib/useReveal';
import './marketing/Marketing.css';
import './Landing.css';

/* ── HERO ─────────────────────────────────────────────────────────────────
   The headline uses the load-triggered line reveal (.m-lines-auto), not the
   scroll-triggered one — above the fold, nothing may wait on hydration to
   become visible. */
function Hero() {
  return (
    <section className="l-hero">
      <div className="o-wide l-hero-grid">
        <div>
          <p className="o-eyebrow m-enter">For agencies in Saudi Arabia and the Gulf</p>

          <h1 className="o-display l-hero-title m-lines m-lines-auto">
            <span className="m-line-mask"><span className="m-line">A lead messages</span></span>
            <span className="m-line-mask"><span className="m-line">you at 11:40pm.</span></span>
            <span className="m-line-mask"><span className="m-line o-dim">Someone replies</span></span>
            <span className="m-line-mask"><span className="m-line o-dim">by midnight.</span></span>
          </h1>

          <p className="o-lede l-hero-lede m-enter m-e2">
            Obsidias answers on WhatsApp, Instagram, or wherever the lead
            reached out, in under 90 seconds, day or night. It checks budget,
            authority, need, and timeline before your agent opens the thread,
            and books the viewing if they&rsquo;re ready.
          </p>

          <div className="l-hero-cta m-enter m-e3">
            <a href="#demo" className="o-btn o-btn-ink">
              Watch it respond
              <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-down" /></span>
            </a>
            <Link href="/login" className="o-btn o-btn-ghost">Request access</Link>
          </div>
        </div>

        <div className="l-hero-panel m-enter m-e2">
          <div className="o-bezel">
            <div className="o-bezel-core l-panel-core">
              <div className="l-panel-dots" aria-hidden="true">
                <span /><span /><span />
              </div>

              <div className="l-panel-row">
                <div>
                  <p className="o-mono">Inbound · live</p>
                  <p className="l-panel-name">Sara Al-Mutairi / WhatsApp</p>
                  <p className="l-panel-sub">
                    <span className="l-dot-live" aria-hidden="true" />
                    Qualified · replied in 41s
                  </p>
                </div>
                <ConfidenceRing />
              </div>

              <div className="l-panel-split">
                <div className="l-panel-stat">
                  <p className="o-mono">Reply / median</p>
                  <p className="l-stat-value">41<span>s</span></p>
                </div>
                <div className="l-panel-stat">
                  <p className="o-mono">Handled / 24h</p>
                  <p className="l-stat-value">128<span>leads</span></p>
                </div>
              </div>

              <div className="l-panel-audit">
                <p className="o-mono">Activity · last entry</p>
                <p className="l-audit-line">
                  <span className="l-audit-time">23:41</span> viewing booked for{' '}
                  <strong>Marina Heights</strong>, agent notified with full history.
                </p>
              </div>
            </div>
          </div>
          <p className="l-panel-note">Illustrative panel, not a live customer record.</p>
        </div>
      </div>
    </section>
  );
}

/* Static SVG ring with a CSS-only sweep — a value, so it fills rather than
   fades. Correct final state is in the markup either way. */
function ConfidenceRing() {
  return (
    <div className="l-ring-wrap">
      <svg className="l-ring" viewBox="0 0 72 72" aria-hidden="true">
        <circle className="l-ring-bg" cx="36" cy="36" r="30" />
        <circle className="l-ring-fg" cx="36" cy="36" r="30" />
      </svg>
      <span className="l-ring-label">0.91</span>
    </div>
  );
}

/* ── LIVE DEMO ────────────────────────────────────────────────────────── */
type DemoKind = 'inbound' | 'typing' | 'outbound' | 'qualify' | 'booked';
interface DemoStep { kind: DemoKind; time?: string; text?: string; tag?: string }

const DEMO_STEPS: DemoStep[] = [
  { kind: 'inbound', time: '0:00', text: 'Hi, I saw your listing for the 2 bedroom at Marina Heights. Is it still available?' },
  { kind: 'typing' },
  { kind: 'outbound', time: '0:41', text: "Hi Ahmed, yes it's still available. Are you looking to buy, and roughly what timeline are you working with?", tag: 'Replied in 41s' },
  { kind: 'inbound', time: '0:58', text: "Buy. Budget's 1.8 to 2 million, cash, ideally moved in within a month or two." },
  { kind: 'qualify' },
  { kind: 'outbound', time: '1:20', text: 'Understood. I can hold two viewing times, Thursday 4pm or Friday 11am. Which works better for you?' },
  { kind: 'booked' },
];

function useDemoSequence() {
  const [step, setStep] = useState(-1);
  const cancelled = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(DEMO_STEPS.length - 1);
      return;
    }
    cancelled.current = false;
    let i = -1;
    let t: ReturnType<typeof setTimeout>;
    function tick() {
      if (cancelled.current) return;
      i += 1;
      if (i > DEMO_STEPS.length - 1) {
        i = -1;
        setStep(-1);
        t = setTimeout(tick, 1100);
        return;
      }
      setStep(i);
      const k = DEMO_STEPS[i].kind;
      const d = k === 'typing' ? 1000 : k === 'booked' ? 3400 : k === 'qualify' ? 2200 : 1700;
      t = setTimeout(tick, d);
    }
    t = setTimeout(tick, 700);
    return () => { cancelled.current = true; clearTimeout(t); };
  }, []);

  return step;
}

function LiveDemo() {
  const step = useDemoSequence();
  const messages = DEMO_STEPS.filter((s, i) => i <= step && (s.kind === 'inbound' || s.kind === 'outbound'));
  const showTyping = step >= 0 && DEMO_STEPS[step]?.kind === 'typing';
  const showQualify = step >= DEMO_STEPS.findIndex((s) => s.kind === 'qualify');
  const showBooked = step >= DEMO_STEPS.findIndex((s) => s.kind === 'booked');

  return (
    <section className="o-section" id="demo">
      <div className="o-wide">
        <header className="l-head m-reveal">
          <p className="o-eyebrow">01 — See it work</p>
          <h2 className="o-h2">This is the actual sequence, <span className="o-dim">sped up.</span></h2>
          <p className="o-lede">
            A lead messages on WhatsApp. This is what happens before your agent
            has looked at their phone.
          </p>
        </header>

        <div className="l-demo-grid m-reveal m-d1">
          <div className="o-bezel on-deep l-demo-phone-shell">
            <div className="o-bezel-core l-demo-phone">
              <div className="l-demo-bar">
                <span className="l-demo-avatar" aria-hidden="true" />
                <span className="l-demo-who">Ahmed Al-Khalidi</span>
                <span className="o-mono l-demo-channel">WhatsApp</span>
              </div>
              <div className="l-demo-thread">
                {messages.map((m, i) => (
                  <div className={`l-msg ${m.kind}`} key={i}>
                    <p>{m.text}</p>
                    <div className="l-msg-meta">
                      <span>{m.time}</span>
                      {m.tag && <span className="l-msg-tag">{m.tag}</span>}
                    </div>
                  </div>
                ))}
                {showTyping && <div className="l-typing"><span /><span /><span /></div>}
                {messages.length === 0 && !showTyping && (
                  <p className="l-demo-idle">Waiting for the next message&hellip;</p>
                )}
              </div>
            </div>
          </div>

          <div className="o-bezel">
            <div className="o-bezel-core l-demo-side">
              <p className="o-mono">Behind the scenes</p>
              <div className={`l-side-block ${showQualify ? 'in' : ''}`}>
                <p className="l-side-title">Qualification</p>
                <div className="l-side-row"><span>Budget</span><strong>High</strong></div>
                <div className="l-side-row"><span>Authority</span><strong>Confirmed</strong></div>
                <div className="l-side-row"><span>Need</span><strong>Strong</strong></div>
                <div className="l-side-row"><span>Timeline</span><strong>Immediate</strong></div>
                <span className="l-side-conf">Confidence 0.91</span>
              </div>
              <div className={`l-side-block ${showBooked ? 'in' : ''}`}>
                <p className="l-side-title">Booking</p>
                <p className="l-side-strong">Thursday, 4:00pm at Marina Heights</p>
                <p className="l-side-sub">Agent notified with full conversation history and qualification summary.</p>
              </div>
              {!showQualify && !showBooked && (
                <p className="l-demo-idle">Qualification and booking appear once the lead responds.</p>
              )}
            </div>
          </div>
        </div>
        <p className="l-note m-reveal">Demo sequence illustrating the product flow, not a live customer conversation.</p>
      </div>
    </section>
  );
}

/* ── ARTIFACT ─────────────────────────────────────────────────────────── */
function QualificationArtifact() {
  return (
    <section className="o-section l-artifact">
      <div className="o-wide l-artifact-grid">
        <div className="m-reveal">
          <p className="o-eyebrow">02 — What lands on your desk</p>
          <h2 className="o-h2">Every lead arrives <span className="o-dim">already read.</span></h2>
          <p className="o-lede l-artifact-lede">
            Not a dashboard tile to go digging through. A qualification result
            an agent can take in at a glance and act on, with the reasoning
            attached to every line.
          </p>
          <Link href="/features" className="o-btn o-btn-ghost l-artifact-btn">See all features</Link>
        </div>
        <div className="m-reveal m-d1">
          <QualificationReportCard />
        </div>
      </div>
    </section>
  );
}

/* ── BENTO / TRUST ────────────────────────────────────────────────────── */
function Trust() {
  return (
    <section className="o-section" id="trust">
      <div className="o-wide">
        <header className="l-head m-reveal">
          <p className="o-eyebrow">03 — On control</p>
          <h2 className="o-h2">The AI doesn&rsquo;t get final say. <span className="o-dim">Your team does.</span></h2>
          <p className="o-lede">
            Every agency asks the same thing before turning this on: what
            happens when it gets one wrong. Here is the specific answer.
          </p>
        </header>

        <div className="l-bento">
          <article className="o-bezel m-card l-bento-wide m-reveal">
            <div className="o-bezel-core">
              <p className="o-mono">01 · Threshold</p>
              <h3 className="o-h3">Low-confidence leads never reach a client</h3>
              <p className="o-body">
                If confidence falls below the threshold you set, it doesn&rsquo;t
                guess. The lead queues for a human, with the reasoning attached
                so nobody starts from zero.
              </p>
              <div className="l-threshold" aria-hidden="true">
                <div className="l-threshold-track">
                  <div className="l-threshold-fill m-fill" />
                  <span className="l-threshold-mark" />
                </div>
                <div className="l-threshold-legend">
                  <span className="o-mono">0.00</span>
                  <span className="o-mono l-threshold-at">Review at 0.55</span>
                  <span className="o-mono">1.00</span>
                </div>
              </div>
            </div>
          </article>

          <article className="o-bezel m-card m-reveal m-d1">
            <div className="o-bezel-core">
              <p className="o-mono">02 · Handoff</p>
              <h3 className="o-h3">Any thread, taken over mid-conversation</h3>
              <p className="o-body">
                One click moves a conversation from AI to a named agent. The AI
                stops immediately. No delay, no handoff message the client has
                to sit through.
              </p>
            </div>
          </article>

          <article className="o-bezel on-deep m-card l-bento-tall m-reveal m-d2">
            <div className="o-bezel-core">
              <p className="o-mono">03 · Audit</p>
              <h3 className="o-h3">Every decision is logged against the lead</h3>
              <p className="o-body">
                Every AI message, every score change, every qualification
                reason, recorded. If a client questions something the AI said,
                you can see exactly what was sent and why.
              </p>
              <div className="l-audit-log" aria-hidden="true">
                <p><span className="l-audit-t">23:40</span> inbound · whatsapp</p>
                <p><span className="l-audit-t">23:41</span> qualified · 0.91</p>
                <p><span className="l-audit-t">23:41</span> reply sent · ai</p>
                <p><span className="l-audit-t">08:02</span> taken over · s.kamara</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS (pinned) ────────────────────────────────────────────── */
interface PinnedStep { key: string; tab: string; title: string; body: string; bullets: string[] }

const PINNED_STEPS: PinnedStep[] = [
  {
    key: 'capture',
    tab: 'Capture',
    title: 'Every channel, one inbox',
    body: 'WhatsApp, Instagram DM, and email land in the same place the moment a lead reaches out, instead of three apps and a phone nobody checks after 6pm.',
    bullets: ['WhatsApp, Instagram, and email in one thread', 'Full conversation history kept per lead', 'Nothing missed on an app someone forgot to open'],
  },
  {
    key: 'qualify',
    tab: 'Qualify',
    title: 'Scored before anyone opens the thread',
    body: 'Every lead is checked against Budget, Authority, Need, and Timeline the moment they message in, on what they actually said.',
    bullets: ['BANT scoring runs on every lead automatically', 'Confidence reflects real signal, not enthusiasm', "Leads that aren't a fit are archived with a reason"],
  },
  {
    key: 'converse',
    tab: 'Converse',
    title: 'Replies that keep it moving',
    body: 'The AI responds in under 90 seconds and keeps answering follow-up questions in context, until a person needs to take over.',
    bullets: ['Replies within 90 seconds, same channel', 'Handed to a named agent in one click', 'Never invents a price or availability'],
  },
  {
    key: 'book',
    tab: 'Book & sync',
    title: 'Viewings booked, leads synced',
    body: "A lead who's ready gets a real calendar slot, and a qualified one lands in your CRM, with nobody retyping a name and number.",
    bullets: ['Booked onto your team’s real calendar', 'Pushed to your CRM once qualified', 'Cold leads resurfaced after a week quiet'],
  },
];

function usePinnedScroll(stepCount: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let ticking = false;
    function compute() {
      ticking = false;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      setActiveIndex(Math.min(stepCount - 1, Math.floor(progress * stepCount)));
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    }
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [stepCount]);

  return { wrapperRef, activeIndex, setActiveIndex };
}

function HowItWorks() {
  const { wrapperRef, activeIndex, setActiveIndex } = usePinnedScroll(PINNED_STEPS.length);
  const step = PINNED_STEPS[activeIndex];

  return (
    <section id="how">
      <div className="o-wide l-how-head m-reveal">
        <p className="o-eyebrow">04 — How it works</p>
        <h2 className="o-h2">What you see, <span className="o-dim">not what runs underneath.</span></h2>
      </div>

      <div className="l-pin-wrapper" ref={wrapperRef}>
        <div className="l-pin-sticky">
          <div className="o-wide">
            <div className="l-tabs" role="tablist" aria-label="Pipeline stages">
              {PINNED_STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  className={`l-tab${i === activeIndex ? ' active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                >
                  <span className="l-tab-n">0{i + 1}</span>
                  {s.tab}
                </button>
              ))}
            </div>

            <div className="l-pin-grid">
              <div className="l-pin-text" key={`t-${step.key}`}>
                <h3 className="o-h2 l-pin-title">{step.title}</h3>
                <p className="o-lede">{step.body}</p>
                <ul className="l-pin-list">
                  {step.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              <div className="o-bezel l-pin-shot" key={`s-${step.key}`}>
                <div className="o-bezel-core l-shot-core">
                  <i className="ti ti-device-desktop" aria-hidden="true" />
                  <span className="o-mono">Dashboard preview · {step.tab}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="o-wide">
        <Link href="/how-it-works" className="o-btn o-btn-ghost l-how-more">See the full walkthrough</Link>
      </div>
    </section>
  );
}

/* ── MARQUEE ──────────────────────────────────────────────────────────────
   The design system calls for a customer-logo marquee. We don't have
   customers to name, and inventing logos would be exactly the kind of
   performative filler the site's copy avoids everywhere else. This runs the
   real integrations the platform actually ships with instead — same visual
   role, nothing fabricated. */
const INTEGRATIONS = [
  'WhatsApp Cloud API', 'Instagram DM', 'Email', 'HubSpot',
  'Cal.com', 'Slack', 'Apollo', 'Supabase',
];

function Marquee() {
  return (
    <section className="l-marquee-section">
      <div className="o-wide">
        <p className="o-mono l-marquee-label">Connects to what you already run</p>
      </div>
      <div className="m-marquee l-marquee">
        <div className="m-marquee-track">
          {[0, 1].map((copy) => (
            <div className="l-marquee-set" key={copy} aria-hidden={copy === 1}>
              {INTEGRATIONS.map((name) => (
                <span className="l-marquee-item" key={name}>
                  {name}
                  <span className="l-marquee-dot" aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PRICING ──────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Independent agency', audience: '1 to 5 agents, one office', price: '$297',
    desc: 'For agencies under 500 leads a month who want the qualification layer running without hiring for it.',
    cta: 'Get started', ctaTo: '/login', featured: false,
    features: ['500 leads per month', 'WhatsApp and email automation', 'AI qualification and scoring', 'CRM sync and appointment booking'],
  },
  {
    name: 'Growing agency', audience: '6 to 25 agents', price: '$797',
    desc: 'The tier most agencies at this size land on. Every channel, plus reactivation for leads that have gone cold.',
    cta: 'Get started', ctaTo: '/login', featured: true,
    features: ['2,500 leads per month', 'WhatsApp, Instagram DM, and email', 'Custom brand voice and AI persona', 'Cold-lead reactivation'],
  },
  {
    name: 'Multi-branch brokerage', audience: '25+ agents, multiple branches', price: 'Custom',
    desc: 'For brokerages running high volume across branches, with per-branch reporting and a dashboard under your own name.',
    cta: 'Talk to us', ctaTo: '/contact', featured: false,
    features: ['Unlimited leads', 'All channels', 'White-label dashboard, per branch', 'Custom brand voice and AI persona'],
  },
];

function Pricing() {
  return (
    <section className="o-section" id="pricing">
      <div className="o-wide">
        <header className="l-head m-reveal">
          <p className="o-eyebrow">05 — Pricing</p>
          <h2 className="o-h2">Sized to your agency, <span className="o-dim">not your headcount.</span></h2>
          <p className="o-lede">
            No per-agent charges. The limit on every plan is lead volume, so
            adding agents never adds to your bill.
          </p>
        </header>

        <div className="l-plans">
          {PLANS.map((plan, i) => (
            <article
              key={plan.name}
              className={`o-bezel m-card m-reveal m-d${i + 1}${plan.featured ? ' on-deep l-plan-featured' : ''}`}
            >
              <div className="o-bezel-core l-plan">
                {plan.featured && <span className="l-plan-flag">Most common at this size</span>}
                <p className="o-mono">{plan.audience}</p>
                <h3 className="l-plan-name">{plan.name}</h3>
                <p className="o-body l-plan-desc">{plan.desc}</p>
                <p className="l-plan-price">
                  {plan.price}
                  {plan.price !== 'Custom' && <span> / month</span>}
                </p>
                {plan.ctaTo === '/contact' ? (
                  <a href="#" title="Non-functional in prototype" className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-ghost'} l-plan-btn`}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.ctaTo} className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-ghost'} l-plan-btn`}>
                    {plan.cta}
                    <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-right" /></span>
                  </Link>
                )}
                <ul className="l-plan-list">
                  {plan.features.map((f, fi) => <li key={`${plan.name}-${fi}`}>{f}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CLOSING BAND ─────────────────────────────────────────────────────── */
function FinalCta() {
  return (
    <section className="l-final-wrap">
      <div className="o-wide">
        <div className="l-final m-reveal">
          <p className="o-eyebrow on-deep">Get started</p>
          <h2 className="o-h2 l-final-title">
            The next lead who messages you
            <span className="o-dim"> will message someone else too.</span>
          </h2>
          <p className="o-lede l-final-lede">
            Every hour without a reply is an hour a competing agency has to
            reach them first. Setup takes an afternoon, not a quarter.
          </p>
          <Link href="/login" className="o-btn o-btn-light">
            Request access
            <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-up-right" /></span>
          </Link>
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
      <div className="o-mesh m-drift" aria-hidden="true" />
      <MarketingNav />
      <main className="l-main">
        <Hero />
        <LiveDemo />
        <QualificationArtifact />
        <Trust />
        <HowItWorks />
        <Marquee />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </>
  );
}
