import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Service-role client — this process has no concept of a signed-in user,
// so every query it makes bypasses RLS by design. Every write MUST include
// an explicit agency_id filter/value; there is no policy layer backing you
// up here the way there is in the dashboard's session-aware routes.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
