import type { Job } from "bullmq";
import { supabaseAdmin } from "../../lib/supabase.js";
import { notifyReactivationDigest } from "../../lib/slack.js";

// A lead counts as "cold" once this many days pass with no contact and
// no explicit next_touch_at scheduled in the future. Configurable so an
// agency can tune it without a code change; 7 days is a reasonable
// default for real estate follow-up cadence.
const COLD_DAYS = Number(process.env.REACTIVATION_COLD_DAYS) || 7;

// Pipeline stages worth re-engaging. Deliberately excludes 'booked'
// (already converted), 'archived' and 'dead' (explicitly closed out) —
// flagging those as "cold" would be noise, not a real signal.
const ELIGIBLE_STATUSES = ["new", "needs_review", "qualified", "nurturing"];

interface CandidateLead {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  status: string;
  source: string;
  channel: string;
  captured_at: string;
  next_touch_at: string | null;
}

/**
 * Daily sweep: finds leads nobody has followed up with in COLD_DAYS,
 * moves them into 'nurturing' so they're visibly distinguished from
 * fresh leads, schedules their next check, logs an activity record, and
 * sends one Slack digest so a human knows to actually reach out — there's
 * no automated outbound channel yet (that's the conversation engine,
 * still pending WhatsApp), so a human following up is the real action
 * this job drives today.
 */
export async function processReactivationSweep(_job: Job) {
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: candidates, error: candidatesError } = await supabaseAdmin
    .from("leads")
    .select("id, agency_id, first_name, last_name, status, source, channel, captured_at, next_touch_at")
    .in("status", ELIGIBLE_STATUSES)
    .or(`next_touch_at.is.null,next_touch_at.lte.${nowIso}`);

  if (candidatesError) {
    throw new Error(`[reactivation] Failed to load candidate leads: ${candidatesError.message}`);
  }
  if (!candidates || candidates.length === 0) {
    console.log("[reactivation] No candidate leads to evaluate.");
    return;
  }

  const leadIds = candidates.map((l) => l.id);
  const { data: conversations, error: convError } = await supabaseAdmin
    .from("conversations")
    .select("lead_id, last_message_at")
    .in("lead_id", leadIds);

  if (convError) {
    throw new Error(`[reactivation] Failed to load conversations: ${convError.message}`);
  }

  const lastActivityByLead = new Map<string, number>();
  for (const lead of candidates as CandidateLead[]) {
    lastActivityByLead.set(lead.id, new Date(lead.captured_at).getTime());
  }
  for (const conv of conversations || []) {
    const current = lastActivityByLead.get(conv.lead_id) ?? 0;
    const messageTime = new Date(conv.last_message_at).getTime();
    if (messageTime > current) lastActivityByLead.set(conv.lead_id, messageTime);
  }

  const coldThresholdMs = COLD_DAYS * 24 * 60 * 60 * 1000;
  const coldLeads = (candidates as CandidateLead[]).filter((lead) => {
    const lastActivity = lastActivityByLead.get(lead.id) ?? new Date(lead.captured_at).getTime();
    return now.getTime() - lastActivity >= coldThresholdMs;
  });

  if (coldLeads.length === 0) {
    console.log(`[reactivation] Evaluated ${candidates.length} leads, none cold (>= ${COLD_DAYS} days).`);
    return;
  }

  console.log(`[reactivation] Flagging ${coldLeads.length} cold lead(s) for follow-up...`);

  const nextTouchAt = new Date(now.getTime() + coldThresholdMs).toISOString();
  const flagged: Array<{ id: string; firstName: string; lastName: string; source: string; channel: string; daysCold: number }> = [];

  for (const lead of coldLeads) {
    const lastActivity = lastActivityByLead.get(lead.id) ?? new Date(lead.captured_at).getTime();
    const daysCold = Math.floor((now.getTime() - lastActivity) / (24 * 60 * 60 * 1000));

    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ status: "nurturing", next_touch_at: nextTouchAt })
      .eq("id", lead.id);

    if (updateError) {
      console.error(`[reactivation] Failed to update lead ${lead.id}:`, updateError.message);
      continue;
    }

    await supabaseAdmin.from("activities").insert({
      lead_id: lead.id,
      agency_id: lead.agency_id,
      type: "reactivation_flagged",
      metadata: { days_cold: daysCold, previous_status: lead.status },
    });

    flagged.push({
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      source: lead.source,
      channel: lead.channel,
      daysCold,
    });
  }

  if (flagged.length > 0) {
    await notifyReactivationDigest(flagged).catch((err) =>
      console.error("[reactivation] Failed to send Slack digest:", err)
    );
  }

  console.log(`[reactivation] Sweep complete — flagged ${flagged.length}/${coldLeads.length} lead(s).`);
}
