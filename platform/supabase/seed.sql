-- ============================================================================
-- Dev seed data for platform_schema.sql
-- ============================================================================
-- Run after platform_schema.sql on a fresh dev/staging project to get the
-- dashboard populated with realistic data instead of relying on runtime
-- in-memory mock fallbacks. Safe to re-run: it clears its own seeded rows
-- first (matched by agency name) rather than truncating the whole database.
-- Do NOT run against a production project with real tenant data.
-- ============================================================================

do $$
declare
  v_agency_id uuid;
  v_lead_rania uuid;
  v_lead_yousef uuid;
  v_lead_nour uuid;
  v_lead_hamad uuid;
  v_lead_ahmed uuid;
  v_lead_sara uuid;
  v_lead_mohammed uuid;
  v_lead_lina uuid;
  v_lead_tariq uuid;
  v_conv_ahmed uuid;
  v_conv_sara uuid;
  v_conv_mohammed uuid;
  v_conv_lina uuid;
  v_conv_tariq uuid;
begin
  -- Clean up any prior run of this seed
  delete from agencies where name = 'Al-Rashid Real Estate (Dev Seed)';

  insert into agencies (name) values ('Al-Rashid Real Estate (Dev Seed)')
    returning id into v_agency_id;

  -- ── Leads awaiting human review ──────────────────────────────────────
  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence,
                      bant_budget, bant_authority, bant_need, bant_timeline, qualification_notes, status, captured_at)
  values (v_agency_id, 'Rania', 'Al-Farsi', 'Meta Ad', 'whatsapp', 'warm', 0.48,
          'medium', 'unknown', 'strong', '3months',
          'Lead expressed strong purchase intent but did not confirm decision-maker status. Budget signal is consistent with target range however authority is unclear — may be researching on behalf of a family member.',
          'needs_review', now() - interval '2 hours')
    returning id into v_lead_rania;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence,
                      bant_budget, bant_authority, bant_need, bant_timeline, qualification_notes, status, captured_at)
  values (v_agency_id, 'Yousef', 'Bin Saleh', 'Landing Page', 'email', 'cold', 0.41,
          'unknown', 'true', 'moderate', 'unknown',
          'Confirmed as sole decision-maker and interest is genuine, but budget and timeline are completely absent from enrichment data and the lead has not responded to the initial qualifying question.',
          'needs_review', now() - interval '4 hours')
    returning id into v_lead_yousef;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence,
                      bant_budget, bant_authority, bant_need, bant_timeline, qualification_notes, status, captured_at)
  values (v_agency_id, 'Nour', 'Khalil', 'Instagram', 'instagram_dm', 'warm', 0.52,
          'high', 'true', 'moderate', '6months',
          'Budget signal is strong based on enrichment data and the lead is clearly the decision-maker. However need signal is only moderate — they mentioned browsing rather than active searching, and timeline of 6 months puts them outside the immediate conversion window.',
          'needs_review', now() - interval '6 hours')
    returning id into v_lead_nour;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence,
                      bant_budget, bant_authority, bant_need, bant_timeline, qualification_notes, status, captured_at)
  values (v_agency_id, 'Hamad', 'Al-Thani', 'Chat Widget', 'sms', 'cold', 0.44,
          'low', 'unknown', 'weak', 'unknown',
          'Very limited signal across all BANT dimensions. Engagement was minimal — single response to the opening message with no follow-up. Could be a passive browser or out-of-market. Recommend one more outreach attempt before archiving.',
          'needs_review', now() - interval '9 hours')
    returning id into v_lead_hamad;

  -- ── Leads with active conversations ──────────────────────────────────
  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence, score, status, captured_at)
  values (v_agency_id, 'Ahmed', 'Al-Khalidi', 'Meta Ad', 'whatsapp', 'hot', 0.84, 84, 'nurturing', now() - interval '1 day')
    returning id into v_lead_ahmed;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence, score, status, captured_at)
  values (v_agency_id, 'Sara', 'Rashid', 'Referral', 'sms', 'warm', 0.62, 62, 'nurturing', now() - interval '1 day')
    returning id into v_lead_sara;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence, score, status, captured_at)
  values (v_agency_id, 'Mohammed', 'Fahad', 'Landing Page', 'email', 'cold', 0.31, 31, 'nurturing', now() - interval '2 days')
    returning id into v_lead_mohammed;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence, score, status, captured_at)
  values (v_agency_id, 'Lina', 'Al-Sayed', 'Instagram', 'instagram_dm', 'hot', 0.77, 77, 'nurturing', now() - interval '3 days')
    returning id into v_lead_lina;

  insert into leads (agency_id, first_name, last_name, source, channel, bucket, confidence, score, status, captured_at)
  values (v_agency_id, 'Tariq', 'Mansour', 'Meta Ad', 'sms', 'warm', 0.45, 45, 'nurturing', now() - interval '4 days')
    returning id into v_lead_tariq;

  -- ── Score history samples ────────────────────────────────────────────
  insert into lead_score_history (lead_id, score, recorded_at) values
    (v_lead_ahmed, 40, now() - interval '3 days'),
    (v_lead_ahmed, 65, now() - interval '2 days'),
    (v_lead_ahmed, 84, now() - interval '1 day'),
    (v_lead_lina,  35, now() - interval '5 days'),
    (v_lead_lina,  60, now() - interval '4 days'),
    (v_lead_lina,  77, now() - interval '3 days');

  -- ── Conversations + messages ─────────────────────────────────────────
  insert into conversations (agency_id, lead_id, channel, status, unread, last_message_at)
  values (v_agency_id, v_lead_ahmed, 'whatsapp', 'ai', true, now() - interval '2 minutes')
    returning id into v_conv_ahmed;

  insert into messages (conversation_id, direction, content, is_ai, is_human, channel, created_at) values
    (v_conv_ahmed, 'outbound', 'Hi Ahmed, I''m Alex from Obsidias Properties. I saw you''re interested in a 2BR in Dubai Marina around AED 1.8M — that''s a great area. Are you looking to buy in the next few months?', true, false, 'whatsapp', now() - interval '20 minutes'),
    (v_conv_ahmed, 'inbound',  'Yes exactly, we''re aiming for Q3 this year. We have a budget up to 2M.', false, false, 'whatsapp', now() - interval '15 minutes'),
    (v_conv_ahmed, 'outbound', 'Perfect timing — Q3 inventory in Marina is moving fast. I have two units that match your brief: a 1,240 sqft corner unit on the 18th floor and a 1,180 sqft with a sea view on the 22nd. Both are priced within your range.', true, false, 'whatsapp', now() - interval '13 minutes'),
    (v_conv_ahmed, 'inbound',  'That sounds interesting. Are both of those units available to view this week?', false, false, 'whatsapp', now() - interval '2 minutes');

  insert into conversations (agency_id, lead_id, channel, status, unread, last_message_at)
  values (v_agency_id, v_lead_sara, 'sms', 'human', true, now() - interval '14 minutes')
    returning id into v_conv_sara;

  insert into messages (conversation_id, direction, content, is_ai, is_human, channel, created_at) values
    (v_conv_sara, 'outbound', 'Hi Sara, this is Alex from Obsidias Properties. You recently enquired about villas in Riyadh — are you looking to buy or rent?', true, false, 'sms', now() - interval '30 minutes'),
    (v_conv_sara, 'inbound',  'Buy. We need at least 4 bedrooms.', false, false, 'sms', now() - interval '24 minutes'),
    (v_conv_sara, 'outbound', 'Got it. What''s your approximate budget range? That will help me pull the right options for you.', true, false, 'sms', now() - interval '21 minutes'),
    (v_conv_sara, 'inbound',  'I''d prefer to speak with someone directly actually.', false, false, 'sms', now() - interval '16 minutes'),
    (v_conv_sara, 'outbound', 'Of course — I''ve flagged this for one of our senior advisors. You''ll receive a call within the next 30 minutes. Is there a better number to reach you on?', false, true, 'sms', now() - interval '14 minutes');

  insert into conversations (agency_id, lead_id, channel, status, unread, last_message_at)
  values (v_agency_id, v_lead_mohammed, 'email', 'ai', false, now() - interval '1 hour')
    returning id into v_conv_mohammed;

  insert into messages (conversation_id, direction, content, is_ai, is_human, channel, created_at) values
    (v_conv_mohammed, 'outbound', 'Hi Mohammed, I noticed you downloaded our Riyadh market guide last week. Are you currently exploring property options in the area?', true, false, 'email', now() - interval '90 minutes'),
    (v_conv_mohammed, 'inbound',  'Thanks for reaching out. I''ll have a look at what you sent.', false, false, 'email', now() - interval '60 minutes');

  insert into conversations (agency_id, lead_id, channel, status, unread, last_message_at)
  values (v_agency_id, v_lead_lina, 'instagram_dm', 'ai', false, now() - interval '32 minutes')
    returning id into v_conv_lina;

  insert into messages (conversation_id, direction, content, is_ai, is_human, channel, created_at) values
    (v_conv_lina, 'outbound', 'Hi Lina! Thanks for reaching out via Instagram. I saw you''re interested in apartments in Jeddah — any particular area or size you have in mind?', true, false, 'instagram_dm', now() - interval '50 minutes'),
    (v_conv_lina, 'inbound',  'Looking at Corniche area, 2-3 bedrooms. Investment purposes mainly.', false, false, 'instagram_dm', now() - interval '43 minutes'),
    (v_conv_lina, 'outbound', 'Smart pick — Corniche has had strong rental yield over the past 18 months. I can share a few units with solid ROI. Budget range?', true, false, 'instagram_dm', now() - interval '41 minutes'),
    (v_conv_lina, 'inbound',  'Up to 1.5M SAR. What''s the service charge situation on those?', false, false, 'instagram_dm', now() - interval '32 minutes');

  insert into conversations (agency_id, lead_id, channel, status, unread, last_message_at)
  values (v_agency_id, v_lead_tariq, 'sms', 'ai', false, now() - interval '2 hours')
    returning id into v_conv_tariq;

  insert into messages (conversation_id, direction, content, is_ai, is_human, channel, created_at) values
    (v_conv_tariq, 'outbound', 'Hi Tariq, following up on your enquiry about townhouses in Al Olaya. Have you had a chance to review the brochure I sent over?', true, false, 'sms', now() - interval '3 hours'),
    (v_conv_tariq, 'inbound',  'Yes I had a look. The prices are a bit above what we planned.', false, false, 'sms', now() - interval '2.5 hours'),
    (v_conv_tariq, 'outbound', 'Understood — there are a couple of options slightly below that range that still tick most of your boxes. Would it help if I put together a shortlist?', true, false, 'sms', now() - interval '2.2 hours'),
    (v_conv_tariq, 'inbound',  'Let me check with my wife and get back to you.', false, false, 'sms', now() - interval '2 hours');

end $$;
