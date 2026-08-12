import { env } from "./env.js";

// Apollo's People Match API (https://apolloio.github.io/apollo-api-docs/).
// Best-effort contact enrichment — a lead with no match, or no email to
// match on, is a completely normal outcome here, not an error. Only
// network/auth failures throw.

export function isApolloConfigured(): boolean {
  return Boolean(env.APOLLO_API_KEY);
}

export interface EnrichedPerson {
  jobTitle: string | null;
  company: string | null;
  linkedinUrl: string | null;
}

interface EnrichPersonInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Looks up a person by email via Apollo. Returns null (not an error) when
 * Apollo has no match — that's the common case for most leads, especially
 * outside the US market Apollo's data skews toward.
 */
export async function enrichPerson(input: EnrichPersonInput): Promise<EnrichedPerson | null> {
  if (!env.APOLLO_API_KEY) {
    throw new Error("APOLLO_API_KEY is not set — cannot enrich.");
  }

  const res = await fetch("https://api.apollo.io/api/v1/people/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "x-api-key": env.APOLLO_API_KEY,
    },
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      reveal_personal_emails: false,
      reveal_phone_number: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Apollo people/match responded ${res.status}: ${body.slice(0, 300)}`);
  }

  const body = await res.json();
  const person = body?.person;
  if (!person) return null;

  return {
    jobTitle: person.title || null,
    company: person.organization?.name || null,
    linkedinUrl: person.linkedin_url || null,
  };
}
