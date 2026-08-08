-- ============================================================
-- SUPABASE SCHEMA — Real Estate AI Lead Generation Workflow
-- Run this in your Supabase SQL Editor to set up all tables.
-- ============================================================

-- ─── TABLE: approval_jobs ────────────────────────────────────
-- Stores each pending/completed email approval job.

CREATE TABLE IF NOT EXISTS approval_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_data       JSONB NOT NULL,          -- full lead object from node 01
  matches_data    JSONB NOT NULL,          -- top 3 matched properties
  email_data      JSONB NOT NULL,          -- generated email (subject, html, text)
  status          TEXT NOT NULL DEFAULT 'pending_approval',
                  -- values: pending_approval | sent | rejected
  channel         TEXT NOT NULL DEFAULT 'whatsapp',  -- whatsapp | telegram
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  sent_at         TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ
);

-- ─── TABLE: crm_leads ────────────────────────────────────────
-- Final log of every processed lead and its outcome.

CREATE TABLE IF NOT EXISTS crm_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT,
  phone               TEXT,
  email               TEXT,
  budget              NUMERIC,
  location            TEXT,
  property_type       TEXT,
  matched_properties  TEXT[],              -- array of property IDs
  email_subject       TEXT,
  status              TEXT,               -- proposal_sent | rejected | no_matches | error
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  sent_at             TIMESTAMPTZ
);

-- ─── INDEX: fast lookup by status ────────────────────────────

CREATE INDEX IF NOT EXISTS idx_approval_jobs_status ON approval_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS. Service key bypasses all policies (used server-side).
-- Add policies here if you build a user-facing dashboard later.

ALTER TABLE approval_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
