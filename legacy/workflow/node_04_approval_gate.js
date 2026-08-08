/**
 * NODE 04 — Human Approval Gate
 * ================================
 * Input:  { lead, matches, email, jobId }
 * What it does:
 *   - Stores the pending job in Supabase with status "pending_approval"
 *   - Sends the agent a preview via WhatsApp OR Telegram (configurable per client)
 *   - Message includes: lead summary, 3 property titles, and two buttons/links:
 *       ✅ Approve  →  hits /api/approval?job=<id>&action=approve
 *       ❌ Reject   →  hits /api/approval?job=<id>&action=reject
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 * Dependencies: @supabase/supabase-js, node-fetch (or native fetch in Node 18+)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BASE_URL = process.env.APP_BASE_URL; // e.g. https://your-app.antigravity.dev

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function sendForApproval({ lead, matches, email, channel = "whatsapp" }) {
  // 1. Persist job to Supabase
  const { data: job, error } = await supabase
    .from("approval_jobs")
    .insert({
      lead_data: lead,
      matches_data: matches,
      email_data: email,
      status: "pending_approval",
      channel,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);

  const jobId = job.id;
  const approveUrl = `${BASE_URL}/api/approval?job=${jobId}&action=approve`;
  const rejectUrl = `${BASE_URL}/api/approval?job=${jobId}&action=reject`;

  // 2. Build the message
  const message = buildApprovalMessage({ lead, matches, email, approveUrl, rejectUrl });

  // 3. Send via configured channel
  if (channel === "whatsapp") {
    await sendWhatsAppApproval(message, approveUrl, rejectUrl);
  } else if (channel === "telegram") {
    await sendTelegramApproval(message, approveUrl, rejectUrl, jobId);
  }

  return { jobId, status: "pending_approval" };
}

// ─── MESSAGE BUILDER ─────────────────────────────────────────────────────────

function buildApprovalMessage({ lead, matches, email, approveUrl, rejectUrl }) {
  const props = matches
    .map((m, i) => `  ${i + 1}. ${m.title} — ${m.location} — ${m.price.toLocaleString()} SAR (Score: ${m.match_score}/100)`)
    .join("\n");

  return `
🏠 *New Lead Ready for Approval*

*Client:* ${lead.name}
*Budget:* ${lead.budget?.toLocaleString()} ${lead.budget_currency || "SAR"}
*Looking for:* ${lead.property_type} in ${lead.location}

*Email subject:* ${email.subject}

*Top 3 Matches:*
${props}

---
✅ *Approve & Send Email:*
${approveUrl}

❌ *Reject / Revise:*
${rejectUrl}
  `.trim();
}

// ─── WHATSAPP SENDER ─────────────────────────────────────────────────────────
// Uses Meta WhatsApp Cloud API — sends to the configured agent number.
// The approve/reject links are in the message body (interactive buttons
// require approved templates; use text links for flexibility).

async function sendWhatsAppApproval(message) {
  const agentPhone = process.env.AGENT_WHATSAPP_NUMBER; // e.g. "966501234567"
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: agentPhone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`WhatsApp send failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

// ─── TELEGRAM SENDER ─────────────────────────────────────────────────────────
// Sends to the agent's Telegram chat ID with inline keyboard approve/reject buttons.

async function sendTelegramApproval(message, approveUrl, rejectUrl, jobId) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.AGENT_TELEGRAM_CHAT_ID;

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Approve & Send", url: approveUrl },
              { text: "❌ Reject", url: rejectUrl },
            ],
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram send failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}
