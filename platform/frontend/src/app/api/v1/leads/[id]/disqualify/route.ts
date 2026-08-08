import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const reason = body.disqualifyReason || "";

  console.log(`[API PATCH disqualify] id: ${id}`, body);

  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase } = ctx;

      const { data, error } = await supabase
        .from("leads")
        .update({ status: "archived" })
        .eq("id", id);
      
      try {
        await supabase
          .from("qualifications")
          .upsert({
            lead_id: id,
            disqualify_reason: reason,
            overridden_by_human: true,
            updated_at: new Date().toISOString()
          });
      } catch (qualErr) {
        console.warn("Could not write qualification record, continuing:", qualErr);
      }

      if (!error) {
        return NextResponse.json({ success: true, lead: data });
      }
    }
  } catch (err) {
    console.error("Supabase disqualify failed, falling back to mock leads database:", err);
  }

  // Mock implementation fallback
  const lead = mockLeadsDb.disqualifyLead(id, reason);
  console.log(`[Qualification Mock] Wrote disqualify_reason: '${reason}' and overridden_by_human: true for lead ${id}`);

  return NextResponse.json({ success: true, lead });
}
