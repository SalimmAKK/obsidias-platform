import { env } from "./env.js";

/**
 * Posts a message to the agency's Slack channel via an Incoming Webhook.
 * No-ops with a console warning if SLACK_WEBHOOK_URL isn't configured —
 * notifications are a nice-to-have, a missing webhook must never fail or
 * block the qualification job that triggered it.
 */
async function postToSlack(text: string, blocks?: unknown[]): Promise<void> {
  const webhookUrl = env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[slack] SLACK_WEBHOOK_URL not configured — skipping notification.");
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, ...(blocks ? { blocks } : {}) }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[slack] Webhook responded ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[slack] Failed to post notification:", err);
  }
}

function leadUrl(leadId: string): string | null {
  return env.APP_BASE_URL ? `${env.APP_BASE_URL}/leads/${leadId}` : null;
}

interface LeadNotificationInput {
  leadId: string;
  firstName: string;
  lastName: string;
  source: string;
  channel: string;
  score: number;
  confidence: number;
  qualificationNotes: string;
}

/** A lead scored hot and was auto-qualified — surface it immediately. */
export async function notifyHotLead(input: LeadNotificationInput): Promise<void> {
  const name = `${input.firstName} ${input.lastName}`.trim() || "Unnamed lead";
  const url = leadUrl(input.leadId);
  const lines = [
    `Hot lead qualified: ${name}`,
    `Source: ${input.source} (${input.channel}) — Score ${input.score}/100, confidence ${Math.round(input.confidence * 100)}%`,
    input.qualificationNotes,
    url ? `View: ${url}` : null,
  ].filter(Boolean);

  await postToSlack(lines.join("\n"));
}

/** A lead's AI confidence was too low to auto-decide — needs a human look. */
export async function notifyNeedsReview(input: LeadNotificationInput): Promise<void> {
  const name = `${input.firstName} ${input.lastName}`.trim() || "Unnamed lead";
  const url = leadUrl(input.leadId);
  const lines = [
    `Lead needs review: ${name}`,
    `Source: ${input.source} (${input.channel}) — AI confidence only ${Math.round(input.confidence * 100)}%`,
    input.qualificationNotes,
    url ? `Review: ${url}` : null,
  ].filter(Boolean);

  await postToSlack(lines.join("\n"));
}
