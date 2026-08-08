import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes the auth session via cookies, so
 * `supabase.auth.getUser()` reflects the actual signed-in user and RLS
 * applies normally. This is the client to use for anything that should
 * respect "who is calling this" (as opposed to the admin client below,
 * which ignores RLS entirely).
 */
/**
 * Convenience for API routes: the session-aware client plus the caller's
 * user id and agency id (read from their profile). Returns null if there's
 * no authenticated session — callers should treat that as 401/fall back.
 */
export async function getAuthedAgencyContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { supabase, userId: user.id, agencyId: profile.agency_id as string };
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url || "https://mock-project.supabase.co", anonKey || "mock-anon-key", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Called from a Server Component render, where cookies can't be
          // written. Safe to ignore as long as proxy.ts is refreshing
          // the session on every request.
        }
      },
    },
  });
}
