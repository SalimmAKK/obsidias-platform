/**
 * NODE 05 — Approval Webhook Handler + Gmail Sender
 * ===================================================
 * Endpoint: GET/POST /api/approval?job=<id>&action=approve|reject
 *
 * On APPROVE:
 *   - Fetches job from Supabase
 *   - Sends the email via Gmail API (OAuth2)
 *   - Updates job status to "sent"
 *   - Logs outcome to Supabase CRM table
 *
 * On REJECT:
 *   - Updates job status to "rejected"
 *   - Optionally notifies agent (can be extended)
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 * Dependencies: @supabase/supabase-js, googleapis
 */

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── MAIN HANDLER (HTTP endpoint) ────────────────────────────────────────────

export async function handleApproval(req, res) {
  const jobId = req.query?.job || req.body?.job;
  const action = req.query?.action || req.body?.action;

  if (!jobId || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ error: "Missing job ID or invalid action." });
  }

  // Fetch the job
  const { data: job, error: fetchError } = await supabase
    .from("approval_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) return res.status(404).json({ error: "Job not found." });
  if (job.status !== "pending_approval") {
    return res.status(409).json({ error: `Job already processed: ${job.status}` });
  }

  if (action === "approve") {
    await approveAndSend(job);
    return res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2 style="color:#1a7a4a">✅ Email approved and sent!</h2>
        <p>The proposal has been delivered to <strong>${job.lead_data?.name}</strong>.</p>
      </body></html>
    `);
  }

  if (action === "reject") {
    await rejectJob(job);
    return res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2 style="color:#c0392b">❌ Email rejected.</h2>
        <p>This lead has been marked as needing revision.</p>
      </body></html>
    `);
  }
}

// ─── APPROVE FLOW ────────────────────────────────────────────────────────────

async function approveAndSend(job) {
  const { lead_data: lead, matches_data: matches, email_data: email } = job;

  // Send via Gmail
  await sendGmailEmail({
    to: email.to || lead.email,
    subject: email.subject,
    bodyHtml: email.body_html,
    bodyText: email.body_text,
  });

  // Update job status
  await supabase
    .from("approval_jobs")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", job.id);

  // Log to CRM
  await supabase.from("crm_leads").insert({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    budget: lead.budget,
    location: lead.location,
    property_type: lead.property_type,
    matched_properties: matches.map((m) => m.id),
    email_subject: email.subject,
    status: "proposal_sent",
    created_at: job.created_at,
    sent_at: new Date().toISOString(),
  });
}

// ─── REJECT FLOW ─────────────────────────────────────────────────────────────

async function rejectJob(job) {
  await supabase
    .from("approval_jobs")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", job.id);

  await supabase.from("crm_leads").insert({
    name: job.lead_data?.name,
    phone: job.lead_data?.phone,
    email: job.lead_data?.email,
    budget: job.lead_data?.budget,
    location: job.lead_data?.location,
    property_type: job.lead_data?.property_type,
    status: "rejected",
    created_at: job.created_at,
  });
}

// ─── GMAIL SENDER ────────────────────────────────────────────────────────────
// Uses Gmail API with a service account or OAuth2 refresh token.
// Set GMAIL_REFRESH_TOKEN, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET in env.

async function sendGmailEmail({ to, subject, bodyHtml, bodyText }) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Build RFC 2822 MIME message
  const boundary = "boundary_" + Date.now();
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    bodyText,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    bodyHtml,
    ``,
    `--${boundary}--`,
  ].join("\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
}
