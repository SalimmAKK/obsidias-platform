/**
 * NODE 02 — Property Matching Agent (Gemini)
 * ===========================================
 * Input:  { lead: LeadObject, properties: PropertyObject[] }
 * Output: { lead, matches: [top3 properties with match_score and match_reason] }
 *
 * Matching logic:
 *   - Hard filters: property_type, location proximity, budget range (±20%)
 *   - Soft scoring: bedrooms, size, availability
 *   - Gemini re-ranks filtered results and writes a human-readable match_reason
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 * Dependencies: @google/generative-ai
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function matchLeadToProperties(lead, properties) {
  // Step 1: Hard filter — budget within ±25%, same type (loose), available only
  const budgetMin = lead.budget * 0.75;
  const budgetMax = lead.budget * 1.25;

  const filtered = properties.filter((p) => {
    if (!p.available) return false;
    if (p.price < budgetMin || p.price > budgetMax) return false;
    if (lead.property_type && lead.property_type !== "other") {
      if (p.type && p.type !== "other" && p.type !== lead.property_type) return false;
    }
    return true;
  });

  // If hard filter leaves too few, relax budget to ±40%
  const pool = filtered.length >= 3
    ? filtered
    : properties.filter((p) => p.available && p.price >= lead.budget * 0.6 && p.price <= lead.budget * 1.4);

  // Step 2: Score each property on hard metrics
  const scored = pool.map((p) => ({
    ...p,
    _score: computeScore(lead, p),
  })).sort((a, b) => b._score - a._score).slice(0, 10); // top 10 for Gemini to reason over

  // Step 3: Gemini re-ranks and writes reasoning
  const top3 = await rankWithGemini(lead, scored);

  return { lead, matches: top3 };
}

// ─── SCORE FUNCTION ───────────────────────────────────────────────────────────

function computeScore(lead, property) {
  let score = 0;

  // Location match (exact city or district string match)
  const leadLoc = (lead.location || "").toLowerCase();
  const propLoc = (property.location || "").toLowerCase();
  if (propLoc.includes(leadLoc) || leadLoc.includes(propLoc)) score += 40;

  // Budget closeness (closer = higher score)
  const priceDiff = Math.abs(property.price - lead.budget) / (lead.budget || 1);
  score += Math.max(0, 30 - priceDiff * 100);

  // Bedroom match
  if (lead.bedrooms && property.bedrooms) {
    if (property.bedrooms === lead.bedrooms) score += 20;
    else if (Math.abs(property.bedrooms - lead.bedrooms) === 1) score += 10;
  }

  // Property type match
  if (lead.property_type && property.type === lead.property_type) score += 10;

  return score;
}

// ─── GEMINI RANKER ────────────────────────────────────────────────────────────

async function rankWithGemini(lead, candidates) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are a senior real estate advisor. A client is looking for a property.

CLIENT PREFERENCES:
- Name: ${lead.name}
- Budget: ${lead.budget} ${lead.budget_currency || "SAR"}
- Desired Location: ${lead.location}
- Property Type: ${lead.property_type}
- Bedrooms needed: ${lead.bedrooms ?? "not specified"}
- Notes: ${lead.notes || "none"}

AVAILABLE PROPERTIES (pre-filtered, max 10):
${JSON.stringify(candidates.map(({ _score, ...p }) => p), null, 2)}

YOUR TASK:
1. Select the TOP 3 best matches for this client.
2. For each match, write a concise, personalized match_reason (2-3 sentences max) explaining WHY this property suits them.
3. Assign a match_score from 0–100 reflecting how well it fits.

Return ONLY a valid JSON array of exactly 3 objects with this schema:
[
  {
    "id": "property id",
    "title": "property title",
    "type": "...",
    "location": "...",
    "price": number,
    "bedrooms": number,
    "bathrooms": number,
    "size_sqm": number,
    "description": "...",
    "match_score": number,
    "match_reason": "personalized explanation for the client"
  }
]

No markdown. No explanation outside the JSON.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}
