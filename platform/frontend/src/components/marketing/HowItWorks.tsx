'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './HowItWorks.css';

interface Step {
  n: string;
  title: string;
  body: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'A lead messages your agency',
    body: 'On WhatsApp, an Instagram DM, or a form on your site. It lands in one inbox immediately, whichever channel they used, instead of sitting unread in an app nobody checks after hours.',
    detail: 'Nothing about this step depends on someone being online to notice it.',
  },
  {
    n: '02',
    title: 'The lead is checked against Budget, Authority, Need and Timeline',
    body: "The AI reads what the lead actually said and works out how much of that it knows. A lead who names a budget, confirms they're the decision-maker, and gives a timeline scores high confidence. A one-line enquiry with none of that scores low, honestly, not optimistically.",
    detail: 'This runs before an agent ever opens the conversation, so nobody is qualifying leads by hand.',
  },
  {
    n: '03',
    title: 'A confident lead gets a reply, an uncertain one gets a person',
    body: "Above the confidence threshold you set, the AI replies directly, on the same channel, in under 90 seconds. Below it, the lead routes to the Review Queue with the AI's reasoning attached, so a human is deciding with context, not from a blank slate.",
    detail: "The threshold is yours to set. A cautious agency and an aggressive one can run the same system differently.",
  },
  {
    n: '04',
    title: 'The conversation keeps moving on its own',
    body: "Follow-up questions get contextual answers, not a script repeating itself. If a lead asks something the AI genuinely does not know, like a specific price or availability it was never given, it says so and hands the thread to a person rather than guessing.",
    detail: 'Any agent can take over a conversation at any point with one click. The AI stops the moment that happens.',
  },
  {
    n: '05',
    title: 'A ready lead gets a viewing on the calendar',
    body: "Once a lead is qualified and wants to move forward, a viewing time gets offered and booked onto your team's actual calendar, not a spreadsheet updated at the end of the day. The agent walks in already knowing the full conversation.",
    detail: 'Reschedules and cancellations sync back the same way the booking did.',
  },
  {
    n: '06',
    title: 'The lead is pushed to your CRM',
    body: 'A qualified lead flows into whichever CRM your team already works out of, with source, channel, and qualification notes attached, so nobody is re-typing a name and number they already have.',
    detail: 'If the contact already exists there, it gets updated rather than duplicated.',
  },
  {
    n: '07',
    title: 'A cold lead gets a second chance',
    body: "If nobody has followed up with a lead in a week, it gets flagged and moved into nurturing on its own, with your team notified. Buyers who were genuinely interested stop quietly disappearing from the list.",
    detail: 'The flag shows exactly how long the lead has been quiet, not just that it went cold.',
  },
];

function HowHero() {
  return (
    <section className="h-hero">
      <div className="o-wide">
        <p className="o-eyebrow m-enter">How it works</p>
        <h1 className="o-display h-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">First message</span></span>
          <span className="m-line-mask"><span className="m-line o-dim">to booked viewing.</span></span>
        </h1>
        <p className="o-lede m-enter m-e2">
          This is the actual sequence a lead goes through, described the way
          you would see it happen, not the way it is built.
        </p>
      </div>
    </section>
  );
}

function StepList() {
  return (
    <section className="h-steps">
      <div className="o-wide h-step-list">
        {STEPS.map((s, i) => (
          <article className={`o-bezel m-card m-reveal m-d${(i % 3) + 1}`} key={s.n}>
            <div className="o-bezel-core h-step">
              <div className="h-step-num"><span className="o-mono">{s.n}</span></div>
              <div className="h-step-body">
                <h3 className="o-h3">{s.title}</h3>
                <p className="o-body h-step-text">{s.body}</p>
                <p className="h-step-detail">{s.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowCta() {
  return (
    <section className="h-cta-wrap">
      <div className="o-wide">
        <div className="h-cta m-reveal">
          <p className="o-eyebrow on-deep">Already running</p>
          <h2 className="o-h2 h-cta-title">Every step above <span className="o-dim">is live today.</span></h2>
          <p className="o-lede h-cta-lede">
            This is not a roadmap. It is the sequence a lead who messages your
            agency today goes through.
          </p>
          <div className="h-cta-row">
            <Link href="/features" className="o-btn o-btn-light">
              See all features
              <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-right" /></span>
            </Link>
            <Link href="/login" className="o-btn h-btn-outline">Request access</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  useReveal();

  return (
    <>
      <div className="o-mesh m-drift" aria-hidden="true" />
      <MarketingNav />
      <main className="h-main">
        <HowHero />
        <StepList />
        <HowCta />
      </main>
      <MarketingFooter />
    </>
  );
}
