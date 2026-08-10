import OpenAI from "openai";
import { env } from "./env.js";
import { BantAssessmentSchema, type BantAssessment } from "./bant.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to platform/worker/.env (local) or Railway's Variables tab (deployed)."
    );
  }
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

interface QualifyInput {
  firstName: string;
  lastName: string;
  source: string;
  channel: string;
  campaign?: string | null;
  /** The lead's own words, if any exist yet (first inbound message). */
  inquiryText?: string | null;
}

const SYSTEM_PROMPT = `You are a qualification assistant for a real estate agency operating in Saudi Arabia and the wider Gulf. You assess inbound leads against BANT criteria: Budget, Authority, Need, Timeline.

Respond with strict JSON only, matching this exact shape:
{
  "budget": "unknown" | "low" | "medium" | "high",
  "authority": "unknown" | "true" | "false",
  "need": "unknown" | "weak" | "moderate" | "strong",
  "timeline": "unknown" | "immediate" | "3months" | "6months",
  "confidence": number between 0 and 1,
  "qualification_notes": string, a short (2-3 sentence) explanation an agent will read,
  "disqualified": boolean,
  "disqualify_reason": string, only present if disqualified is true
}

Rules:
- If there is no message text to assess (the lead has only just been captured, no conversation yet), return "unknown" for every BANT field and a low confidence (0.1-0.2). Do not guess or invent signal that isn't there.
- "authority" true means the person you're speaking with appears to be the actual decision-maker (not researching on someone else's behalf).
- Set disqualified=true only for a clear reason: wrong market/location, spam, clearly not a genuine buyer/renter inquiry. A lead who simply hasn't given enough signal yet is NOT disqualified — that's low confidence, not disqualification.
- confidence reflects how much you actually know, not how promising the lead seems. A confirmed decision-maker with a small budget is high confidence; an enthusiastic message with no budget/timeline mentioned is low confidence.`;

export async function assessLead(input: QualifyInput): Promise<BantAssessment> {
  const openai = getClient();

  const userPrompt = [
    `Lead: ${input.firstName} ${input.lastName}`,
    `Source: ${input.source}`,
    `Channel: ${input.channel}`,
    input.campaign ? `Campaign: ${input.campaign}` : null,
    "",
    input.inquiryText
      ? `Message from the lead:\n"${input.inquiryText}"`
      : "No message from the lead yet — only contact details have been captured.",
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty response for lead qualification.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI response was not valid JSON: ${raw.slice(0, 200)}`);
  }

  const result = BantAssessmentSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`OpenAI response failed schema validation: ${result.error.message}`);
  }

  return result.data;
}
