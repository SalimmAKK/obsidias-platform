'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { AuditTrailArtifact } from './AuditTrailArtifact';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './Subpage.css';
import './HowItWorks.css';

/* Simplified from the previous long-form walkthrough into numbered step
   cards on the shared subpage system. Same seven steps, same honest framing,
   read in a fraction of the time. */

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
    body: 'On WhatsApp, an Instagram DM, or email. It lands in one inbox immediately, whichever channel they used, instead of sitting unread in an app nobody checks after hours.',
    detail: 'No one has to be online for this step',
  },
  {
    n: '02',
    title: 'Budget, authority, need, timeline',
    body: 'The AI reads what the lead actually said and works out how much of it it genuinely knows. A named budget, a confirmed decision-maker, and a real timeline score high. A one-line enquiry scores low, honestly.',
    detail: 'Runs before an agent opens the thread',
  },
  {
    n: '03',
    title: 'Confident leads get a reply',
    body: 'Above the threshold you set, the AI answers directly on the same channel in under 90 seconds, with the availability and detail it was actually given.',
    detail: 'Target reply time · under 90s',
  },
  {
    n: '04',
    title: 'Uncertain leads get a person',
    body: 'Below the threshold, the lead routes to the review queue with the reasoning attached, so a human decides with context rather than from a blank slate.',
    detail: 'Threshold is yours to set',
  },
  {
    n: '05',
    title: 'The conversation keeps moving',
    body: 'Follow-ups get contextual answers, not a script repeating itself. If a lead asks something the AI genuinely does not know, it says so and hands the thread to a person rather than guessing.',
    detail: 'Any agent can take over in one click',
  },
  {
    n: '06',
    title: 'A ready lead gets a viewing',
    body: 'Once qualified and willing, a viewing time is offered and booked onto your team’s real calendar. The agent walks in already knowing the whole conversation.',
    detail: 'Reschedules sync the same way',
  },
  {
    n: '07',
    title: 'The record is written down',
    body: 'The qualified lead is pushed to your CRM with source, channel, and qualification notes, and every AI decision is logged against it permanently.',
    detail: 'Updated, never duplicated',
  },
];

function HowHero() {
  return (
    <section className="s-hero">
      <div className="o-wide">
        <span className="o-label m-enter">How it works <span className="o-ix">· Nº 01</span></span>
        <h1 className="o-display s-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">First message to</span></span>
          <span className="m-line-mask"><span className="m-line"><em>booked viewing</em><span className="o-dot">.</span></span></span>
        </h1>
        <p className="o-lede s-hero-lede m-enter m-e2">
          The actual sequence a lead goes through, described the way you would
          see it happen rather than the way it is built.
        </p>
      </div>
    </section>
  );
}

function StepList() {
  return (
    <section className="s-section">
      <div className="o-wide">
        <div className="s-grid">
          {STEPS.map((s, i) => (
            <article className={`o-card m-card m-reveal m-d${(i % 3) + 1}`} key={s.n}>
              <div className="s-card">
                <div className="s-step-num">{s.n}</div>
                <h3 className="o-h3 h-step-title">{s.title}</h3>
                <p className="o-body">{s.body}</p>
                <p className="s-step-detail">{s.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuditSection() {
  return (
    <section className="s-section">
      <div className="o-wide">
        <div className="o-rule">
          <span className="o-rule-roman">II.</span>
          <span className="o-rule-grp">
            <span>Audit / What gets written down</span>
            <span className="o-rule-dot">•</span>
            <span>Permanent, per lead</span>
          </span>
          <span>002 / 002</span>
        </div>

        <div className="h-audit-grid">
          <div className="m-reveal">
            <span className="o-label">Audit <span className="o-ix">· Nº 02</span></span>
            <h2 className="o-h2 h-audit-title">
              Every step above leaves a <em>record</em><span className="o-dot">.</span>
            </h2>
            <p className="o-lede">
              If a client ever questions something the AI said, you can see
              exactly what was sent, when, on what basis, and who took over.
              That log is the reason agencies are willing to let it answer at
              all.
            </p>
          </div>
          <div className="m-reveal m-d1">
            <AuditTrailArtifact />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowCta() {
  return (
    <section className="s-cta-wrap">
      <div className="o-wide">
        <div className="o-slab grain-dark m-reveal" style={{ margin: 0 }}>
          <div className="o-slab-inner">
            <span className="o-label">Already running</span>
            <h2 className="o-h2 s-cta-title">
              Every step above is <em>live today</em><span className="o-dot">.</span>
            </h2>
            <p className="o-lede s-cta-lede">
              This is not a roadmap. It is the sequence a lead who messages
              your agency today goes through.
            </p>
            <div className="s-cta-row">
              <Link href="/features" className="o-btn o-btn-light">
                See all features
                <span className="o-btn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
                </span>
              </Link>
              <Link href="/login" className="o-btn o-btn-outline">Request access</Link>
            </div>
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
      <MarketingNav />
      <div className="o-shell">
        <main>
          <HowHero />
          <StepList />
          <AuditSection />
          <HowCta />
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
