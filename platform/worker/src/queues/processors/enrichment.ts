import type { Job } from "bullmq";
import { supabaseAdmin } from "../../lib/supabase.js";
import { enrichPerson, isApolloConfigured } from "../../lib/apollo.js";
import { qualificationQueue } from "../definitions.js";

export interface EnrichmentJobData {
  leadId: string;
}

/**
 * Runs before qualification in the pipeline: best-effort fills in job
 * title / company / LinkedIn via Apollo when the lead has an email, then
 * always hands off to qualification whether enrichment found anything or
 * not — enrichment enhances the qualification prompt's context, it never
 * gates it.
 */
export async function processEnrichmentJob(job: Job<EnrichmentJobData>) {
  const { leadId } = job.data;
  if (!leadId) throw new Error("Enrichment job is missing leadId.");

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, agency_id, email, first_name, last_name")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) throw new Error(`Failed to load lead ${leadId}: ${leadError.message}`);
  if (!lead) throw new Error(`Lead ${leadId} not found.`);

  if (isApolloConfigured() && lead.email) {
    try {
      console.log(`[enrichment] Looking up ${lead.email} via Apollo...`);
      const result = await enrichPerson({
        email: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name,
      });

      if (result) {
        await supabaseAdmin
          .from("leads")
          .update({
            enrichment_job_title: result.jobTitle,
            enrichment_company: result.company,
            enrichment_linkedin_url: result.linkedinUrl,
            enriched_at: new Date().toISOString(),
          })
          .eq("id", leadId);

        await supabaseAdmin.from("activities").insert({
          lead_id: leadId,
          agency_id: lead.agency_id,
          type: "lead_enriched",
          metadata: { job_title: result.jobTitle, company: result.company },
        });

        console.log(`[enrichment] Lead ${leadId} enriched: ${result.jobTitle || "?"} at ${result.company || "?"}`);
      } else {
        console.log(`[enrichment] No Apollo match for lead ${leadId}.`);
      }
    } catch (err) {
      // Best-effort — log and move on to qualification regardless.
      console.error(`[enrichment] Apollo lookup failed for lead ${leadId}:`, err);
    }
  } else if (!lead.email) {
    console.log(`[enrichment] Lead ${leadId} has no email — skipping enrichment.`);
  } else {
    console.log("[enrichment] Apollo not configured — skipping enrichment.");
  }

  await qualificationQueue
    .add("qualify-lead", { leadId }, { jobId: `qualify-${leadId}-${Date.now()}` })
    .catch((err) => console.error(`[enrichment] Failed to enqueue qualification job for lead ${leadId}:`, err));
}
