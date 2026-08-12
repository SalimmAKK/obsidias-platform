import { z } from "zod";
import { getOpenAIClient } from "./openai.js";

// This is the reasoning half of the conversation engine only — it decides
// WHAT the AI should say next and whether a human should take over. It does
// not send anything over WhatsApp/Instagram/email itself; those channels
// aren't wired up yet. The processor that calls this (see
// queues/processors/conversation.ts) writes the reply as a normal outbound
// message row, which the dashboard's Conversations page already renders —
// so an agent can see exactly what the AI would say. Once a real send
// channel exists, that processor is the one place that needs to change to
// actually deliver it.

export const ConversationReplySchema = z.object({
  reply: z.string(),
  handoff: z.boolean(),
  handoff_reason: z.string().nullable(),
});

export type ConversationReply = z.infer<typeof ConversationReplySchema>;

export interface ConversationMessage {
  direction: "inbound" | "outbound";
  content: string;
}

export interface ConversationTurnInput {
  firstName: string;
  lastName: string;
  channel: string;
  bant: {
    budget: string;
    authority: string;
    need: string;
    timeline: string;
  };
  qualificationNotes: string;
  /** Chronological, oldest first. */
  history: ConversationMessage[];
}

const SYSTEM_PROMPT = `You are a real estate agency's WhatsApp/Instagram/email assistant, operating in Saudi Arabia and the wider Gulf. You're having an ongoing conversation with a lead. Your job is narrow: keep the conversation moving toward a clear picture of their Budget, Authority, Need, and Timeline (BANT), answer straightforward questions about the process, and get them to the point of booking a viewing — a human agent handles the actual booking and anything beyond a scripted qualification chat.

Respond with strict JSON only, matching this exact shape:
{
  "reply": string — the next message to send the lead. Keep it short (1-3 sentences), warm, professional, in the same language the lead is writing in (Arabic or English). Ask at most one question at a time.
  "handoff": boolean — true if a human agent should take over instead of the AI replying further,
  "handoff_reason": string or null — required if handoff is true, null otherwise
}

Hand off to a human (handoff: true) when:
- The lead explicitly asks to speak to a person/agent.
- The lead is ready to book a viewing (has given enough BANT signal and wants to move forward) — a human should confirm the actual appointment.
- The message is hostile, abusive, or clearly not a genuine inquiry.
- The lead asks something specific to a property, price negotiation, or contract terms that you don't have real data for — never invent listing details, prices, or availability.
- The conversation has gone back and forth several times without landing on anything the AI script can resolve.

When handoff is true, "reply" should still contain a brief, natural message if one is appropriate (e.g. "Let me connect you with one of our agents now.") — or an empty string if the human should simply pick up the thread with no AI message first.

Never invent specific property details, prices, or availability — that's exactly the kind of question that should trigger a handoff, not a guess.`;

export async function generateConversationReply(input: ConversationTurnInput): Promise<ConversationReply> {
  const openai = getOpenAIClient();

  const historyText = input.history
    .map((m) => `${m.direction === "inbound" ? "Lead" : "Assistant"}: ${m.content}`)
    .join("\n");

  const userPrompt = [
    `Lead: ${input.firstName} ${input.lastName}`,
    `Channel: ${input.channel}`,
    `Known BANT so far — budget: ${input.bant.budget}, authority: ${input.bant.authority}, need: ${input.bant.need}, timeline: ${input.bant.timeline}`,
    input.qualificationNotes ? `Qualification notes: ${input.qualificationNotes}` : null,
    "",
    "Conversation so far (oldest first):",
    historyText || "(no messages yet)",
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty response for conversation reply.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI response was not valid JSON: ${raw.slice(0, 200)}`);
  }

  const result = ConversationReplySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`OpenAI response failed schema validation: ${result.error.message}`);
  }

  return result.data;
}
