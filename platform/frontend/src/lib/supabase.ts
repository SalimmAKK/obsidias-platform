// Re-exported for backward compatibility — existing client components import
// `supabase` from here. New code should prefer importing directly from
// `@/lib/supabase/client` (browser), `@/lib/supabase/server` (server
// components/route handlers, session-aware), or `@/lib/supabase/admin`
// (route handlers only, service-role, bypasses RLS).
export { supabase } from "./supabase/client";
