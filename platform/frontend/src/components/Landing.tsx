"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './marketing/MarketingChrome';
import { QualificationReportCard } from './marketing/QualificationReportCard';
import './Landing.css';

// ── SCROLL REVEAL ──────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="l-hero">
      <div className="l-wide l-hero-grid">
        <div className="l-hero-left">
          <p className="l-hero-eyebrow l-enter">For agencies in Saudi Arabia and the Gulf</p>
          <h1 className="l-hero-hook l-enter l-e1">
            A lead messages your agency at 11:40pm.<br />
            Someone replies to them by midnight.<br />
            <span className="dim">It usually isn&rsquo;t you.</span>
          </h1>
          <p className="l-hero-sub l-enter l-e2">
            Obsidias answers on WhatsApp, Instagram, or wherever the lead reached out,
            in under 90 seconds, day or night. It checks their budget, authority, need
            and timeline before your agent ever opens the thread, and books the viewing
            if they&rsquo;re ready.
          </p>
          <div className="l-hero-cta l-enter l-e3">
            <a href="#demo" className="btn-dark">Watch it respond</a>
            <Link href="/login" className="btn-outline">Request access</Link>
          </div>
        </div>

        <div className="l-hero-right l-enter l-e2">
          <p className="l-clock-eyebrow">Response window</p>
          <div className="l-clock-row">
            <span className="l-clock-dot" />
            <span className="l-clock-time">0:00</span>
            <span className="l-clock-label">Lead messages on WhatsApp</span>
          </div>
          <div className="l-clock-row on">
            <span className="l-clock-dot on" />
            <span className="l-clock-time on">0:41</span>
            <span className="l-clock-label on">Obsidias replies</span>
          </div>
          <div className="l-clock-row dim">
            <span className="l-clock-dot" />
            <span className="l-clock-time">Later that day</span>
            <span className="l-clock-label">Most agencies reply</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── LIVE DEMO ────────────────────────────────────────────────────────────
type DemoKind = 'inbound' | 'typing' | 'outbound' | 'qualify' | 'booked';
interface DemoStep {
  kind: DemoKind;
  time?: string;
  text?: string;
  tag?: string;
}

const DEMO_STEPS: DemoStep[] = [
  { kind: 'inbound', time: '0:00', text: 'Hi, I saw your listing for the 2 bedroom at Marina Heights. Is it still available?' },
  { kind: 'typing' },
  { kind: 'outbound', time: '0:41', text: "Hi Ahmed, yes it's still available. Are you looking to buy, and roughly what timeline are you working with?", tag: 'Replied in 41 seconds' },
  { kind: 'inbound', time: '0:58', text: "Buy. Budget's 1.8 to 2 million, cash, ideally moved in within a month or two." },
  { kind: 'qualify' },
  { kind: 'outbound', time: '1:20', text: 'Understood. I can hold two viewing times, Thursday 4pm or Friday 11am. Which works better for you?' },
  { kind: 'booked' },
];

function useDemoSequence() {
  const [step, setStep] = useState(-1);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setStep(DEMO_STEPS.length - 1);
      return;
    }

    cancelledRef.current = false;
    let i = -1;
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      if (cancelledRef.current) return;
      i += 1;
      if (i > DEMO_STEPS.length - 1) {
        i = -1;
        setStep(-1);
        timeoutId = setTimeout(tick, 1100);
        return;
      }
      setStep(i);
      const kind = DEMO_STEPS[i].kind;
      const delay = kind === 'typing' ? 1000 : kind === 'booked' ? 3400 : kind === 'qualify' ? 2200 : 1700;
      timeoutId = setTimeout(tick, delay);
    }

    timeoutId = setTimeout(tick, 700);
    return () => {
      cancelledRef.current = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return step;
}

function LiveDemo() {
  const step = useDemoSequence();
  const messages = DEMO_STEPS.filter((s, i) => i <= step && (s.kind === 'inbound' || s.kind === 'outbound'));
  const showTyping = step >= 0 && DEMO_STEPS[step]?.kind === 'typing';
  const qualifyIndex = DEMO_STEPS.findIndex((s) => s.kind === 'qualify');
  const bookedIndex = DEMO_STEPS.findIndex((s) => s.kind === 'booked');
  const showQualify = step >= qualifyIndex;
  const showBooked = step >= bookedIndex;

  return (
    <section className="l-demo" id="demo">
      <div className="l-wide">
        <div className="l-demo-head reveal">
          <p className="l-eyebrow">See it work</p>
          <h2 className="l-h2">This is the actual sequence, sped up.</h2>
          <p className="l-body">
            A lead messages on WhatsApp. This is what happens before your agent
            has looked at their phone.
          </p>
        </div>

        <div className="l-demo-grid reveal d2">
          <div className="l-demo-phone">
            <div className="l-demo-phone-bar">
              <span className="l-demo-phone-dot" />
              <span className="l-demo-phone-name">Ahmed Al-Khalidi</span>
              <span className="l-demo-phone-channel">WhatsApp</span>
            </div>
            <div className="l-demo-thread">
              {messages.map((m, i) => (
                <div className={`l-demo-msg ${m.kind}`} key={i}>
                  <p>{m.text}</p>
                  <div className="l-demo-msg-meta">
                    <span>{m.time}</span>
                    {m.tag && <span className="l-demo-tag">{m.tag}</span>}
                  </div>
                </div>
              ))}
              {showTyping && (
                <div className="l-demo-typing">
                  <span /><span /><span />
                </div>
              )}
              {messages.length === 0 && !showTyping && (
                <p className="l-demo-idle">Waiting for the next message&hellip;</p>
              )}
            </div>
          </div>

          <div className="l-demo-panel">
            <p className="l-demo-panel-label">Behind the scenes</p>
            <div className={`l-demo-qual ${showQualify ? 'in' : ''}`}>
              <p className="l-demo-panel-title">Qualification</p>
              <div className="l-demo-qual-row"><span>Budget</span><strong>High</strong></div>
              <div className="l-demo-qual-row"><span>Authority</span><strong>Confirmed</strong></div>
              <div className="l-demo-qual-row"><span>Need</span><strong>Strong</strong></div>
              <div className="l-demo-qual-row"><span>Timeline</span><strong>Immediate</strong></div>
              <div className="l-demo-conf">Confidence 0.91</div>
            </div>
            <div className={`l-demo-booked ${showBooked ? 'in' : ''}`}>
              <p className="l-demo-panel-title">Booking</p>
              <p className="l-demo-booked-line">Thursday, 4:00pm at Marina Heights</p>
              <p className="l-demo-booked-sub">Agent notified with full conversation history and qualification summary.</p>
            </div>
            {!showQualify && !showBooked && (
              <p className="l-demo-idle">Qualification and booking appear once the lead responds.</p>
            )}
          </div>
        </div>
        <p className="l-demo-note reveal">Demo sequence illustrating the actual product flow, not a live customer conversation.</p>
      </div>
    </section>
  );
}

// ── TRUST / OBJECTION ───────────────────────────────────────────────────
const TRUST_POINTS = [
  {
    n: '01',
    title: 'Low-confidence leads never reach a client',
    body: "If the AI's confidence score falls below the threshold you set, it doesn't guess. The lead queues for a human to qualify or dismiss, with the AI's reasoning attached so you're not starting from zero.",
  },
  {
    n: '02',
    title: 'Any thread can be taken over mid-conversation',
    body: 'One click switches a conversation from AI to a named agent. The AI stops replying immediately. There is no delay and no handoff message the client has to sit through.',
  },
  {
    n: '03',
    title: 'Every decision is logged against the lead',
    body: 'Every AI message, every score change, and every qualification reason is recorded. If a client complains about something the AI said, you can see exactly what was sent and why.',
  },
];

function Trust() {
  return (
    <section className="l-trust" id="trust">
      <div className="l-wide">
        <div className="l-trust-head reveal">
          <p className="l-eyebrow on-dark">On control</p>
          <h2 className="l-h2 on-dark">The AI doesn&rsquo;t get final say. Your team does.</h2>
          <p className="l-body on-dark">
            Every agency asks the same question before turning this on: what happens
            when the AI gets it wrong, or a client wants to speak to an actual person.
            Here is the specific answer, not a reassurance.
          </p>
        </div>
        <div className="l-trust-grid">
          {TRUST_POINTS.map((p, i) => (
            <div className={`l-trust-item reveal d${i + 1}`} key={p.n}>
              <span className="l-trust-num">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS (pinned, scroll-driven) ────────────────────────────────
// The 4 keyword tabs stay pinned in view while the user scrolls through
// this section; which tab is "active" advances with scroll position,
// expanding into real detail + a screenshot slot on each step. Screenshot
// panels are placeholders until the dashboard's own redesign pass lands —
// swapping a real image in later is a one-line change per step, no layout
// work required.
interface PinnedStep {
  key: string;
  tab: string;
  title: string;
  body: string;
  bullets: string[];
}

const PINNED_STEPS: PinnedStep[] = [
  {
    key: 'capture',
    tab: 'Capture',
    title: 'Every channel, one inbox',
    body: 'WhatsApp, Instagram DM, and email all land in the same place the moment a lead reaches out, instead of three apps and a phone nobody checks after 6pm.',
    bullets: [
      'WhatsApp, Instagram, and email in one thread',
      'Full conversation history kept per lead',
      'Nothing missed on an app someone forgot to open',
    ],
  },
  {
    key: 'qualify',
    tab: 'Qualify',
    title: 'Scored before anyone opens the thread',
    body: 'Every lead is checked against Budget, Authority, Need, and Timeline the moment they message in, on what they actually said, not how promising it sounds.',
    bullets: [
      'BANT scoring runs automatically on every lead',
      'Confidence reflects real signal, not guesswork',
      "Leads that aren't a fit get archived with a reason",
    ],
  },
  {
    key: 'converse',
    tab: 'Converse',
    title: 'Replies that keep the conversation moving',
    body: 'The AI responds in under 90 seconds and keeps answering follow-up questions in context, until a person needs to take it from there.',
    bullets: [
      'Replies within 90 seconds, on the same channel',
      'Handed to a named agent instantly, one click',
      'Never invents a price or availability it lacks',
    ],
  },
  {
    key: 'book',
    tab: 'Book & sync',
    title: 'Viewings booked, leads synced',
    body: "A lead who's ready gets a real calendar slot, and a qualified one lands straight in your CRM, no one retyping a name and number.",
    bullets: [
      'Booked directly onto your team’s real calendar',
      'Pushed to your CRM automatically once qualified',
      'Cold leads flagged and resurfaced after a week quiet',
    ],
  },
];

function usePinnedScroll(stepCount: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let ticking = false;

    function computeActiveIndex() {
      ticking = false;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const index = Math.min(stepCount - 1, Math.floor(progress * stepCount));
      setActiveIndex(index);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(computeActiveIndex);
    }

    computeActiveIndex();
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
    <section className="l-how" id="how">
      <div className="l-wide">
        <div className="l-how-head reveal">
          <p className="l-eyebrow">How it works</p>
          <h2 className="l-h2">What you see, not what runs underneath</h2>
        </div>
      </div>

      <div className="l-how-pin-wrapper" ref={wrapperRef}>
        <div className="l-how-pin-sticky">
          <div className="l-wide">
            <div className="l-how-tabs">
              {PINNED_STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`l-how-tab${i === activeIndex ? ' active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                >
                  {s.tab}
                </button>
              ))}
            </div>

            <div className="l-how-pin-grid">
              <div className="l-how-pin-text" key={`text-${step.key}`}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul className="l-how-pin-bullets">
                  {step.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="l-how-pin-shot" key={`shot-${step.key}`}>
                <div className="l-how-pin-shot-placeholder">
                  <i className="ti ti-photo" aria-hidden="true" />
                  <span>Dashboard preview — {step.tab.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="l-wide">
        <Link href="/how-it-works" className="l-how-more">
          See the full walkthrough &rarr;
        </Link>
      </div>
    </section>
  );
}

// ── CHANNELS ──────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: 'ti-brand-whatsapp',
    title: 'WhatsApp',
    body: "For most agencies here, WhatsApp isn't one channel among several, it's where the conversation happens by default. The first reply goes out within 90 seconds of a lead messaging in.",
    detail: "Meta's rules give you 24 hours of free-form replies after a lead messages first. After that, approved templates keep the thread alive instead of going quiet.",
  },
  {
    icon: 'ti-brand-instagram',
    title: 'Instagram DM',
    body: "Leads from Meta ads, story replies, and comment mentions are captured the same way and run through the same qualification, not treated as a lower priority inbox.",
    detail: 'Enquiry volume on Instagram tends to spike in the evening and after Friday prayers. The AI is answering on the same clock your leads are messaging on.',
  },
  {
    icon: 'ti-mail',
    title: 'Email',
    body: "Used for the leads who aren't ready this week, market updates and nurture sequences for buyers on a longer decision timeline, common with off-plan and investment purchases.",
    detail: 'Personalised per lead based on what property they engaged with, not a single newsletter sent to everyone on the list.',
  },
];

function Channels() {
  return (
    <section className="l-channels" id="channels">
      <div className="l-wide">
        <div className="l-channels-head reveal">
          <p className="l-eyebrow">Channels</p>
          <h2 className="l-h2">Built around how buyers here actually reach out</h2>
          <p className="l-body">
            Three channels, chosen because they cover real estate enquiries in Saudi
            Arabia and the wider Gulf, not because they round out an integrations page.
          </p>
        </div>
        <div className="l-ch-grid">
          {CHANNELS.map((ch, i) => (
            <div className={`l-ch-card reveal d${i + 1}`} key={ch.title}>
              <i className={`ti ${ch.icon} l-ch-icon`} aria-hidden="true" />
              <h3>{ch.title}</h3>
              <p>{ch.body}</p>
              <p className="l-ch-detail">{ch.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── QUALIFICATION ARTIFACT ───────────────────────────────────────────────
// The card itself (QualificationReportCard) times its fill/fade animations
// off mount via CSS animation-delay, not scroll position — that's the
// point of the technique (correct with JS off, no flash-of-wrong-state).
// This wrapper's heading still uses the page's normal scroll-reveal, which
// is a different, compatible concern: whether the section fades in as you
// scroll to it at all. If a visitor is already past this section's fixed
// delays by the time it scrolls into view, the card just renders already
// filled — not a bug, the correct end state was there in the markup from
// the start.
function QualificationArtifact() {
  return (
    <section className="l-qr">
      <div className="l-wide">
        <div className="l-qr-head reveal">
          <p className="l-eyebrow">What lands on your desk</p>
          <h2 className="l-h2">Every lead gets a report like this</h2>
          <p className="l-body">
            Not a dashboard tile to go digging for. A qualification result
            an agent can read in five seconds and act on.
          </p>
        </div>
        <div className="l-qr-card-wrap reveal d2">
          <QualificationReportCard />
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Independent agency',
    audience: '1 to 5 agents, one office',
    desc: 'For agencies under 500 leads a month who want the qualification layer running without hiring for it.',
    price: '$297',
    cta: 'Get started',
    ctaTo: '/login',
    featured: false,
    features: [
      '500 leads per month',
      'WhatsApp and email automation',
      'AI qualification and scoring',
      'CRM sync and appointment booking',
    ],
  },
  {
    name: 'Growing agency',
    audience: '6 to 25 agents, single or multiple locations',
    desc: 'The tier most agencies at this size land on. Every channel, plus reactivation for leads that have gone cold.',
    price: '$797',
    cta: 'Get started',
    ctaTo: '/login',
    featured: true,
    features: [
      '2,500 leads per month',
      'WhatsApp, Instagram DM, and email',
      'Custom brand voice and AI persona',
      'Cold-lead reactivation',
    ],
  },
  {
    name: 'Multi-branch brokerage',
    audience: '25+ agents across multiple branches',
    desc: 'For brokerages running high lead volume across branches, with per-branch reporting and a dashboard under your own name.',
    price: 'Custom',
    cta: 'Talk to us',
    ctaTo: '/contact',
    featured: false,
    features: [
      'Unlimited leads',
      'All channels',
      'White-label dashboard, per branch',
      'Custom brand voice and AI persona',
    ],
  },
];

function Pricing() {
  return (
    <section className="l-pricing" id="pricing">
      <div className="l-wide">
        <div className="l-pricing-head reveal">
          <p className="l-eyebrow">Pricing</p>
          <h2 className="l-h2">Sized to your agency, not your headcount</h2>
          <p className="l-body">
            No per-agent charges. The limit on every plan is lead volume, so adding
            agents to your team never adds to your bill.
          </p>
        </div>
        <div className="l-plan-grid">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`l-plan reveal d${i + 1}${plan.featured ? ' featured' : ''}`}
            >
              {plan.featured && <div className="l-most-pop">Most common at this size</div>}
              <div className="l-plan-audience">{plan.audience}</div>
              <div className="l-plan-name">{plan.name}</div>
              <div className="l-plan-desc">{plan.desc}</div>
              <div className="l-plan-price">
                <strong>{plan.price}</strong>
                {plan.price !== 'Custom' && <span> / month</span>}
              </div>
              {plan.ctaTo === '/contact' ? (
                <a href="#" title="Non-functional in prototype" className="l-plan-btn">{plan.cta}</a>
              ) : (
                <Link href={plan.ctaTo} className="l-plan-btn">{plan.cta}</Link>
              )}
              <ul className="l-feat-list">
                {plan.features.map((f, fi) => (
                  <li key={`${plan.name}-${fi}`}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FINAL CTA ─────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="l-final">
      <div className="l-container">
        <h2 className="reveal">
          <span style={{ display: 'block' }}>The next lead who messages you</span>
          <span style={{ display: 'block' }}>will message someone else too, if you&rsquo;re slow.</span>
        </h2>
        <p className="reveal d1">
          Every hour without a reply is an hour a competing agency has to reach them
          first. Setup takes an afternoon, not a quarter.
        </p>
        <Link href="/login" className="btn-white reveal d2">
          Request access
        </Link>
      </div>
    </section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────
export default function Landing() {
  useReveal();

  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <LiveDemo />
        <QualificationArtifact />
        <Trust />
        <HowItWorks />
        <Channels />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </>
  );
}
