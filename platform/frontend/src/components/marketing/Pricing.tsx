'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './Pricing.css';

/* Moved off the main landing page so pricing gets its own page to reason
   about, rather than being one more section in a long scroll. A monthly
   subscription, billed monthly, no contract — that's said explicitly here
   instead of only implied by "$297 / month" on a card. */
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

function PricingHero() {
  return (
    <section className="p-hero">
      <div className="o-wide">
        <p className="o-eyebrow m-enter">Pricing</p>
        <h1 className="o-display p-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">Sized to your agency,</span></span>
          <span className="m-line-mask"><span className="m-line o-dim">not your headcount.</span></span>
        </h1>
        <p className="o-lede p-hero-lede m-enter m-e2">
          A monthly subscription, billed monthly. No per-agent charges, no
          setup fee, no annual contract to get out of. The limit on every
          plan is lead volume, so adding agents never adds to your bill.
        </p>
      </div>
    </section>
  );
}

function PlanList() {
  return (
    <section className="p-plans-section">
      <div className="o-wide">
        <div className="p-plans">
          {PLANS.map((plan, i) => (
            <article
              key={plan.name}
              className={`o-bezel m-card m-reveal m-d${i + 1}${plan.featured ? ' on-deep p-plan-featured' : ''}`}
            >
              <div className="o-bezel-core p-plan">
                {plan.featured && <span className="p-plan-flag">Most common at this size</span>}
                <p className="o-mono">{plan.audience}</p>
                <h3 className="p-plan-name">{plan.name}</h3>
                <p className="o-body p-plan-desc">{plan.desc}</p>
                <p className="p-plan-price">
                  {plan.price}
                  {plan.price !== 'Custom' && <span> / month</span>}
                </p>
                {plan.ctaTo === '/contact' ? (
                  <a href="#" title="Non-functional in prototype" className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-ghost'} p-plan-btn`}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.ctaTo} className={`o-btn ${plan.featured ? 'o-btn-light' : 'o-btn-ghost'} p-plan-btn`}>
                    {plan.cta}
                    <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-right" /></span>
                  </Link>
                )}
                <ul className="p-plan-list">
                  {plan.features.map((f, fi) => <li key={`${plan.name}-${fi}`}>{f}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <p className="p-note m-reveal">
          Billed monthly by card. Cancel anytime, no notice period. Prices in USD.
        </p>
      </div>
    </section>
  );
}

function PricingCta() {
  return (
    <section className="p-cta-wrap">
      <div className="o-wide">
        <div className="p-cta m-reveal">
          <p className="o-eyebrow on-deep">Not sure which tier</p>
          <h2 className="o-h2 p-cta-title">Tell us your lead volume, <span className="o-dim">we'll tell you the plan.</span></h2>
          <p className="o-lede p-cta-lede">
            Most agencies know within a minute of describing how they work
            today. Setup takes an afternoon, not a quarter.
          </p>
          <div className="p-cta-row">
            <Link href="/login" className="o-btn o-btn-light">
              Request access
              <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-up-right" /></span>
            </Link>
            <a href="#" title="Non-functional in prototype" className="o-btn p-btn-outline">Talk to us</a>
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
      <div className="o-mesh m-drift" aria-hidden="true" />
      <MarketingNav />
      <main className="p-main">
        <PricingHero />
        <PlanList />
        <PricingCta />
      </main>
      <MarketingFooter />
    </>
  );
}
