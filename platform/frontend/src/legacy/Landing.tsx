import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

// ── SCROLL REVEAL HOOK ────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">OBSIDIAS</Link>
      <div className="nav-links">
        <a href="#intro">Product</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <Link to="/signup" className="nav-cta">Get started</Link>
      </div>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-eyebrow reveal">
          <span className="hero-eyebrow-dot" />
          Built for real estate agencies
        </div>

        <h1 className="reveal d1">
          Every lead.<br />
          <em>Automatically</em> matched<br />
          and closed.
        </h1>

        <p className="hero-sub reveal d2">
          Obsidias captures leads from every channel, qualifies them with AI,
          and routes the right ones to the right agents — before your
          competitors even pick up the phone.
        </p>

        <div className="hero-actions reveal d3">
          <Link to="/signup" className="btn-primary">Start free trial</Link>
          <a href="#intro" className="btn-ghost">See how it works</a>
        </div>

        <div className="hero-stats reveal d4">
          <div className="hero-stat">
            <strong>&lt; 90s</strong>
            <span>First AI response after capture</span>
          </div>
          <div className="hero-stat">
            <strong>3×</strong>
            <span>More appointments booked</span>
          </div>
          <div className="hero-stat">
            <strong>24 / 7</strong>
            <span>Lead engagement, no downtime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── DASHBOARD MOCKUP ──────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="mockup-wrap reveal">
      <div className="mockup-shell">
        <div className="mockup-bar">
          <div className="mockup-dot" style={{ background: '#FF5F57' }} />
          <div className="mockup-dot" style={{ background: '#FEBC2E' }} />
          <div className="mockup-dot" style={{ background: '#28C840' }} />
        </div>
        <div className="mockup-screen">
          <div className="mock-sidebar">
            <div className="mock-nav-item active">
              <span className="mock-nav-dot" />Pipeline
            </div>
            <div className="mock-nav-item">
              <span className="mock-nav-dot" />Leads
            </div>
            <div className="mock-nav-item">
              <span className="mock-nav-dot" />Conversations
            </div>
            <div className="mock-nav-item">
              <span className="mock-nav-dot" />Campaigns
            </div>
            <div className="mock-nav-item">
              <span className="mock-nav-dot" />Analytics
            </div>
          </div>

          <div className="mock-main">
            <div className="mock-section-label">TODAY'S OVERVIEW</div>
            <div className="mock-cards">
              <div className="mock-card">
                <div className="mock-card-label">New leads</div>
                <div className="mock-card-val">24</div>
                <div className="mock-card-sub">↑ 6 from yesterday</div>
              </div>
              <div className="mock-card">
                <div className="mock-card-label">Hot leads</div>
                <div className="mock-card-val">7</div>
                <div className="mock-card-sub">Score ≥ 70</div>
              </div>
              <div className="mock-card">
                <div className="mock-card-label">Appointments</div>
                <div className="mock-card-val">3</div>
                <div className="mock-card-sub">Booked today</div>
              </div>
            </div>

            <div className="mock-leads">
              <div className="mock-section-label" style={{ marginBottom: 8 }}>
                ACTIVE LEADS
              </div>
              {[
                { initials: 'AK', name: 'Ahmed Al-Khalidi', badge: 'Hot · 84',   cls: 'badge-hot'  },
                { initials: 'SR', name: 'Sara Rashid',      badge: 'Warm · 62',  cls: 'badge-warm' },
                { initials: 'MF', name: 'Mohammed Fahad',   badge: 'Cold · 31',  cls: 'badge-cold' },
              ].map((lead) => (
                <div className="mock-lead-row" key={lead.name}>
                  <div className="mock-avatar">{lead.initials}</div>
                  <div className="mock-lead-name">{lead.name}</div>
                  <div className={`mock-badge ${lead.cls}`}>{lead.badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────
function Intro() {
  const steps = [
    {
      n: '1',
      title: 'Capture from any channel',
      body:  'Meta Ads, landing pages, WhatsApp, Instagram DMs, or your website chat widget.',
    },
    {
      n: '2',
      title: 'Enrich and qualify automatically',
      body:  'AI pulls contact data, scores the lead on BANT criteria, and filters out dead ends in seconds.',
    },
    {
      n: '3',
      title: 'Engage via AI conversation',
      body:  'A human-sounding AI reaches out within 90 seconds over SMS, WhatsApp, or email — and keeps the conversation going.',
    },
    {
      n: '4',
      title: 'Book the appointment',
      body:  'When the lead is ready, the AI offers slots and confirms the booking. Your agent gets a full briefing.',
    },
  ];

  return (
    <section className="intro-section" id="intro">
      <div className="container">
        <div className="intro-grid">
          <div className="reveal">
            <div className="section-label">How it works</div>
            <h2>Lead comes in.<br />Platform takes over.</h2>
            <p>
              From the moment a lead submits a form or clicks an ad, Obsidias
              handles everything — enrichment, qualification, follow-up, and
              booking — without any manual input from your team.
            </p>
            <p>
              Your agents only step in when a lead is hot, qualified, and ready
              to talk.
            </p>
          </div>

          <div className="intro-steps reveal d2">
            {steps.map((s) => (
              <div className="intro-step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-text">
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon:  '🧠',
    bg:    'var(--purple-lt)',
    title: 'AI lead qualification',
    body:  'GPT-4o evaluates every lead against BANT criteria and assigns a confidence score — no more manual screening.',
    delay: '',
  },
  {
    icon:  '💬',
    bg:    'var(--green-lt)',
    title: 'Multi-channel conversations',
    body:  'SMS, WhatsApp, email, and Instagram DM — the AI picks the best channel per lead and maintains context across all of them.',
    delay: 'd1',
  },
  {
    icon:  '📈',
    bg:    'var(--amber-lt)',
    title: 'Predictive lead scoring',
    body:  'Behavioral signals and engagement patterns combine into a live score. Hot leads surface automatically before your team misses them.',
    delay: 'd2',
  },
  {
    icon:  '📅',
    bg:    'var(--red-lt)',
    title: 'Automated appointment booking',
    body:  'The AI offers slots, handles confirmations, and sends reminders — integrated directly with your calendar.',
    delay: 'd1',
  },
  {
    icon:  '🔄',
    bg:    'var(--card)',
    title: 'CRM sync',
    body:  'Every contact, conversation, and stage update syncs to GoHighLevel in real time. No double entry, no gaps.',
    delay: 'd2',
  },
  {
    icon:  '♻️',
    bg:    'var(--blue-lt)',
    title: 'Reactivation campaigns',
    body:  'Cold leads from 30, 60, or 90 days ago get AI-personalised win-back messages automatically. Set it and forget it.',
    delay: 'd3',
  },
];

function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container-wide">
        <div className="section-header reveal">
          <div className="section-label">Features</div>
          <h2>Everything your pipeline needs</h2>
          <p>
            Built around how real estate agencies actually work, not how
            automation tools assume you do.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className={`feature-card reveal ${f.delay}`} key={f.title}>
              <div className="feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────────────────────
const STAGES = [
  { label: 'Capture',  icon: '📥' },
  { label: 'Enrich',   icon: '🔍' },
  { label: 'Qualify',  icon: '✅' },
  { label: 'Engage',   icon: '💬' },
  { label: 'Score',    icon: '📊' },
  { label: 'Book',     icon: '📅' },
  { label: 'Close',    icon: '🤝' },
];

function Pipeline() {
  return (
    <section className="pipeline-section">
      <div className="container-wide">
        <div className="section-header reveal">
          <div className="section-label">The pipeline</div>
          <h2>From ad click to closed deal</h2>
          <p>Every stage is automated. Your team only steps in at the end.</p>
        </div>

        <div className="pipeline-flow reveal">
          {STAGES.map((s, i) => (
            <div className="pipeline-stage" key={s.label}>
              <div className="p-box">
                <div className="p-icon">{s.icon}</div>
                <div className="p-label">{s.label}</div>
              </div>
              {i < STAGES.length - 1 && <div className="p-arrow">→</div>}
            </div>
          ))}
        </div>

        <p className="pipeline-note reveal">
          Stages 1–6 are fully automated. Your agent enters at stage 7 with a
          full AI briefing.
        </p>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name:     'Starter',
    desc:     'For agencies just getting started with AI lead automation.',
    price:    '$297',
    cta:      'Get started',
    ctaTo:    '/signup',
    featured: false,
    delay:    '',
    features: [
      { text: 'Up to 500 leads / month',          on: true  },
      { text: 'SMS + email automation',            on: true  },
      { text: 'AI qualification + scoring',        on: true  },
      { text: 'GoHighLevel sync',                  on: true  },
      { text: 'Cal.com appointment booking',       on: true  },
      { text: 'WhatsApp automation',               on: false },
      { text: 'Custom AI persona',                 on: false },
      { text: 'Multi-agent team access',           on: false },
    ],
  },
  {
    name:     'Growth',
    desc:     'For established agencies scaling their pipeline with automation.',
    price:    '$797',
    cta:      'Get started',
    ctaTo:    '/signup',
    featured: true,
    delay:    'd1',
    features: [
      { text: 'Up to 2,500 leads / month',         on: true  },
      { text: 'SMS + WhatsApp + email',             on: true  },
      { text: 'AI qualification + scoring',         on: true  },
      { text: 'GoHighLevel sync',                   on: true  },
      { text: 'Cal.com appointment booking',        on: true  },
      { text: 'Custom AI persona + brand voice',    on: true  },
      { text: 'Reactivation campaigns',             on: true  },
      { text: 'White-label dashboard',              on: false },
    ],
  },
  {
    name:     'Enterprise',
    desc:     'For brokerages and multi-branch operations at scale.',
    price:    '$2,497',
    cta:      'Talk to us',
    ctaTo:    '/contact',
    featured: false,
    delay:    'd2',
    features: [
      { text: 'Unlimited leads',                    on: true },
      { text: 'All channels including voice AI',    on: true },
      { text: 'Advanced ML lead scoring',           on: true },
      { text: 'GoHighLevel sync',                   on: true },
      { text: 'Cal.com appointment booking',        on: true },
      { text: 'Custom AI persona + brand voice',    on: true },
      { text: 'Reactivation campaigns',             on: true },
      { text: 'White-label dashboard',              on: true },
    ],
  },
];

function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container-wide">
        <div className="section-header reveal">
          <div className="section-label">Pricing</div>
          <h2>Straightforward pricing,<br />no surprises</h2>
          <p>
            All plans include the full automation stack. No per-seat fees for
            agents.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div
              className={`pricing-card reveal ${plan.delay} ${plan.featured ? 'featured' : ''}`}
              key={plan.name}
            >
              {plan.featured && (
                <div className="pricing-badge">Most popular</div>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-desc">{plan.desc}</div>
              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span> / month</span>
              </div>
              <Link to={plan.ctaTo} className="plan-cta">
                {plan.cta}
              </Link>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f.text} className={f.on ? '' : 'off'}>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text:    '"We went from calling every lead manually to having the AI qualify and book appointments while we slept. Our show rate went from 40% to 68% in the first month."',
    initials:'KA',
    name:    'Khalid Al-Ansari',
    role:    'Managing Director, Vista Properties',
    delay:   '',
  },
  {
    text:    '"The 90-second response time alone changed everything. We were losing leads to competitors who replied faster. Obsidias fixed that without us hiring a single person."',
    initials:'NM',
    name:    'Nadia Mohammed',
    role:    'Head of Sales, Gulf Realty Group',
    delay:   'd1',
  },
  {
    text:    '"The reactivation campaigns brought back 11 deals from leads we\'d written off as dead. That alone paid for a year of the platform."',
    initials:'FA',
    name:    'Faisal Al-Dosari',
    role:    'Founder, Landmark Residential',
    delay:   'd2',
  },
];

function Testimonials() {
  return (
    <section className="proof-section">
      <div className="container-wide">
        <div className="section-header reveal">
          <div className="section-label">What agencies say</div>
          <h2>Real results, real agencies</h2>
        </div>

        <div className="proof-grid">
          {TESTIMONIALS.map((t) => (
            <div className={`proof-card reveal ${t.delay}`} key={t.name}>
              <p className="proof-text">{t.text}</p>
              <div className="proof-author">
                <div className="proof-avatar">{t.initials}</div>
                <div>
                  <div className="proof-name">{t.name}</div>
                  <div className="proof-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA BAND ──────────────────────────────────────────────────────────────────
function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <h2 className="reveal">
          Start closing more deals<br />this week.
        </h2>
        <p className="reveal d1">
          14-day free trial. No credit card. Full platform access from day one.
        </p>
        <Link to="/signup" className="btn-light reveal d2">
          Start free trial
        </Link>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="footer-logo">OBSIDIAS</Link>
      <div className="footer-links">
        <a href="#intro">Product</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
      <small>© 2025 Obsidias Services</small>
    </footer>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  useReveal();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <DashboardMockup />
        <Intro />
        <Features />
        <Pipeline />
        <Pricing />
        <Testimonials />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
