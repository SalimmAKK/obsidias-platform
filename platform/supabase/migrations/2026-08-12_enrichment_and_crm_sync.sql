-- Run this in the Supabase SQL Editor against your existing project.
-- Adds what the enrichment worker and HubSpot CRM sync need. Idempotent.

alter table leads
  add column if not exists enrichment_job_title text,
  add column if not exists enrichment_company text,
  add column if not exists enrichment_linkedin_url text,
  add column if not exists enriched_at timestamptz,
  add column if not exists hs_contact_id text;

notify pgrst, 'reload schema';
