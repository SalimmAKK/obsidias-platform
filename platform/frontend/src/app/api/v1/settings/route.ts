import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ agencyName: "Demo Agency", fullName: "", email: "" });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase, userId, agencyId } = ctx;

  const [{ data: agency }, { data: profile }] = await Promise.all([
    supabase.from("agencies").select("name").eq("id", agencyId).maybeSingle(),
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
  ]);

  return NextResponse.json({
    agencyName: agency?.name || "",
    fullName: profile?.full_name || "",
    email: profile?.email || "",
  });
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase, userId, agencyId } = ctx;

  const body = await request.json();
  const { agencyName, fullName } = body;

  try {
    // .select() forces PostgREST to report which rows were actually
    // affected. Without it, an update blocked by RLS (0 rows matched)
    // returns no error at all and looks identical to success — which is
    // exactly what happened here before this fix (agencies/profiles had no
    // UPDATE policy, only SELECT; see platform_schema.sql).
    if (typeof agencyName === "string") {
      const { data, error } = await supabase.from("agencies").update({ name: agencyName }).eq("id", agencyId).select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Agency update did not apply — check RLS policies.");
    }
    if (typeof fullName === "string") {
      const { data, error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId).select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Profile update did not apply — check RLS policies.");
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}
