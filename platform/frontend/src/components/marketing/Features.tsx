'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { PipelineArtifact } from './PipelineArtifact';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './Features.css';

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
    <section className="f-hero">
      <div className="o-wide">
        <p className="o-eyebrow m-enter">Features</p>
        <h1 className="o-display f-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">Everything it does,</span></span>
          <span className="m-line-mask"><span className="m-line o-dim">in plain terms.</span></span>
        </h1>
        <p className="o-lede m-enter m-e2">
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
    <section className="f-list">
      <div className="o-wide f-grid">
        {FEATURES.map((f, i) => (
          <article className={`o-bezel m-card m-reveal m-d${(i % 3) + 1}`} key={f.title}>
            <div className="o-bezel-core f-card">
              <div className="f-card-head">
                <span className="f-icon" aria-hidden="true"><i className={`ti ${f.icon}`} /></span>
                <h3 className="o-h3">{f.title}</h3>
              </div>
              <p className="o-body f-intro">{f.intro}</p>
              <ul className="f-check">
                {f.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section className="f-pipeline">
      <div className="o-wide f-pipeline-grid">
        <div className="m-reveal">
          <p className="o-eyebrow">Reporting</p>
          <h2 className="o-h2 f-pipeline-title">The week, <span className="o-dim">without assembling it.</span></h2>
          <p className="o-lede f-pipeline-lede">
            Where leads entered, what cleared qualification, what a human
            picked up, and what reached a calendar. Built for a weekly glance,
            not a report someone exports and formats by hand.
          </p>
        </div>
        <div className="m-reveal m-d1">
          <PipelineArtifact />
        </div>
      </div>
    </section>
  );
}

function FeaturesCta() {
  return (
    <section className="f-cta-wrap">
      <div className="o-wide">
        <div className="f-cta m-reveal">
          <p className="o-eyebrow on-deep">Next</p>
          <h2 className="o-h2 f-cta-title">See how the pieces <span className="o-dim">fit together.</span></h2>
          <p className="o-lede f-cta-lede">
            The full walkthrough covers what happens at each step, from the
            first message to a booked viewing.
          </p>
          <div className="f-cta-row">
            <Link href="/how-it-works" className="o-btn o-btn-light">
              How it works
              <span className="o-btn-icon" aria-hidden="true"><i className="ti ti-arrow-right" /></span>
            </Link>
            <Link href="/login" className="o-btn f-btn-outline">Request access</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Features() {
  useReveal();

  return (
    <>
      <div className="o-mesh m-drift" aria-hidden="true" />
      <MarketingNav />
      <main className="f-main">
        <FeaturesHero />
        <FeatureList />
        <PipelineSection />
        <FeaturesCta />
      </main>
      <MarketingFooter />
    </>
  );
}
