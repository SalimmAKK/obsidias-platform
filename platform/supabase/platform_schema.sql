-- ============================================================================
-- Obsidias Platform Schema — lead-gen / BANT qualification product
-- ============================================================================
-- Run this in the Supabase SQL Editor (or via `supabase db push`) for the
-- project backing platform/frontend. This is separate from, and does not
-- touch, the legacy schema in platform/supabase_schema.sql (approval_jobs,
-- crm_leads), which belongs to legacy/workflow and must keep working as-is
-- if that system is still deployed against the same project.
--
-- Multi-tenant: every agency-owned table carries agency_id and is scoped by
-- Row Level Security to the caller's own agency. Server-side API routes use
-- the service-role key (bypasses RLS) for writes; the browser client uses
-- the anon key and only ever reads/writes within its own agency via RLS.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Agencies ────────────────────────────────────────────────────────────────
create table if not exists agencies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ── Profiles (one row per Supabase Auth user, extends auth.users) ──────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  agency_id   uuid not null references agencies(id) on delete cascade,
  full_name   text not null default '',
  email       text not null,
  role        text not null default 'agent' check (role in ('owner', 'agent')),
  created_at  timestamptz not null default now()
);

create index if not exists profiles_agency_id_idx on profiles(agency_id);

-- ── Leads ────────────────────────────────────────────────────────────────
create table if not exists leads (
  id                    uuid primary key default gen_random_uuid(),
  agency_id             uuid not null references agencies(id) on delete cascade,

  first_name            text not null default '',
  last_name             text not null default '',
  email                 text,
  phone                 text,

  source                text not null default 'Landing Page'
                          check (source in ('Meta Ad', 'Landing Page', 'Chat Widget', 'Referral', 'Instagram')),
  channel               text not null default 'whatsapp'
                          check (channel in ('sms', 'whatsapp', 'email', 'instagram_dm')),
  -- Free-text campaign tag (e.g. "Q1 Riyadh Villas"). Nullable — leads
  -- without one are grouped by `source` on the Campaigns page instead.
  campaign              text,

  -- Qualification pipeline state. 'needs_review' = below AI confidence
  -- threshold and awaiting a human decision (see Review Queue).
  status                text not null default 'new'
                          check (status in ('new', 'needs_review', 'qualified', 'nurturing', 'booked', 'archived', 'dead')),
  bucket                text not null default 'warm' check (bucket in ('hot', 'warm', 'cold')),

  confidence            numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  score                 integer not null default 0 check (score >= 0 and score <= 100),

  bant_budget           text not null default 'unknown',
  bant_authority        text not null default 'unknown',
  bant_need             text not null default 'unknown',
  bant_timeline         text not null default 'unknown',
  qualification_notes   text not null default '',

  disqualify_reason     text,
  overridden_by_human   boolean not null default false,
  next_touch_at         timestamptz,

  assigned_agent_id     uuid references profiles(id) on delete set null,

  captured_at           timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists leads_agency_id_idx on leads(agency_id);
create index if not exists leads_status_idx on leads(agency_id, status);
create index if not exists leads_bucket_idx on leads(agency_id, bucket);
create index if not exists leads_campaign_idx on leads(agency_id, campaign);

-- ── Conversations (one thread per lead) ────────────────────────────────────
create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references agencies(id) on delete cascade,
  lead_id         uuid not null references leads(id) on delete cascade,

  channel         text not null default 'whatsapp'
                    check (channel in ('sms', 'whatsapp', 'email', 'instagram_dm')),
  status          text not null default 'ai' check (status in ('ai', 'human')),
  unread          boolean not null default true,

  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists conversations_agency_id_idx on conversations(agency_id);
create index if not exists conversations_lead_id_idx on conversations(lead_id);

-- ── Messages ────────────────────────────────────────────────────────────
create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,

  direction        text not null check (direction in ('inbound', 'outbound')),
  content          text not null,
  is_ai            boolean not null default false,
  is_human         boolean not null default false,
  channel          text not null default 'whatsapp'
                     check (channel in ('sms', 'whatsapp', 'email', 'instagram_dm')),

  created_at       timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id, created_at);

-- ── Lead score history (for the lead detail page's score chart) ───────────
create table if not exists lead_score_history (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references leads(id) on delete cascade,
  score        integer not null check (score >= 0 and score <= 100),
  recorded_at  timestamptz not null default now()
);

create index if not exists lead_score_history_lead_id_idx on lead_score_history(lead_id, recorded_at);

-- ── Activities (audit trail: human overrides, status changes, etc.) ───────
create table if not exists activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  agency_id   uuid not null references agencies(id) on delete cascade,
  type        text not null,
  actor_id    uuid references profiles(id) on delete set null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activities_lead_id_idx on activities(lead_id, created_at);

-- ── Qualifications (human qualify/disqualify decision record per lead) ────
create table if not exists qualifications (
  lead_id              uuid primary key references leads(id) on delete cascade,
  disqualify_reason    text,
  overridden_by_human  boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- ── Appointments (manually scheduled viewings, until Cal.com is wired up) ─
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references agencies(id) on delete cascade,
  lead_id       uuid not null references leads(id) on delete cascade,

  scheduled_at  timestamptz not null,
  status        text not null default 'scheduled'
                  check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  location      text not null default '',
  notes         text not null default '',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists appointments_agency_id_idx on appointments(agency_id, scheduled_at);
create index if not exists appointments_lead_id_idx on appointments(lead_id);

-- ── updated_at triggers ─────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at before update on leads
  for each row execute function set_updated_at();

drop trigger if exists conversations_set_updated_at on conversations;
create trigger conversations_set_updated_at before update on conversations
  for each row execute function set_updated_at();

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at before update on appointments
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table agencies enable row level security;
alter table profiles enable row level security;
alter table appointments enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table lead_score_history enable row level security;
alter table activities enable row level security;
alter table qualifications enable row level security;

-- Helper: current caller's agency_id
create or replace function current_agency_id()
returns uuid as $$
  select agency_id from profiles where id = auth.uid()
$$ language sql stable security definer;

create policy "profiles_select_own_agency" on profiles
  for select using (agency_id = current_agency_id());

-- Users may update their own profile row only (not teammates'), and may not
-- move themselves to a different agency by editing agency_id.
create policy "profiles_update_own_row" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and agency_id = current_agency_id());

create policy "agencies_select_own" on agencies
  for select using (id = current_agency_id());

-- Any member may update their own agency's row (e.g. renaming it from
-- Settings). Scoped to the caller's agency, same as every other table here.
create policy "agencies_update_own" on agencies
  for update using (id = current_agency_id())
  with check (id = current_agency_id());

create policy "leads_all_own_agency" on leads
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

create policy "conversations_all_own_agency" on conversations
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

create policy "appointments_all_own_agency" on appointments
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

create policy "messages_all_via_conversation" on messages
  for all using (
    conversation_id in (select id from conversations where agency_id = current_agency_id())
  )
  with check (
    conversation_id in (select id from conversations where agency_id = current_agency_id())
  );

create policy "lead_score_history_via_lead" on lead_score_history
  for all using (
    lead_id in (select id from leads where agency_id = current_agency_id())
  )
  with check (
    lead_id in (select id from leads where agency_id = current_agency_id())
  );

create policy "activities_all_own_agency" on activities
  for all using (agency_id = current_agency_id())
  with check (agency_id = current_agency_id());

create policy "qualifications_via_lead" on qualifications
  for all using (
    lead_id in (select id from leads where agency_id = current_agency_id())
  )
  with check (
    lead_id in (select id from leads where agency_id = current_agency_id())
  );

-- Note: server-side API routes (platform/frontend/src/app/api/v1/**) use the
-- Supabase service-role client, which bypasses RLS entirely. RLS here exists
-- to keep the browser (anon-key) client's Realtime subscriptions and any
-- future direct client reads correctly scoped per agency.

-- ============================================================================
-- New user provisioning
-- ============================================================================
-- On sign-up, platform/frontend's login page calls supabase.auth.signUp with
-- options.data = { name, agency }. This trigger turns that into an agencies
-- row + a profiles row so the user has a working tenant on first login,
-- without a separate client-side round trip (which would race against RLS
-- since the user has no profile — and therefore no agency_id — yet).
create or replace function handle_new_user()
returns trigger as $$
declare
  v_agency_id uuid;
  v_agency_name text;
begin
  v_agency_name := coalesce(nullif(new.raw_user_meta_data->>'agency', ''), 'My Agency');

  insert into agencies (name) values (v_agency_name)
    returning id into v_agency_id;

  insert into profiles (id, agency_id, full_name, email, role)
  values (
    new.id,
    v_agency_id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- Realtime
-- ============================================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table conversations;
