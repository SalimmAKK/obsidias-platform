import { env } from "./env.js";

// HubSpot CRM API v3 (https://developers.hubspot.com/docs/api/crm/contacts),
// authenticated via a Private App access token (HubSpot deprecated plain
// API keys). Pushes a qualified lead into the agency's CRM as a contact.

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export function isHubSpotConfigured(): boolean {
  return Boolean(env.HUBSPOT_ACCESS_TOKEN);
}

interface UpsertContactInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

interface UpsertContactResult {
  contactId: string;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
  };
}

/**
 * HubSpot has no single "upsert by email" endpoint the way GoHighLevel
 * does, so this does it in two steps: search for an existing contact by
 * email or phone, then PATCH it if found or POST a new one if not. Throws
 * on any failure — callers should treat that as "sync didn't happen this
 * time," not fail the qualification result that already landed.
 */
export async function upsertContact(input: UpsertContactInput): Promise<UpsertContactResult> {
  if (!env.HUBSPOT_ACCESS_TOKEN) {
    throw new Error("HubSpot is not configured (HUBSPOT_ACCESS_TOKEN missing).");
  }
  if (!input.email && !input.phone) {
    throw new Error("HubSpot sync needs at least an email or phone to match/create a contact.");
  }

  const properties: Record<string, string> = {
    firstname: input.firstName,
    lastname: input.lastName,
  };
  if (input.email) properties.email = input.email;
  if (input.phone) properties.phone = input.phone;

  // filterGroups are OR'd together, filters within a group are AND'd — so
  // this matches on email OR phone, whichever the lead has.
  const filterGroups = [];
  if (input.email) filterGroups.push({ filters: [{ propertyName: "email", operator: "EQ", value: input.email }] });
  if (input.phone) filterGroups.push({ filters: [{ propertyName: "phone", operator: "EQ", value: input.phone }] });

  const searchRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ filterGroups, limit: 1 }),
  });

  if (!searchRes.ok) {
    const body = await searchRes.text().catch(() => "");
    throw new Error(`HubSpot contact search failed (${searchRes.status}): ${body.slice(0, 300)}`);
  }

  const searchBody = await searchRes.json();
  const existingId: string | undefined = searchBody?.results?.[0]?.id;

  if (existingId) {
    const patchRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${existingId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ properties }),
    });
    if (!patchRes.ok) {
      const body = await patchRes.text().catch(() => "");
      throw new Error(`HubSpot contact update failed (${patchRes.status}): ${body.slice(0, 300)}`);
    }
    return { contactId: existingId };
  }

  const createRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ properties }),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => "");
    throw new Error(`HubSpot contact create failed (${createRes.status}): ${body.slice(0, 300)}`);
  }
  const createBody = await createRes.json();
  if (!createBody?.id) throw new Error("HubSpot contact create succeeded but returned no id.");

  return { contactId: createBody.id };
}
