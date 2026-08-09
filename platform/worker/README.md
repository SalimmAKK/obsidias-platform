# platform/worker

The background queue processor for the Obsidias lead pipeline: enrichment,
qualification, conversation, scoring, appointments, CRM sync, and
reactivation. This is a long-running Node process, not a serverless
function — it does not and cannot run on Vercel, which is why it's a
separate deployment (Railway) from `platform/frontend`.

## Current state (Phase 1 scaffold)

No real lead processing yet. `src/index.ts` only verifies the three things
every later phase depends on: the process stays alive, it can reach the
Upstash Redis instance, and it can reach Supabase with the service-role
key. Confirm all three from the deploy logs before building real
processors on top of this.

## Local development

```bash
cp .env.example .env   # fill in REDIS_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

You should see `[startup] Redis OK.`, `[startup] Supabase OK.`, and a
`[healthcheck] tick at ...` log every 5 minutes.

## Deploying (Railway)

1. New Railway project → Deploy from GitHub repo → select this repo
2. Set **Root Directory** to `platform/worker`
3. Add the env vars from `.env.example` in Railway's Variables tab
4. Railway auto-detects the `build`/`start` scripts via Nixpacks — no
   Dockerfile needed

## Adding a real queue processor

Each pipeline stage gets its own file under `src/queues/processors/`,
registered as a `Worker` in `src/index.ts` the same way the healthcheck
worker is. Queue names/objects already exist for all seven stages in
`src/queues/definitions.ts` — enqueue jobs onto them from
`platform/frontend`'s API routes (or from other processors) once this
service is live and verified.
