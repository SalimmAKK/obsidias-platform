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
  intro: string;
  points: string[];
}

const FEATURES: Feature[] = [
  {
    icon: 'ti-messages',
    title: 'Every channel in one inbox',
    intro: 'WhatsApp, Instagram, and email, captured in one place.',
    points: [
      'WhatsApp, Instagram DM, and email captured in one inbox',
      'Full conversation history kept in a single thread per lead',
      'Nothing missed because it arrived on an unopened app',
    ],
  },
  {
    icon: 'ti-list-check',
    title: 'AI qualification against BANT',
    intro: 'Every lead scored before an agent spends time on it.',
    points: [
      'Scored against Budget, Authority, Need, and Timeline',
      'Confidence based on what was actually said',
      'Unfit leads archived with a reason attached',
    ],
  },
  {
    icon: 'ti-message-chatbot',
    title: 'Conversations that keep moving',
    intro: 'Replies go out fast, and stay grounded in what it knows.',
    points: [
      'Replies sent within 90 seconds, on the same channel',
      'Follow-up questions answered in context',
      'Never invents a price or availability it was not given',
    ],
  },
  {
    icon: 'ti-user-check',
    title: 'A human is always one click away',
    intro: 'Handoff is instant, and never left to guesswork.',
    points: [
      'Any conversation handed to a named agent instantly',
      'Low-confidence leads route to the Review Queue automatically',
      "AI reasoning attached, so a person isn't starting from zero",
    ],
  },
  {
    icon: 'ti-calendar-event',
    title: 'Viewings booked on a real calendar',
    intro: 'Booking a viewing does not mean updating a spreadsheet.',
    points: [
      "Booking goes straight onto your team's actual calendar",
      'Agent sees the full conversation before the viewing',
      'Cancellations and reschedules sync back automatically',
    ],
  },
  {
    icon: 'ti-refresh',
    title: 'Qualified leads sync to your CRM',
    intro: 'Nothing gets retyped from one system into another.',
    points: [
      'Pushed to your existing CRM automatically',
      'Source and channel attached to every record',
      'Existing contacts updated, never duplicated',
    ],
  },
  {
    icon: 'ti-alarm',
    title: 'Cold leads get a second look',
    intro: 'Interested buyers stop quietly falling off the list.',
    points: [
      'Leads quiet for a week are flagged automatically',
      'Moved into nurturing with your team notified',
      'Shows exactly how long the lead has been quiet',
    ],
  },
  {
    icon: 'ti-chart-bar',
    title: 'A clear read on what is working',
    intro: 'Built for a weekly glance, not a report to assemble.',
    points: [
      'Response times, sources, and outcomes in one view',
      'See which channel and campaign produce buyers',
      'No spreadsheet exports or manual counting',
    ],
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
              <div className="l-fcard-head">
                <i className={`ti ${f.icon} l-fcard-icon`} aria-hidden="true" />
                <h3>{f.title}</h3>
              </div>
              <p className="l-fcard-intro">{f.intro}</p>
              <ul className="l-fcheck-list">
                {f.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
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
