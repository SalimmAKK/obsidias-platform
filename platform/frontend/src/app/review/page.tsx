"use client";

import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
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

// ── CUSTOM LIGHTWEIGHT QUERY HOOK ─────────────────────────────────────────────
function useQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryFn();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [queryFn]);

  const serializedKey = JSON.stringify(queryKey);
  useEffect(() => {
    refetch();
  }, [serializedKey]);

  return { data, loading, error, refetch };
}

// ── LEAD CARD ─────────────────────────────────────────────────────────────────
interface CardProps {
  lead:          ReviewLead;
  index:         number;
  onQualify:     (id: string) => Promise<void>;
  onDisqualify:  (id: string, reason: string) => Promise<void>;
  onMoreInfo:    (id: string) => Promise<void>;
}

function LeadCard({ lead, index, onQualify, onDisqualify, onMoreInfo }: CardProps) {
  const [dismissing, setDismissing]         = useState(false);
  const [showReasons, setShowReasons]       = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading]               = useState(false);

  const [avatarBg, avatarColor] = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handleDismiss = useCallback(
    async (action: () => Promise<void>) => {
      setLoading(true);
      try {
        setDismissing(true);
        // Wait for the 380ms transition animation to play
        await new Promise((r) => setTimeout(r, 380));
        await action();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleDisqualifyClick = useCallback(() => {
    if (!showReasons) {
      setShowReasons(true);
    } else if (selectedReason && selectedReason !== DISQUALIFY_REASONS[0]) {
      handleDismiss(() => onDisqualify(lead.id, selectedReason));
    }
  }, [showReasons, selectedReason, lead.id, onDisqualify, handleDismiss]);

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setSelectedReason(val);
      if (val && val !== DISQUALIFY_REASONS[0]) {
        handleDismiss(() => onDisqualify(lead.id, val));
      }
    },
    [lead.id, onDisqualify, handleDismiss],
  );

  const initials = (lead.firstName.charAt(0) + lead.lastName.charAt(0)).toUpperCase();

  return (
    <div className={`review-card${dismissing ? ' dismissing' : ''}`}>
      {/* Left Column */}
      <div className="card-left">
        <div className="card-avatar" style={{ background: avatarBg, color: avatarColor }}>
          {initials}
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

      {/* Centre Column */}
      <div className="card-centre">
        <div className="bant-grid">
          <div className="bant-row">
            <span className="bant-label">Budget</span>
            <span className={`bant-value ${bantClass(lead.bant.budget)}`}>
              {bantDisplay(lead.bant.budget)}
            </span>
          </div>
          <div className="bant-row">
            <span className="bant-label">Authority</span>
            <span className={`bant-value ${bantClass(lead.bant.authority)}`}>
              {bantDisplay(lead.bant.authority)}
            </span>
          </div>
          <div className="bant-row">
            <span className="bant-label">Need</span>
            <span className={`bant-value ${bantClass(lead.bant.need)}`}>
              {bantDisplay(lead.bant.need)}
            </span>
          </div>
          <div className="bant-row">
            <span className="bant-label">Timeline</span>
            <span className={`bant-value ${bantClass(lead.bant.timeline)}`}>
              {bantDisplay(lead.bant.timeline)}
            </span>
          </div>
        </div>

        <div className="ai-notes">
          <div className="ai-notes-label">AI Qualification notes</div>
          {lead.qualificationNotes}
        </div>
      </div>

      {/* Right Column */}
      <div className="card-right">
        <div className="confidence-block">
          <div className="confidence-score" style={{ color: confidenceColor(lead.confidence) }}>
            {Math.round(lead.confidence * 100)}%
          </div>
          <div className="confidence-label">Confidence score</div>
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
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const { data: leads = [], refetch } = useQuery<ReviewLead[]>(
    ['review-leads', sourceFilter, channelFilter],
    useCallback(() => 
      fetch(`/api/v1/leads?status=needs_review&source=${sourceFilter}&channel=${channelFilter}&pageSize=100`)
        .then(r => r.json())
        .then(data => data.leads ?? []),
      [sourceFilter, channelFilter]
    )
  );

  const handleQualify = useCallback(
    async (id: string) => {
      await fetch(`/api/v1/leads/${id}/qualify`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'qualified', overriddenByHuman: true }),
      });
      await refetch();
    },
    [refetch],
  );

  const handleDisqualify = useCallback(
    async (id: string, reason: string) => {
      await fetch(`/api/v1/leads/${id}/disqualify`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived', disqualifyReason: reason, overriddenByHuman: true }),
      });
      await refetch();
    },
    [refetch],
  );

  const handleMoreInfo = useCallback(
    async (id: string) => {
      await fetch(`/api/v1/leads/${id}/request-info`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requeue: true, reviewWindowHours: 24 }),
      });
      await refetch();
    },
    [refetch],
  );

  const isEmpty = leads.length === 0;

  return (
    <AppLayout title="Qualification Review">
      <div className="review-page">
        {/* HEADER */}
        <div className="review-header" style={{ marginTop: '-1rem' }}>
          <div className="review-header-left">
            <p className="text-[13.5px] text-[var(--ink3)] mt-1">
              These leads scored below the AI confidence threshold. Review the reasoning and decide how to route each one.
            </p>
          </div>
          {leads.length > 0 && (
            <span className="review-count-badge">
              <span className="count-dot" />
              {leads.length} pending
            </span>
          )}
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
        {leads.map((lead, i) => (
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
    </AppLayout>
  );
}
