/**
 * NODE 01 — Google Sheets File Upload Parser
 * ============================================
 * Trigger: A sheet file (.xlsx / .csv / Google Sheet) is uploaded.
 * What it does:
 *   - Parses Tab 1 (Leads): name, phone, email, budget, location, property type, bedrooms
 *   - Parses Tab 2 (Property Library): all listing columns
 *   - Returns structured JSON for downstream nodes
 *
 * Runtime: Antigravity / Google Cloud Functions (Node.js 20+)
 * Dependencies: xlsx (SheetJS), @google/generative-ai
 */

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function parseUploadedSheet(fileBuffer, mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length < 1) throw new Error("Sheet has no tabs.");

  // Tab 1 → Leads
  const leadsRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { defval: "" });

  // Tab 2 → Property Library (optional but expected)
  const propertiesRaw = sheetNames[1]
    ? XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]], { defval: "" })
    : [];

  // Use Gemini to normalize the lead columns regardless of header naming
  const leads = await normalizeleadsWithGemini(leadsRaw);
  const properties = normalizeProperties(propertiesRaw);

  return { leads, properties, meta: { totalLeads: leads.length, totalProperties: properties.length } };
}

// ─── GEMINI NORMALIZER — LEADS ────────────────────────────────────────────────
// Clients may use different column names (e.g. "Client Name" vs "Name" vs "اسم العميل")
// Gemini maps whatever headers exist to our standard schema.

async function normalizeleadsWithGemini(rawRows) {
  if (!rawRows.length) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are a data extraction assistant for a real estate CRM.
Below is raw JSON from an uploaded spreadsheet. The column names may vary (English, Arabic, abbreviations).

Your job: map each row to this exact schema:
{
  "name": string,           // full client name
  "phone": string,          // international format preferred, e.g. +966501234567
  "email": string,          // email address or empty string
  "budget": number,         // numeric value in SAR (strip currency symbols/commas)
  "budget_currency": string, // e.g. "SAR", "USD" — infer from context or default "SAR"
  "location": string,       // city or district they want
  "property_type": string,  // "apartment" | "villa" | "office" | "land" | "other"
  "bedrooms": number | null, // number of bedrooms or null if not applicable
  "notes": string           // any extra info from the row
}

Return ONLY a valid JSON array. No markdown, no explanation.

Raw data:
${JSON.stringify(rawRows, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    return JSON.parse(text);
  } catch {
    // Fallback: strip possible markdown fences
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

// ─── PROPERTY NORMALIZER ──────────────────────────────────────────────────────
// Simpler rule-based normalization for the property library tab.
// Add more field mappings as needed for your clients.

function normalizeProperties(rawRows) {
  return rawRows.map((row, index) => {
    const r = lowerKeys(row);
    return {
      id: r.id || r.property_id || `PROP-${String(index + 1).padStart(4, "0")}`,
      title: r.title || r.name || r.property_name || "Untitled",
      type: r.type || r.property_type || "other",
      location: r.location || r.city || r.district || r.area || "",
      price: toNumber(r.price || r.budget || r.asking_price || 0),
      bedrooms: toNumber(r.bedrooms || r.beds || r.br || 0),
      bathrooms: toNumber(r.bathrooms || r.baths || 0),
      size_sqm: toNumber(r.size || r.area_sqm || r.sqm || 0),
      description: r.description || r.notes || "",
      images: r.images || r.image_url || "",
      available: parseBoolean(r.available ?? r.status ?? true),
    };
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function lowerKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, "_"), v])
  );
}

function toNumber(val) {
  if (typeof val === "number") return val;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseBoolean(val) {
  if (typeof val === "boolean") return val;
  return !["no", "false", "0", "unavailable", "sold"].includes(String(val).toLowerCase());
}
