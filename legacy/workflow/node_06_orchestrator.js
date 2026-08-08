/**
 * NODE 06 — Main Orchestrator
 * ============================
 * This is the entry point for the entire automation pipeline.
 * Call this function when a sheet file is uploaded by the client.
 *
 * Pipeline:
 *   Upload → Parse Sheet → For each lead:
 *     → Match Properties → Generate Email → Send for Approval
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 *
 * ENV VARIABLES REQUIRED:
 *   GEMINI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   APP_BASE_URL                  (e.g. https://your-app.antigravity.dev)
 *   WHATSAPP_ACCESS_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   AGENT_WHATSAPP_NUMBER         (agent's number, e.g. 966501234567)
 *   TELEGRAM_BOT_TOKEN            (if using Telegram)
 *   AGENT_TELEGRAM_CHAT_ID        (if using Telegram)
 *   GMAIL_CLIENT_ID
 *   GMAIL_CLIENT_SECRET
 *   GMAIL_REFRESH_TOKEN
 *   AGENT_NAME
 *   AGENCY_NAME
 *   AGENT_PHONE
 *   AGENT_EMAIL
 *   APPROVAL_CHANNEL              "whatsapp" | "telegram"
 */

import { parseUploadedSheet } from "./node_01_sheet_parser.js";
import { matchLeadToProperties } from "./node_02_property_matcher.js";
import { generateProposalEmail } from "./node_03_email_generator.js";
import { sendForApproval } from "./node_04_approval_gate.js";

// ─── MAIN PIPELINE ───────────────────────────────────────────────────────────

export async function runLeadPipeline(fileBuffer, options = {}) {
  const {
    agentName = process.env.AGENT_NAME || "Your Agent",
    agencyName = process.env.AGENCY_NAME || "Real Estate Agency",
    agentPhone = process.env.AGENT_PHONE || "",
    agentEmail = process.env.AGENT_EMAIL || "",
    approvalChannel = process.env.APPROVAL_CHANNEL || "whatsapp",
  } = options;

  console.log("📄 Step 1: Parsing uploaded sheet...");
  const { leads, properties, meta } = await parseUploadedSheet(fileBuffer);
  console.log(`   Found ${meta.totalLeads} leads, ${meta.totalProperties} properties.`);

  const results = [];

  for (const lead of leads) {
    console.log(`\n👤 Processing lead: ${lead.name}`);

    try {
      // Step 2: Match
      console.log("   🏠 Matching properties...");
      const { matches } = await matchLeadToProperties(lead, properties);

      if (!matches || matches.length === 0) {
        console.warn(`   ⚠️  No matches found for ${lead.name}. Skipping.`);
        results.push({ lead, status: "no_matches" });
        continue;
      }

      // Step 3: Generate email
      console.log("   ✉️  Generating proposal email...");
      const { email } = await generateProposalEmail({
        lead,
        matches,
        agentName,
        agencyName,
        agentPhone,
        agentEmail,
      });

      // Step 4: Send for approval
      console.log(`   📲 Sending for approval via ${approvalChannel}...`);
      const { jobId } = await sendForApproval({
        lead,
        matches,
        email,
        channel: approvalChannel,
      });

      console.log(`   ✅ Job created: ${jobId}`);
      results.push({ lead, status: "pending_approval", jobId, matches });

    } catch (err) {
      console.error(`   ❌ Error processing ${lead.name}:`, err.message);
      results.push({ lead, status: "error", error: err.message });
    }

    // Small delay between leads to avoid rate limiting Gemini API
    await delay(1500);
  }

  const summary = {
    total: leads.length,
    pending_approval: results.filter((r) => r.status === "pending_approval").length,
    no_matches: results.filter((r) => r.status === "no_matches").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  };

  console.log("\n📊 Pipeline complete:", summary);
  return summary;
}

// ─── HTTP HANDLER (for Antigravity / Cloud Function endpoint) ─────────────────
// Expose this as a POST endpoint that accepts a multipart file upload.

export async function httpHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Antigravity / Cloud Functions typically parse multipart automatically.
    // Adjust based on how your framework delivers the file buffer.
    const fileBuffer = req.body?.file || req.rawBody;

    if (!fileBuffer) {
      return res.status(400).json({ error: "No file provided in request body." });
    }

    const summary = await runLeadPipeline(
      Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer, "base64")
    );

    return res.status(200).json({ success: true, ...summary });

  } catch (err) {
    console.error("Pipeline error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ─── HELPER ──────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
