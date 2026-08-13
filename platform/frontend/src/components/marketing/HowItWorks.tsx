'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import './Marketing.css';
import './HowItWorks.css';

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
    <section className="l-hhero">
      <div className="l-wide">
        <p className="l-hero-eyebrow l-enter">How it works</p>
        <h1 className="l-hhero-title l-enter l-e1">
          From the first message to a booked viewing, step by step.
        </h1>
        <p className="l-hero-sub l-enter l-e2">
          This is the actual sequence a lead goes through, described the way
          you would see it happen, not the way it is built.
        </p>
      </div>
    </section>
  );
}

function StepList() {
  return (
    <section className="l-hsteps">
      <div className="l-wide">
        <div className="l-hstep-list">
          {STEPS.map((s) => (
            <div className="l-hstep reveal" key={s.n}>
              <div className="l-hstep-num">{s.n}</div>
              <div className="l-hstep-body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <p className="l-hstep-detail">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowCta() {
  return (
    <section className="l-final">
      <div className="l-container">
        <h2 className="reveal">Every step above is already running.</h2>
        <p className="reveal d1">
          This is not a roadmap. It is the sequence a lead who messages your
          agency today goes through.
        </p>
        <div className="l-fcta-row reveal d2">
          <Link href="/features" className="btn-white">See all features</Link>
          <Link href="/login" className="btn-outline l-fcta-outline">Request access</Link>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  useReveal();

  return (
    <>
      <MarketingNav />
      <main>
        <HowHero />
        <StepList />
        <HowCta />
      </main>
      <MarketingFooter />
    </>
  );
}
