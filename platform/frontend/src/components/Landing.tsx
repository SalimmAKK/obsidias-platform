"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './marketing/MarketingChrome';
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

// ── HOW IT WORKS ──────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '1',
    title: 'A lead reaches out',
    body: 'WhatsApp, an Instagram DM, or a form on your site. It lands in one inbox instead of scattered across three apps and a phone nobody checks after 6pm.',
  },
  {
    n: '2',
    title: 'It gets qualified before anyone spends time on it',
    body: "The system checks who they are and whether what they're asking for is something you can actually sell them. Leads that clearly aren't a fit get archived with a reason attached, not left in a pile for someone to sort through later.",
  },
  {
    n: '3',
    title: 'A conversation starts, on their terms',
    body: 'The reply goes out on whichever channel they used, in the tone your agency actually uses with clients. Follow-up questions are handled contextually, not with a script that repeats itself.',
  },
  {
    n: '4',
    title: 'Your agent picks up a warm lead',
    body: 'By the time a person on your team is involved, the lead is qualified, the full conversation is there to read, and often a viewing time is already offered or confirmed.',
  },
];

function HowItWorks() {
  return (
    <section className="l-how" id="how">
      <div className="l-wide">
        <div className="l-how-head reveal">
          <p className="l-eyebrow">How it works</p>
          <h2 className="l-h2">What you see, not what runs underneath</h2>
        </div>
        <div className="l-how-grid">
          {STEPS.map((s, i) => (
            <div className={`l-how-step reveal d${i + 1}`} key={s.n}>
              <div className="l-how-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <Link href="/how-it-works" className="l-how-more reveal d4">
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

// ── LIVE ARTIFACTS ───────────────────────────────────────────────────────────
// Pure CSS keyframe loops, not React state — same reasoning as the .l-enter
// hero fix: nothing here depends on JS hydrating or an observer firing to
// become visible, so there's no blank-until-reload risk. They loop on their
// own once painted.
function LiveArtifacts() {
  return (
    <section className="l-live">
      <div className="l-wide">
        <div className="l-live-head reveal">
          <p className="l-eyebrow">Behind every conversation</p>
          <h2 className="l-h2">What happens after the lead replies</h2>
          <p className="l-body">
            Illustrative animations of the actual qualification and booking
            flow, not a live customer record.
          </p>
        </div>
        <div className="l-live-grid reveal d2">
          <div className="l-live-card">
            <p className="l-live-card-label">Qualification</p>
            <div className="l-qm-rows">
              <div className="l-qm-row">
                <span>Budget</span>
                <div className="l-qm-bar"><div className="l-qm-fill b1" /></div>
              </div>
              <div className="l-qm-row">
                <span>Authority</span>
                <div className="l-qm-bar"><div className="l-qm-fill b2" /></div>
              </div>
              <div className="l-qm-row">
                <span>Need</span>
                <div className="l-qm-bar"><div className="l-qm-fill b3" /></div>
              </div>
              <div className="l-qm-row">
                <span>Timeline</span>
                <div className="l-qm-bar"><div className="l-qm-fill b4" /></div>
              </div>
            </div>
            <div className="l-qm-ring-wrap">
              <svg className="l-qm-ring" viewBox="0 0 80 80" aria-hidden="true">
                <circle className="l-qm-ring-bg" cx="40" cy="40" r="34" />
                <circle className="l-qm-ring-fg" cx="40" cy="40" r="34" />
              </svg>
              <div className="l-qm-ring-label">
                <strong>91%</strong>
                <span>confidence</span>
              </div>
            </div>
          </div>

          <div className="l-live-card">
            <p className="l-live-card-label">Booking</p>
            <div className="l-bk-cal">
              <div className="l-bk-cal-head">Thursday</div>
              <div className="l-bk-slot"><span className="l-bk-time">9:00 AM</span></div>
              <div className="l-bk-slot"><span className="l-bk-time">11:00 AM</span></div>
              <div className="l-bk-slot filled">
                <i className="ti ti-check l-bk-check" aria-hidden="true" />
                <span className="l-bk-time">4:00 PM</span>
                <span className="l-bk-title">Property viewing, Ahmed Al-Khalidi</span>
              </div>
              <div className="l-bk-slot"><span className="l-bk-time">6:00 PM</span></div>
            </div>
          </div>
        </div>
        <p className="l-live-note reveal">
          Illustrative animation of the actual product flow, not a live customer record.
        </p>
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
        <Trust />
        <HowItWorks />
        <Channels />
        <LiveArtifacts />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </>
  );
}
