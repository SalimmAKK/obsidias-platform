import type { Job } from "bullmq";
import { supabaseAdmin } from "../../lib/supabase.js";
import { upsertContact, isHubSpotConfigured } from "../../lib/hubspot.js";

export interface CrmSyncJobData {
  leadId: string;
}

/**
 * Pushes a qualified lead into HubSpot as a contact. Triggered by the
 * qualification processor once a lead reaches "qualified" — no point
 * syncing a lead the AI hasn't actually confirmed yet.
 */
export async function processCrmSyncJob(job: Job<CrmSyncJobData>) {
  const { leadId } = job.data;
  if (!leadId) throw new Error("CRM sync job is missing leadId.");

  if (!isHubSpotConfigured()) {
    console.log("[crm-sync] HubSpot not configured — skipping.");
    return;
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, agency_id, first_name, last_name, email, phone")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) throw new Error(`Failed to load lead ${leadId}: ${leadError.message}`);
  if (!lead) throw new Error(`Lead ${leadId} not found.`);

  console.log(`[crm-sync] Syncing lead ${leadId} (${lead.first_name} ${lead.last_name}) to HubSpot...`);

  try {
    const result = await upsertContact({
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone,
    });

    await supabaseAdmin.from("leads").update({ hs_contact_id: result.contactId }).eq("id", leadId);

    await supabaseAdmin.from("activities").insert({
      lead_id: leadId,
      agency_id: lead.agency_id,
      type: "crm_synced",
      metadata: { hs_contact_id: result.contactId },
    });

    console.log(`[crm-sync] Lead ${leadId} synced -> HubSpot contact ${result.contactId}.`);
  } catch (err) {
    // Best-effort — a CRM outage or misconfigured account must never be
    // treated as a qualification failure; the lead is still fully valid
    // and usable inside Obsidias even if this sync didn't go through.
    console.error(`[crm-sync] Failed to sync lead ${leadId} to HubSpot:`, err);
    await supabaseAdmin.from("activities").insert({
      lead_id: leadId,
      agency_id: lead.agency_id,
      type: "crm_sync_failed",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}
