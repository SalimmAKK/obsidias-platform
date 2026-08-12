import type { Job } from "bullmq";
import { supabaseAdmin } from "../../lib/supabase.js";
import { generateConversationReply } from "../../lib/conversation.js";

export interface ConversationJobData {
  leadId: string;
  conversationId: string;
}

/**
 * Generates the AI's next reply in an ongoing conversation and writes it
 * as a normal outbound message — the dashboard's Conversations page
 * already renders whatever's in the messages table, so this is visible
 * immediately even though nothing is actually sent over WhatsApp yet
 * (that channel isn't wired up). The one thing that changes once it is:
 * this processor also calls the real send API after writing the message.
 */
export async function processConversationJob(job: Job<ConversationJobData>) {
  const { leadId, conversationId } = job.data;
  if (!leadId || !conversationId) throw new Error("Conversation job is missing leadId or conversationId.");

  const { data: conversation, error: convError } = await supabaseAdmin
    .from("conversations")
    .select("id, status, channel")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError) throw new Error(`Failed to load conversation ${conversationId}: ${convError.message}`);
  if (!conversation) throw new Error(`Conversation ${conversationId} not found.`);

  if (conversation.status === "human") {
    console.log(`[conversation] Conversation ${conversationId} is on human status — skipping AI reply.`);
    return;
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, agency_id, first_name, last_name, channel, status, bant_budget, bant_authority, bant_need, bant_timeline, qualification_notes")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) throw new Error(`Failed to load lead ${leadId}: ${leadError.message}`);
  if (!lead) throw new Error(`Lead ${leadId} not found.`);

  if (lead.status === "archived") {
    console.log(`[conversation] Lead ${leadId} is archived — skipping AI reply.`);
    return;
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("direction, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) throw new Error(`Failed to load messages for conversation ${conversationId}: ${messagesError.message}`);
  if (!messages || messages.length === 0) {
    console.log(`[conversation] No messages in conversation ${conversationId} — nothing to reply to.`);
    return;
  }

  // Defensive: only reply if the most recent message is inbound. If the
  // last message is already our own outbound reply (e.g. a retried job),
  // replying again would double up — skip instead.
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.direction !== "inbound") {
    console.log(`[conversation] Last message in ${conversationId} is already outbound — skipping.`);
    return;
  }

  console.log(`[conversation] Generating reply for lead ${leadId} (${lead.first_name} ${lead.last_name})...`);

  const result = await generateConversationReply({
    firstName: lead.first_name,
    lastName: lead.last_name,
    channel: lead.channel,
    bant: {
      budget: lead.bant_budget,
      authority: lead.bant_authority,
      need: lead.bant_need,
      timeline: lead.bant_timeline,
    },
    qualificationNotes: lead.qualification_notes,
    history: messages.map((m) => ({ direction: m.direction as "inbound" | "outbound", content: m.content })),
  });

  if (result.reply.trim()) {
    const { error: insertError } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      direction: "outbound",
      content: result.reply,
      is_ai: true,
      is_human: false,
      channel: conversation.channel,
    });
    if (insertError) throw new Error(`Failed to insert AI reply for conversation ${conversationId}: ${insertError.message}`);

    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  }

  if (result.handoff) {
    await supabaseAdmin.from("conversations").update({ status: "human" }).eq("id", conversationId);
    await supabaseAdmin.from("activities").insert({
      lead_id: leadId,
      agency_id: lead.agency_id,
      type: "conversation_handoff",
      metadata: { reason: result.handoff_reason },
    });
    console.log(`[conversation] Handed off conversation ${conversationId} to a human: ${result.handoff_reason}`);
  } else {
    console.log(`[conversation] Sent AI reply in conversation ${conversationId}.`);
  }
}
