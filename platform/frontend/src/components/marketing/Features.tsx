'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import './Marketing.css';
import './Features.css';

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

interface Feature {
  icon: string;
  title: string;
  body: string;
  detail: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'ti-messages',
    title: 'Every channel in one inbox',
    body: 'WhatsApp, Instagram DMs, and email all land in the same place instead of three apps and a phone nobody checks after 6pm. Nothing gets missed because it arrived on the channel someone forgot to open.',
    detail: 'Each conversation keeps the full history in one thread, whichever channel the lead used to reach out.',
  },
  {
    icon: 'ti-list-check',
    title: 'AI qualification against BANT',
    body: "Every lead is assessed against Budget, Authority, Need and Timeline before an agent spends a minute on it. Leads that clearly aren't a fit get a reason attached instead of sitting in a pile for someone to sort through later.",
    detail: 'Confidence is scored on what was actually said, not how enthusiastic the message sounds.',
  },
  {
    icon: 'ti-message-chatbot',
    title: 'Conversations that keep moving',
    body: 'The AI replies within 90 seconds, on whichever channel the lead is on, in the tone your agency actually uses. Follow-up questions are answered in context, not with a script that repeats itself.',
    detail: 'It sticks to what it actually knows. It will not invent a price or availability it was never told.',
  },
  {
    icon: 'ti-user-check',
    title: 'A human is always one click away',
    body: 'Any conversation can be handed to a named agent instantly, and the AI stops replying the moment that happens. Low-confidence leads route to a person automatically rather than being guessed at.',
    detail: "The Review Queue shows exactly why the AI wasn't sure, so a person isn't starting from zero.",
  },
  {
    icon: 'ti-calendar-event',
    title: 'Viewings booked on a real calendar',
    body: "Once a lead is ready, a viewing goes straight onto your team's actual calendar, not a spreadsheet someone updates at the end of the day. The agent sees the full conversation before they walk in.",
    detail: 'Cancellations and reschedules sync back the same way, so the calendar never drifts out of date.',
  },
  {
    icon: 'ti-refresh',
    title: 'Qualified leads sync to your CRM',
    body: "A lead that clears qualification is pushed to the CRM your team already works out of, with source and channel attached. Nobody has to copy names and numbers across systems by hand.",
    detail: 'If a contact already exists, it gets updated in place instead of creating a duplicate.',
  },
  {
    icon: 'ti-alarm',
    title: 'Cold leads get a second look',
    body: "A lead nobody has followed up with in a week gets flagged and moved into nurturing automatically, with your team notified. Interested buyers stop quietly falling off the list.",
    detail: 'The flag comes with how long the lead has been quiet, so it is easy to judge how urgent it is.',
  },
  {
    icon: 'ti-chart-bar',
    title: 'A clear read on what is working',
    body: 'Response times, lead sources, and qualification outcomes in one place, so you know which channel and which campaign is actually producing buyers, not just messages.',
    detail: 'Built for a weekly glance, not a report someone has to assemble by hand.',
  },
];

function FeaturesHero() {
  return (
    <section className="l-fhero">
      <div className="l-wide">
        <p className="l-hero-eyebrow l-enter">Features</p>
        <h1 className="l-fhero-title l-enter l-e1">
          Everything the platform does, in plain terms.
        </h1>
        <p className="l-hero-sub l-enter l-e2">
          No dashboard tour, no jargon. This is what actually happens to a
          lead from the moment they message your agency to the moment they
          are on your calendar.
        </p>
      </div>
    </section>
  );
}

function FeatureList() {
  return (
    <section className="l-flist">
      <div className="l-wide">
        <div className="l-flist-grid">
          {FEATURES.map((f, i) => (
            <div className={`l-fcard reveal d${(i % 4) + 1}`} key={f.title}>
              <i className={`ti ${f.icon} l-fcard-icon`} aria-hidden="true" />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <p className="l-fcard-detail">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesCta() {
  return (
    <section className="l-final">
      <div className="l-container">
        <h2 className="reveal">See how the pieces fit together.</h2>
        <p className="reveal d1">
          The full walkthrough covers what happens at each step, from the
          first message to a booked viewing.
        </p>
        <div className="l-fcta-row reveal d2">
          <Link href="/how-it-works" className="btn-white">How it works</Link>
          <Link href="/login" className="btn-outline l-fcta-outline">Request access</Link>
        </div>
      </div>
    </section>
  );
}

export default function Features() {
  useReveal();

  return (
    <>
      <MarketingNav />
      <main>
        <FeaturesHero />
        <FeatureList />
        <FeaturesCta />
      </main>
      <MarketingFooter />
    </>
  );
}
