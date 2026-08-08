# platform/supabase

Schema for the live Obsidias dashboard (`platform/frontend`) — the WhatsApp/Instagram/email
lead capture and BANT qualification product. This is separate from `platform/supabase_schema.sql`,
which is the legacy sheet-upload/property-matching schema (`approval_jobs`, `crm_leads`) used by
`legacy/workflow`. Do not merge or drop either on account of the other; the legacy schema stays
as-is per project rules.

## Setup

1. Create (or use an existing) Supabase project.
2. Run `platform_schema.sql` in the SQL Editor. It's idempotent (`create table if not exists`),
   safe to re-run.
3. Optionally run `seed.sql` on a dev/staging project to populate realistic sample data (one
   agency, leads in review, active conversations with messages, score history). It deletes and
   re-inserts its own rows on each run — **do not run it against a project with real tenant data.**
4. Copy the project's API URL and keys into `platform/frontend/.env.local` (see
   `.env.local.example` in that folder).

## Tables

| Table | Purpose |
|---|---|
| `agencies` | One row per tenant agency. |
| `profiles` | Extends `auth.users`; links a Supabase Auth user to an agency. |
| `leads` | Captured leads, BANT fields, qualification status, confidence, score, bucket. |
| `conversations` | One thread per lead; `status` is `ai` or `human` (who's currently driving). |
| `messages` | Messages within a conversation. |
| `lead_score_history` | Time series of a lead's score, for the lead detail page's chart. |
| `appointments` | Manually scheduled viewings tied to a lead. Booking is manual until Cal.com is wired up. |
| `activities` | Audit log of pipeline/human actions taken on a lead. |
| `qualifications` | Human qualify/disqualify decision record, one per lead. |

## RLS

Every tenant table is scoped by `agency_id` via Row Level Security, checked against the caller's
`profiles.agency_id`. Server-side API routes (`platform/frontend/src/app/api/v1/**`) use the
service-role key, which bypasses RLS — RLS exists for the browser (anon-key) client, mainly the
Realtime subscription on `messages`/`leads`/`conversations` used by the Conversations page.
