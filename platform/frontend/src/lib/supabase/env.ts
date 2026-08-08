/**
 * Reads the Supabase project URL/anon key and reports whether they're real
 * (vs. the unset/mock-project dev default). Every module that needs to
 * branch on "do we actually have a Supabase project" should go through this
 * instead of re-deriving the check inline.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const configured = Boolean(url) && Boolean(anonKey) && !url.includes("mock-project");
  return { url, anonKey, configured };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv().configured;
}
