'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './Subpage.css';

/* A monthly subscription, billed monthly, stated plainly rather than implied
   by a "$297 / month" card. Rebuilt on the Atelier Zero card system; the
   featured tier runs on the dark slab colour so the tier most agencies land
   on is the one the eye reaches first. */

const PLANS = [
  {
    name: 'Independent agency',
    audience: '1 to 5 agents, one office',
    price: '$297',
    desc: 'For agencies under 500 leads a month who want the qualification layer running without hiring for it.',
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
    audience: '6 to 25 agents',
    price: '$797',
    desc: 'The tier most agencies at this size land on. Every channel, plus reactivation for leads that have gone cold.',
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
    audience: '25+ agents, multiple branches',
    price: 'Custom',
    desc: 'For brokerages running high volume across branches, with per-branch reporting and a dashboard under your own name.',
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

function PricingHero() {
  return (
    <section className="s-hero">
      <div className="o-wide">
        <span className="o-label m-enter">Pricing <span className="o-ix">· Nº 01</span></span>
        <h1 className="o-display s-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">Sized to your agency,</span></span>
          <span className="m-line-mask"><span className="m-line"><em>not your headcount</em><span className="o-dot">.</span></span></span>
        </h1>
        <p className="o-lede s-hero-lede m-enter m-e2">
          A monthly subscription, billed monthly. No per-agent charges, no
          setup fee, and no annual contract to get out of. The limit on every
          plan is lead volume, so adding agents never adds to your bill.
        </p>
      </div>
    </section>
  );
}

function PlanList() {
  return (
    <section className="s-section">
      <div className="o-wide">
        <div className="s-grid">
          {PLANS.map((plan, i) => (
            <article
              className={`o-card m-card m-reveal m-d${(i % 3) + 1} s-plan-card${plan.featured ? ' featured' : ''}`}
              key={plan.name}
            >
              <div className="s-plan">
                {plan.featured && <span className="s-plan-flag">Most common at this size</span>}
                <p className="s-plan-audience">{plan.audience}</p>
                <h3 className="s-plan-name">{plan.name}</h3>
                <p className="o-body s-plan-desc">{plan.desc}</p>
                <p className="s-plan-price">
                  {plan.price}
                  {plan.price !== 'Custom' && <span> / month</span>}
                </p>
                {plan.ctaTo === '/contact' ? (
                  <a
                    href="#"
                    title="Non-functional in prototype"
                    className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-ghost'} s-plan-btn`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaTo}
                    className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-primary'} s-plan-btn`}
                  >
                    {plan.cta}
                    <span className="o-btn-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
                    </span>
                  </Link>
                )}
                <ul className="s-check">
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p className="s-note m-reveal">
          Billed monthly by card · Cancel anytime, no notice period · Prices in USD
        </p>
      </div>
    </section>
  );
}

function PricingCta() {
  return (
    <section className="s-cta-wrap">
      <div className="o-wide">
        <div className="o-slab grain-dark m-reveal" style={{ margin: 0 }}>
          <div className="o-slab-inner">
            <span className="o-label">Not sure which tier</span>
            <h2 className="o-h2 s-cta-title">
              Tell us your lead volume, we&rsquo;ll tell you the <em>plan</em><span className="o-dot">.</span>
            </h2>
            <p className="o-lede s-cta-lede">
              Most agencies know within a minute of describing how they work
              today. Setup takes an afternoon, not a quarter.
            </p>
            <div className="s-cta-row">
              <Link href="/login" className="o-btn o-btn-light">
                Request access
                <span className="o-btn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
                </span>
              </Link>
              <a href="#" title="Non-functional in prototype" className="o-btn o-btn-outline">Talk to us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  useReveal();

  return (
    <>
      <MarketingNav />
      <div className="o-shell">
        <main>
          <PricingHero />
          <PlanList />
          <PricingCta />
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
