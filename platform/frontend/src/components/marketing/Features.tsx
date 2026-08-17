'use client';
import Link from 'next/link';
import { MarketingNav, MarketingFooter } from './MarketingChrome';
import { PipelineArtifact } from './PipelineArtifact';
import { useReveal } from '@/lib/useReveal';
import './Marketing.css';
import './Subpage.css';
import './Features.css';

/* Simplified to a single card grid on the Atelier Zero system. Each feature
   is one card: numeral, tag, headline, what it does, and the specifics that
   matter underneath. No screenshots — the artifact at the bottom carries the
   one visual this page needs. */

interface Feature {
  num: string;
  tag: string;
  title: React.ReactNode;
  intro: string;
  points: string[];
}

const FEATURES: Feature[] = [
  {
    num: '01',
    tag: 'Capture',
    title: <>Every channel,<br />one inbox</>,
    intro: 'WhatsApp, Instagram DM, and email arrive in the same place the moment a lead reaches out.',
    points: [
      'WhatsApp Cloud API, Instagram, and email',
      'Full conversation history kept per lead',
      'Nothing stranded in an app nobody opened',
    ],
  },
  {
    num: '02',
    tag: 'Qualify',
    title: <>BANT scoring on<br />every lead</>,
    intro: 'Budget, authority, need, and timeline judged against what the lead actually said, not how eager they sound.',
    points: [
      'A confidence figure with every score',
      'Reasoning attached to each of the four lines',
      'Leads that are not a fit archived with a reason',
    ],
  },
  {
    num: '03',
    tag: 'Converse',
    title: <>Replies inside<br />90 seconds</>,
    intro: 'The AI answers on the channel the lead used and keeps answering follow-ups in context.',
    points: [
      'Same channel, day or night',
      'Never invents a price or an availability',
      'Hands over the moment it is genuinely unsure',
    ],
  },
  {
    num: '04',
    tag: 'Control',
    title: <>A threshold you<br />set yourself</>,
    intro: 'Below your confidence threshold the AI stops and a person decides, with the reasoning already written down.',
    points: [
      'Review queue with full context',
      'One click for an agent to take over a thread',
      'The AI stops on that thread immediately',
    ],
  },
  {
    num: '05',
    tag: 'Book',
    title: <>Viewings on the<br />real calendar</>,
    intro: 'A lead who is ready gets an actual slot on your team’s calendar, not a note to follow up later.',
    points: [
      'Cal.com booking with reschedule sync',
      'Agent briefed with the full thread',
      'Confirmation sent on the original channel',
    ],
  },
  {
    num: '06',
    tag: 'Record',
    title: <>Synced, logged,<br />and auditable</>,
    intro: 'Qualified leads flow into your CRM and every AI decision is recorded against the lead permanently.',
    points: [
      'HubSpot sync, updated rather than duplicated',
      'Slack alert when a lead needs a human',
      'Cold leads resurfaced after a week quiet',
    ],
  },
];

function FeaturesHero() {
  return (
    <section className="s-hero">
      <div className="o-wide">
        <span className="o-label m-enter">Features <span className="o-ix">· Nº 01</span></span>
        <h1 className="o-display s-hero-title m-lines m-lines-auto">
          <span className="m-line-mask"><span className="m-line">What it actually</span></span>
          <span className="m-line-mask"><span className="m-line"><em>does</em><span className="o-dot">.</span></span></span>
        </h1>
        <p className="o-lede s-hero-lede m-enter m-e2">
          Six capabilities, all of them shipped and running today. Nothing on
          this page is a roadmap item.
        </p>
      </div>
    </section>
  );
}

function FeatureList() {
  return (
    <section className="s-section">
      <div className="o-wide">
        <div className="s-grid">
          {FEATURES.map((f, i) => (
            <article className={`o-card m-card m-reveal m-d${(i % 3) + 1}`} key={f.num}>
              <div className="s-card">
                <div className="o-card-num">
                  {f.num}
                  <span className="o-card-tag">{f.tag}</span>
                </div>
                <h3 className="o-h3">{f.title}</h3>
                <p className="o-body s-card-split">{f.intro}</p>
                <ul className="s-check">
                  {f.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section className="s-section">
      <div className="o-wide">
        <div className="o-rule">
          <span className="o-rule-roman">II.</span>
          <span className="o-rule-grp">
            <span>Throughput / A week in aggregate</span>
            <span className="o-rule-dot">•</span>
            <span>Stage by stage</span>
          </span>
          <span>002 / 002</span>
        </div>

        <div className="f-pipeline-grid">
          <div className="m-reveal">
            <span className="o-label">Throughput <span className="o-ix">· Nº 02</span></span>
            <h2 className="o-h2 f-pipeline-title">
              What it looks like <em>across a week</em><span className="o-dot">.</span>
            </h2>
            <p className="o-lede">
              Leads that fall below threshold are held for a person and leads
              that are not a fit are archived with a reason, which is why these
              stages do not reduce cleanly. A funnel where nothing is lost is
              not a pipeline, it is a marketing graphic.
            </p>
          </div>
          <div className="m-reveal m-d1">
            <PipelineArtifact />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesCta() {
  return (
    <section className="s-cta-wrap">
      <div className="o-wide">
        <div className="o-slab grain-dark m-reveal" style={{ margin: 0 }}>
          <div className="o-slab-inner">
            <span className="o-label">Get started</span>
            <h2 className="o-h2 s-cta-title">
              All of it running <em>this afternoon</em><span className="o-dot">.</span>
            </h2>
            <p className="o-lede s-cta-lede">
              Connect a WhatsApp number, set your threshold, and the qualification
              layer is live. Setup takes an afternoon, not a quarter.
            </p>
            <div className="s-cta-row">
              <Link href="/login" className="o-btn o-btn-light">
                Request access
                <span className="o-btn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H8M19 5v11" /></svg>
                </span>
              </Link>
              <Link href="/how-it-works" className="o-btn o-btn-outline">See how it works</Link>
            </div>
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
      <MarketingNav />
      <div className="o-shell">
        <main>
          <FeaturesHero />
          <FeatureList />
          <PipelineSection />
          <FeaturesCta />
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
