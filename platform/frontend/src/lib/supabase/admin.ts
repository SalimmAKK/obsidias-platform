import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely —
 * use it ONLY in API route handlers (platform/frontend/src/app/api/v1/**),
 * never in a client component and never send it to the browser.
 *
 * `import "server-only"` makes any accidental client-side import a build
 * error instead of a leaked service-role key.
 *
 * Every write this client makes MUST be scoped to the caller's agency_id
 * manually (fetched from the authenticated user's profile first) since RLS
 * won't do it for us here.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const { url, configured } = getSupabaseEnv();

export const isSupabaseAdminConfigured = configured && Boolean(serviceRoleKey);

export const supabaseAdmin = createClient(
  url || "https://mock-project.supabase.co",
  serviceRoleKey || "mock-service-role-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
