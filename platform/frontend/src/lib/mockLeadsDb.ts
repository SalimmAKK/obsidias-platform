// Persistent in-memory mock database for leads in-review
export interface DBLead {
  id: string;
  first_name: string;
  last_name: string;
  source: string;
  channel: string;
  captured_at: string;
  bucket: string;
  confidence: number;
  bant_budget: string;
  bant_authority: string;
  bant_need: string;
  bant_timeline: string;
  qualification_notes: string;
  status: 'needs_review' | 'qualified' | 'archived';
  next_touch_at?: string;
  disqualify_reason?: string;
  overridden_by_human?: boolean;
}

if (!(global as any).MOCK_LEADS_DB) {
  (global as any).MOCK_LEADS_DB = [
    {
      id: '1',
      first_name: 'Rania',
      last_name: 'Al-Farsi',
      source: 'Meta Ad',
      channel: 'whatsapp',
      captured_at: '2h ago',
      bucket: 'warm',
      confidence: 0.48,
      bant_budget: 'medium',
      bant_authority: 'unknown',
      bant_need: 'strong',
      bant_timeline: '3months',
      qualification_notes: 'Lead expressed strong purchase intent but did not confirm decision-maker status. Budget signal is consistent with target range however authority is unclear — may be researching on behalf of a family member.',
      status: 'needs_review'
    },
    {
      id: '2',
      first_name: 'Yousef',
      last_name: 'Bin Saleh',
      source: 'Landing Page',
      channel: 'email',
      captured_at: '4h ago',
      bucket: 'cold',
      confidence: 0.41,
      bant_budget: 'unknown',
      bant_authority: 'true',
      bant_need: 'moderate',
      bant_timeline: 'unknown',
      qualification_notes: 'Confirmed as sole decision-maker and interest is genuine, but budget and timeline are completely absent from enrichment data and the lead has not responded to the initial qualifying question.',
      status: 'needs_review'
    },
    {
      id: '3',
      first_name: 'Nour',
      last_name: 'Khalil',
      source: 'Instagram',
      channel: 'instagram_dm',
      captured_at: '6h ago',
      bucket: 'warm',
      confidence: 0.52,
      bant_budget: 'high',
      bant_authority: 'true',
      bant_need: 'moderate',
      bant_timeline: '6months',
      qualification_notes: 'Budget signal is strong based on enrichment data and the lead is clearly the decision-maker. However need signal is only moderate — they mentioned browsing rather than active searching, and timeline of 6 months puts them outside the immediate conversion window.',
      status: 'needs_review'
    },
    {
      id: '4',
      first_name: 'Hamad',
      last_name: 'Al-Thani',
      source: 'Chat Widget',
      channel: 'sms',
      captured_at: '9h ago',
      bucket: 'cold',
      confidence: 0.44,
      bant_budget: 'low',
      bant_authority: 'unknown',
      bant_need: 'weak',
      bant_timeline: 'unknown',
      qualification_notes: 'Very limited signal across all BANT dimensions. Engagement was minimal — single response to the opening message with no follow-up. Could be a passive browser or out-of-market. Recommend one more outreach attempt before archiving.',
      status: 'needs_review'
    }
  ];
}

export const mockLeadsDb = {
  getLeads: (filters: { status?: string; source?: string; channel?: string }) => {
    let list: DBLead[] = (global as any).MOCK_LEADS_DB;
    if (filters.status) {
      list = list.filter(l => l.status === filters.status);
    }
    if (filters.source && filters.source !== 'all') {
      list = list.filter(l => l.source === filters.source);
    }
    if (filters.channel && filters.channel !== 'all') {
      list = list.filter(l => l.channel === filters.channel);
    }
    return list;
  },
  getReviewCount: () => {
    const list: DBLead[] = (global as any).MOCK_LEADS_DB;
    return list.filter(l => l.status === 'needs_review').length;
  },
  qualifyLead: (id: string) => {
    const list: DBLead[] = (global as any).MOCK_LEADS_DB;
    const lead = list.find(l => l.id === id);
    if (lead) {
      lead.status = 'qualified';
      lead.overridden_by_human = true;
    }
    return lead;
  },
  disqualifyLead: (id: string, reason: string) => {
    const list: DBLead[] = (global as any).MOCK_LEADS_DB;
    const lead = list.find(l => l.id === id);
    if (lead) {
      lead.status = 'archived';
      lead.disqualify_reason = reason;
      lead.overridden_by_human = true;
    }
    return lead;
  },
  requestMoreInfo: (id: string) => {
    const list: DBLead[] = (global as any).MOCK_LEADS_DB;
    const lead = list.find(l => l.id === id);
    if (lead) {
      lead.status = 'needs_review';
      lead.next_touch_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    return lead;
  }
};
