-- Run this in the Supabase SQL Editor against your existing project.
-- Adds what the WhatsApp inbound webhook (api/v1/webhooks/whatsapp) needs.
-- Safe to re-run — every statement is idempotent.

alter table agencies
  add column if not exists whatsapp_phone_number_id text unique;

alter table leads
  drop constraint if exists leads_source_check;
alter table leads
  add constraint leads_source_check
  check (source in ('Meta Ad', 'Landing Page', 'Chat Widget', 'Referral', 'Instagram', 'WhatsApp'));

alter table messages
  add column if not exists external_id text;
create index if not exists messages_external_id_idx
  on messages(external_id) where external_id is not null;

-- Refresh PostgREST's schema cache so the new column/constraint are visible
-- to API requests immediately, without waiting for its next auto-reload.
notify pgrst, 'reload schema';
