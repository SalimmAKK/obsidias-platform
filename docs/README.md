# Real Estate AI Lead Generation Workflow

## What This Is

An end-to-end automation pipeline for real estate agencies. A staff member uploads a Google Sheet file containing client leads and available property listings. The system automatically extracts the leads, matches each one to the top 3 best-fit properties using AI, drafts a personalized proposal email, and sends it to the agent for approval before anything reaches the client.

No manual matching. No copy-pasting listings. The agent only sees the final output and clicks Approve or Reject.

---

## How It Works (Full Pipeline)

```
Agent uploads sheet file
        ↓
Node 01 — Parse Sheet
  Tab 1: Extract leads (name, phone, email, budget, location, property type, bedrooms)
  Tab 2: Extract property library (all available listings)
  Gemini normalizes column headers — works with any naming convention including Arabic
        ↓
Node 02 — Match Properties  [runs once per lead]
  Hard filter: budget ±25%, property type, available only
  Gemini re-ranks filtered results and writes a personalized match reason
  Output: top 3 properties per lead with match score + explanation
        ↓
Node 03 — Generate Email  [runs once per lead]
  Gemini drafts a full HTML + plain text proposal email
  Warm, consultative tone — feels hand-written, not automated
  Includes all 3 matched properties with key details
        ↓
Node 04 — Approval Gate  [runs once per lead]
  Saves job to Supabase (status: pending_approval)
  Sends agent a WhatsApp or Telegram message with:
    - Lead summary
    - Top 3 matches
    - ✅ Approve link  →  /api/approval?job=<id>&action=approve
    - ❌ Reject link   →  /api/approval?job=<id>&action=reject
        ↓
Node 05 — Approval Handler  [triggered by agent clicking link]
  APPROVE → sends email via Gmail API → logs to crm_leads table
  REJECT  → marks job rejected → logs to crm_leads table
```

---

## File Structure

```
/realestate-workflow/
  ├── node_01_sheet_parser.js       Parses uploaded sheet, normalizes with Gemini
  ├── node_02_property_matcher.js   Matches leads to properties, Gemini re-ranks
  ├── node_03_email_generator.js    Generates proposal email via Gemini
  ├── node_04_approval_gate.js      Sends WhatsApp/Telegram approval message
  ├── node_05_approval_handler.js   HTTP endpoint for approve/reject + Gmail sender
  ├── node_06_orchestrator.js       Entry point — wires all nodes, exposes HTTP handler
  ├── supabase_schema.sql           Run once in Supabase to create tables
  ├── package.json                  Dependencies
  ├── .env                          All secrets and config (see below)
  └── README.md                     This file
```

---

## HTTP Endpoints Required

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/upload` | `httpHandler` from node_06 | Accepts sheet file upload, runs full pipeline |
| GET | `/api/approval` | `handleApproval` from node_05 | Approve or reject a pending job |

---

## Frontend UI Required

A single-page upload interface at `/` with:
- Drag and drop zone for `.xlsx`, `.csv`, or `.ods` files
- Upload button that POSTs the file to `/api/upload`
- Status display showing pipeline progress (how many leads processed, how many pending approval)
- Simple, professional design suitable for a real estate agency

---

## Database (Supabase)

Two tables. Run `supabase_schema.sql` in the Supabase SQL Editor before first use.

**`approval_jobs`** — one row per lead per upload, tracks approval state
```
id               UUID (primary key)
lead_data        JSONB  — full lead object
matches_data     JSONB  — top 3 matched properties
email_data       JSONB  — generated email (subject, html, text)
status           TEXT   — pending_approval | sent | rejected
channel          TEXT   — whatsapp | telegram
created_at       TIMESTAMPTZ
sent_at          TIMESTAMPTZ
rejected_at      TIMESTAMPTZ
```

**`crm_leads`** — permanent record of every lead and outcome
```
id                   UUID (primary key)
name, phone, email   TEXT
budget               NUMERIC
location             TEXT
property_type        TEXT
matched_properties   TEXT[]  — array of property IDs
email_subject        TEXT
status               TEXT    — proposal_sent | rejected | no_matches | error
created_at           TIMESTAMPTZ
sent_at              TIMESTAMPTZ
```

---

## Environment Variables

All secrets live in `.env`. Every variable is required unless marked optional.

```
# Google AI
GEMINI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# App
APP_BASE_URL=                    # public URL of this deployed app, e.g. https://app.antigravity.dev

# WhatsApp (Meta Cloud API)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
AGENT_WHATSAPP_NUMBER=           # agent's number without +, e.g. 966501234567

# Telegram (optional — set APPROVAL_CHANNEL=telegram to use)
TELEGRAM_BOT_TOKEN=
AGENT_TELEGRAM_CHAT_ID=

# Gmail API (OAuth2)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=

# Agent / Agency identity (appears in emails)
AGENT_NAME=
AGENCY_NAME=
AGENT_PHONE=
AGENT_EMAIL=

# Approval channel: "whatsapp" or "telegram"
APPROVAL_CHANNEL=whatsapp
```

---

## Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "@supabase/supabase-js": "^2.45.0",
  "googleapis": "^144.0.0",
  "xlsx": "^0.18.5"
}
```

---

## Google Sheet Format Expected

**Tab 1 — Leads** (column names can vary, Gemini will normalize them):

| Name | Phone | Email | Budget | Location | Type | Bedrooms | Notes |
|------|-------|-------|--------|----------|------|----------|-------|
| Ahmed Al-Sayed | +966501234567 | ahmed@email.com | 1500000 | Riyadh | villa | 4 | needs garden |

**Tab 2 — Property Library** (column names can vary):

| ID | Title | Type | Location | Price | Bedrooms | Bathrooms | Size SQM | Description | Available |
|----|-------|------|----------|-------|----------|-----------|----------|-------------|-----------|
| PROP-001 | Al Nakheel Villa | villa | Riyadh | 1450000 | 4 | 3 | 380 | Corner plot, private pool | Yes |

---

## Multi-Client Configuration

Each client (real estate agency) gets their own set of environment variables. To support multiple clients on the same deployment, extend the orchestrator to accept a `clientId` param on the upload endpoint and load per-client config from Supabase instead of env vars. This is the recommended path for scaling to multiple agencies.

---

## Key Design Decisions

- **Gemini for normalization:** Sheet column headers vary wildly between clients. Using Gemini to map arbitrary headers to a standard schema means the system works out of the box with any spreadsheet without configuration.
- **Human approval is mandatory:** Nothing reaches a client without an agent clicking Approve. This is non-negotiable for trust and liability in the real estate industry.
- **Approval channel is configurable per client:** WhatsApp and Telegram are both supported. The channel is set via env var — no code changes needed to switch.
- **Supabase as the source of truth:** Every job and its outcome is persisted. This gives the agency a full audit trail and the foundation for a reporting dashboard later.
