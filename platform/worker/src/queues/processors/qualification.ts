import type { Job } from "bullmq";
import { supabaseAdmin } from "../../lib/supabase.js";
import { assessLead } from "../../lib/openai.js";
import { scoreFromConfidence, bucketFromScore } from "../../lib/bant.js";

export interface QualificationJobData {
  leadId: string;
}

export async function processQualificationJob(job: Job<QualificationJobData>) {
  const { leadId } = job.data;
  if (!leadId) throw new Error("Qualification job is missing leadId.");

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, agency_id, first_name, last_name, source, channel, campaign")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) throw new Error(`Failed to load lead ${leadId}: ${leadError.message}`);
  if (!lead) throw new Error(`Lead ${leadId} not found — nothing to qualify.`);

  // Pull the earliest inbound message, if one exists, as the qualification
  // input. A lead added with no initial inquiry yet has nothing to assess
  // beyond contact details — the prompt handles that case explicitly
  // rather than us skipping the job (skipping would leave the lead stuck
  // at status "new" forever with no record anything ran).
  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let inquiryText: string | null = null;
  if (conversation) {
    const { data: message } = await supabaseAdmin
      .from("messages")
      .select("content")
      .eq("conversation_id", conversation.id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    inquiryText = message?.content ?? null;
  }

  console.log(`[qualification] Assessing lead ${leadId} (${lead.first_name} ${lead.last_name})...`);

  const assessment = await assessLead({
    firstName: lead.first_name,
    lastName: lead.last_name,
    source: lead.source,
    channel: lead.channel,
    campaign: lead.campaign,
    inquiryText,
  });

  const score = scoreFromConfidence(assessment.confidence);
  const bucket = bucketFromScore(score);

  const status = assessment.disqualified
    ? "archived"
    : assessment.confidence >= 0.55
      ? "qualified"
      : "needs_review";

  const { error: updateError } = await supabaseAdmin
    .from("leads")
    .update({
      bant_budget: assessment.budget,
      bant_authority: assessment.authority,
      bant_need: assessment.need,
      bant_timeline: assessment.timeline,
      confidence: assessment.confidence,
      qualification_notes: assessment.qualification_notes,
      score,
      bucket,
      status,
      disqualify_reason: assessment.disqualified ? assessment.disqualify_reason ?? "Disqualified by AI qualification." : null,
    })
    .eq("id", leadId);

  if (updateError) throw new Error(`Failed to write qualification result for lead ${leadId}: ${updateError.message}`);

  await supabaseAdmin.from("lead_score_history").insert({
    lead_id: leadId,
    score,
    recorded_at: new Date().toISOString(),
  });

  await supabaseAdmin.from("activities").insert({
    lead_id: leadId,
    agency_id: lead.agency_id,
    type: "ai_qualification",
    metadata: {
      confidence: assessment.confidence,
      status,
      disqualified: assessment.disqualified,
    },
  });

  console.log(
    `[qualification] Lead ${leadId} -> status=${status} confidence=${assessment.confidence} score=${score} bucket=${bucket}`
  );
}
