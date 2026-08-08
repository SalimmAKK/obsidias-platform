import { useState, useCallback } from 'react';
import './ReviewQueue.css';

// ── TYPES ─────────────────────────────────────────────────────────────────────
type BantSignal = 'high' | 'medium' | 'low' | 'strong' | 'moderate' | 'weak' |
                  'immediate' | '3months' | '6months' | 'unknown' | 'true' | 'false';

type Bucket = 'hot' | 'warm' | 'cold';
type Channel = 'sms' | 'whatsapp' | 'email' | 'instagram_dm';
type Source  = 'Meta Ad' | 'Landing Page' | 'Chat Widget' | 'Referral' | 'Instagram';

export interface ReviewLead {
  id:         string;
  firstName:  string;
  lastName:   string;
  source:     Source;
  channel:    Channel;
  capturedAt: string;
  bucket:     Bucket;
  confidence: number;
  bant: {
    budget:    BantSignal;
    authority: BantSignal;
    need:      BantSignal;
    timeline:  BantSignal;
  };
  qualificationNotes: string;
}

// ── MOCK DATA (replace with API fetch) ────────────────────────────────────────
const MOCK_LEADS: ReviewLead[] = [
  {
    id: '1',
    firstName: 'Rania', lastName: 'Al-Farsi',
    source: 'Meta Ad', channel: 'whatsapp',
    capturedAt: '2h ago', bucket: 'warm',
    confidence: 0.48,
    bant: { budget: 'medium', authority: 'unknown', need: 'strong', timeline: '3months' },
    qualificationNotes: 'Lead expressed strong purchase intent but did not confirm decision-maker status. Budget signal is consistent with target range however authority is unclear — may be researching on behalf of a family member.',
  },
  {
    id: '2',
    firstName: 'Yousef', lastName: 'Bin Saleh',
    source: 'Landing Page', channel: 'email',
    capturedAt: '4h ago', bucket: 'cold',
    confidence: 0.41,
    bant: { budget: 'unknown', authority: 'true', need: 'moderate', timeline: 'unknown' },
    qualificationNotes: 'Confirmed as sole decision-maker and interest is genuine, but budget and timeline are completely absent from enrichment data and the lead has not responded to the initial qualifying question.',
  },
  {
    id: '3',
    firstName: 'Nour', lastName: 'Khalil',
    source: 'Instagram', channel: 'instagram_dm',
    capturedAt: '6h ago', bucket: 'warm',
    confidence: 0.52,
    bant: { budget: 'high', authority: 'true', need: 'moderate', timeline: '6months' },
    qualificationNotes: 'Budget signal is strong based on enrichment data and the lead is clearly the decision-maker. However need signal is only moderate — they mentioned browsing rather than active searching, and timeline of 6 months puts them outside the immediate conversion window.',
  },
  {
    id: '4',
    firstName: 'Hamad', lastName: 'Al-Thani',
    source: 'Chat Widget', channel: 'sms',
    capturedAt: '9h ago', bucket: 'cold',
    confidence: 0.44,
    bant: { budget: 'low', authority: 'unknown', need: 'weak', timeline: 'unknown' },
    qualificationNotes: 'Very limited signal across all BANT dimensions. Engagement was minimal — single response to the opening message with no follow-up. Could be a passive browser or out-of-market. Recommend one more outreach attempt before archiving.',
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const CHANNEL_ICONS: Record<Channel, string> = {
  sms:          'ti-message',
  whatsapp:     'ti-brand-whatsapp',
  email:        'ti-mail',
  instagram_dm: 'ti-brand-instagram',
};

const CHANNEL_LABELS: Record<Channel, string> = {
  sms:          'SMS',
  whatsapp:     'WhatsApp',
  email:        'Email',
  instagram_dm: 'Instagram DM',
};

const DISQUALIFY_REASONS = [
  'Select reason…',
  'Wrong market / location',
  'No budget',
  'Not the decision-maker',
  'Unresponsive',
  'Duplicate lead',
  'Spam / bot',
  'Out of timeline',
];

const AVATAR_COLORS: [string, string][] = [
  ['#2A1030', '#C77DFF'],
  ['#0A1F18', '#00B894'],
  ['#10102A', '#7B8BFF'],
  ['#1A0830', '#A78BFA'],
];

function bantClass(value: BantSignal): string {
  if (['high', 'strong', 'immediate', 'true'].includes(value)) return 'strong';
  if (['medium', 'moderate', '3months'].includes(value))        return 'moderate';
  if (['low', 'weak'].includes(value))                          return 'low';
  return 'unknown';
}

function bantDisplay(value: BantSignal): string {
  const map: Partial<Record<BantSignal, string>> = {
    'true':      'Yes',
    'false':     'No',
    '3months':   '3 months',
    '6months':   '6 months',
    'immediate': 'Immediate',
  };
  return map[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

function confidenceColor(c: number): string {
  if (c >= 0.70) return 'var(--text-success)';
  if (c >= 0.55) return 'var(--text-warning)';
  return 'var(--text-warning)';
}

// ── LEAD CARD ─────────────────────────────────────────────────────────────────
interface CardProps {
  lead:          ReviewLead;
  index:         number;
  onQualify:     (id: string) => void;
  onDisqualify:  (id: string, reason: string) => void;
  onMoreInfo:    (id: string) => void;
}

function LeadCard({ lead, index, onQualify, onDisqualify, onMoreInfo }: CardProps) {
  const [dismissing, setDismissing]         = useState(false);
  const [showReasons, setShowReasons]       = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading]               = useState(false);

  const [avatarBg, avatarColor] = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handleDismiss = useCallback(
    async (action: () => void) => {
      setLoading(true);
      // Simulate API call — replace with real fetch in production
      await new Promise((r) => setTimeout(r, 300));
      setDismissing(true);
      setTimeout(action, 380);
    },
    [],
  );

  const handleDisqualifyClick = () => {
    setShowReasons((v) => !v);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    if (reason && reason !== 'Select reason…') {
      handleDismiss(() => onDisqualify(lead.id, reason));
    }
  };

  return (
    <div className={`review-card${dismissing ? ' dismissing' : ''}`}>

      {/* LEFT */}
      <div className="card-left">
        <div
          className="card-avatar"
          style={{ background: avatarBg, color: avatarColor }}
        >
          {lead.firstName[0]}{lead.lastName[0]}
        </div>

        <div className="card-name">
          {lead.firstName} {lead.lastName}
        </div>

        <div className="card-meta-row">
          <span className="source-badge">{lead.source}</span>
        </div>

        <div className="card-time">
          <i className="ti ti-clock" aria-hidden="true" />
          {lead.capturedAt}
        </div>

        <div className="card-channel">
          <i className={`ti ${CHANNEL_ICONS[lead.channel]}`} aria-hidden="true" />
          {CHANNEL_LABELS[lead.channel]}
        </div>
      </div>

      {/* CENTRE */}
      <div className="card-centre">
        <div className="bant-grid">
          {(
            [
              ['Budget',    lead.bant.budget],
              ['Authority', lead.bant.authority],
              ['Need',      lead.bant.need],
              ['Timeline',  lead.bant.timeline],
            ] as [string, BantSignal][]
          ).map(([label, value]) => (
            <div className="bant-row" key={label}>
              <span className="bant-label">{label}</span>
              <span className={`bant-value ${bantClass(value)}`}>
                {bantDisplay(value)}
              </span>
            </div>
          ))}
        </div>

        <div className="ai-notes">
          <div className="ai-notes-label">AI reasoning</div>
          {lead.qualificationNotes}
        </div>
      </div>

      {/* RIGHT */}
      <div className="card-right">
        <div className="confidence-block">
          <div
            className="confidence-score"
            style={{ color: confidenceColor(lead.confidence) }}
          >
            {lead.confidence.toFixed(2)}
          </div>
          <div className="confidence-label">
            AI confidence<br />review needed
          </div>
        </div>

        <div className="action-stack">
          <button
            className="action-btn qualify"
            onClick={() => handleDismiss(() => onQualify(lead.id))}
            disabled={loading}
          >
            <i className="ti ti-check" aria-hidden="true" />
            Qualify
          </button>

          <button
            className="action-btn disqualify"
            onClick={handleDisqualifyClick}
            disabled={loading}
          >
            <i className="ti ti-x" aria-hidden="true" />
            Disqualify
          </button>

          <select
            className={`disqualify-reason${showReasons ? ' visible' : ''}`}
            value={selectedReason}
            onChange={handleReasonChange}
            aria-label="Select disqualification reason"
          >
            {DISQUALIFY_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button
            className="action-btn more-info"
            onClick={() => handleDismiss(() => onMoreInfo(lead.id))}
            disabled={loading}
          >
            <i className="ti ti-send" aria-hidden="true" />
            Request more info
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function ReviewQueue() {
  const [leads, setLeads]               = useState<ReviewLead[]>(MOCK_LEADS);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // In production — replace with:
  // const { data: leads, refetch } = useQuery(['review-leads'], () =>
  //   fetch('/api/v1/leads?status=needs_review').then(r => r.json())
  // );

  const removeLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleQualify = useCallback(
    async (id: string) => {
      await fetch(`/api/v1/leads/${id}/qualify`, { method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'qualified', overriddenByHuman: true }),
      });
      removeLead(id);
    },
    [removeLead],
  );

  const handleDisqualify = useCallback(
    async (id: string, reason: string) => {
      await fetch(`/api/v1/leads/${id}/disqualify`, { method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived', disqualifyReason: reason, overriddenByHuman: true }),
      });
      removeLead(id);
    },
    [removeLead],
  );

  const handleMoreInfo = useCallback(
    async (id: string) => {
      await fetch(`/api/v1/leads/${id}/request-info`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requeue: true, reviewWindowHours: 24 }),
      });
      removeLead(id);
    },
    [removeLead],
  );

  const filteredLeads = leads.filter((l) => {
    if (sourceFilter  !== 'all' && l.source  !== sourceFilter)  return false;
    if (channelFilter !== 'all' && l.channel !== channelFilter) return false;
    return true;
  });

  const isEmpty = filteredLeads.length === 0;

  return (
    <div className="review-page">

      {/* HEADER */}
      <div className="review-header">
        <div className="review-header-left">
          <h1>
            Qualification review
            {leads.length > 0 && (
              <span className="review-count-badge">
                <span className="count-dot" />
                {leads.length} pending
              </span>
            )}
          </h1>
          <p>
            These leads scored below the AI confidence threshold. Review the
            reasoning and decide how to route each one.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="review-filters">
        <span className="filter-label">Filter by</span>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          <option value="Meta Ad">Meta Ad</option>
          <option value="Landing Page">Landing Page</option>
          <option value="Instagram">Instagram</option>
          <option value="Chat Widget">Chat Widget</option>
          <option value="Referral">Referral</option>
        </select>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          aria-label="Filter by channel"
        >
          <option value="all">All channels</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="instagram_dm">Instagram DM</option>
        </select>
      </div>

      {/* CARD LIST */}
      {filteredLeads.map((lead, i) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          index={i}
          onQualify={handleQualify}
          onDisqualify={handleDisqualify}
          onMoreInfo={handleMoreInfo}
        />
      ))}

      {/* EMPTY STATE */}
      <div className={`review-empty${isEmpty ? ' visible' : ''}`}>
        <div className="review-empty-icon">
          <i className="ti ti-check" aria-hidden="true" />
        </div>
        <h3>No leads pending review</h3>
        <p>The AI is handling qualification. Leads that need your attention will appear here.</p>
      </div>

    </div>
  );
}
