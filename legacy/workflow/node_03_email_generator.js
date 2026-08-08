/**
 * NODE 03 — Email Generator (Gemini)
 * ====================================
 * Input:  { lead, matches: [top3], agentName, agencyName, agentPhone }
 * Output: { subject, bodyHtml, bodyText, previewText }
 *
 * Generates a professional, personalized property proposal email
 * ready to be sent via Gmail API (Node 05) after human approval.
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 * Dependencies: @google/generative-ai
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function generateProposalEmail({ lead, matches, agentName, agencyName, agentPhone, agentEmail }) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are a professional real estate copywriter writing on behalf of ${agencyName}.

Write a property proposal email to a client with these details:
- Client Name: ${lead.name}
- Budget: ${lead.budget} ${lead.budget_currency || "SAR"}
- Desired Location: ${lead.location}
- Property Type: ${lead.property_type}
- Bedrooms: ${lead.bedrooms ?? "not specified"}

The agent presenting the email:
- Agent Name: ${agentName}
- Agency: ${agencyName}
- Phone: ${agentPhone}
- Email: ${agentEmail}

TOP 3 MATCHED PROPERTIES:
${matches.map((m, i) => `
Property ${i + 1}: ${m.title}
- Location: ${m.location}
- Price: ${m.price.toLocaleString()} SAR
- Type: ${m.type}
- Bedrooms: ${m.bedrooms}, Bathrooms: ${m.bathrooms}
- Size: ${m.size_sqm} sqm
- Why it suits them: ${m.match_reason}
`).join("\n")}

INSTRUCTIONS:
1. Write in a warm, professional tone. Not salesy — consultative.
2. The email should feel hand-crafted, not automated.
3. Include a clear subject line.
4. Structure: greeting → brief intro → present all 3 properties with key details → warm CTA to schedule a viewing → sign-off.
5. Output TWO versions:
   a. HTML version (use inline styles, no external CSS, simple clean layout with property sections)
   b. Plain text version (for email clients that don't render HTML)

Return ONLY valid JSON in this exact format:
{
  "subject": "email subject line",
  "preview_text": "short preview text (max 100 chars)",
  "body_html": "full HTML email string",
  "body_text": "plain text version"
}

No markdown. No explanation.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  }

  return {
    lead,
    matches,
    email: {
      to: lead.email,
      subject: parsed.subject,
      preview_text: parsed.preview_text,
      body_html: parsed.body_html,
      body_text: parsed.body_text,
    },
  };
}
