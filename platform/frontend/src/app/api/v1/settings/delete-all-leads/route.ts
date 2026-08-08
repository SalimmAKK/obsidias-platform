import { NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Deletes every lead (and, via ON DELETE CASCADE, their conversations,
// messages, score history, activities, and qualification record) that
// belongs to the caller's agency. Scoped by agency_id explicitly since this
// uses the session-aware client, not the admin client — RLS would already
// enforce this, but the explicit filter also makes the intent unambiguous.
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase, agencyId } = ctx;

  const { error } = await supabase.from("leads").delete().eq("agency_id", agencyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
