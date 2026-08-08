"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Browser-side Supabase client. Uses the anon key only — every query it
 * makes is subject to the RLS policies in platform/supabase/platform_schema.sql,
 * scoped to the signed-in user's agency. Safe to import into client components.
 *
 * In dev without real Supabase credentials configured, this points at a
 * clearly-fake project so calls fail fast and loudly instead of silently
 * hitting a real backend with placeholder creds.
 */
const { url, anonKey } = getSupabaseEnv();

export const supabase = createBrowserClient(
  url || "https://mock-project.supabase.co",
  anonKey || "mock-anon-key"
);
