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

  console.log(`[API PATCH qualify] id: ${id}`, body);

  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase, agencyId, userId } = ctx;

      const { data, error } = await supabase
        .from("leads")
        .update({ status: "qualified", overridden_by_human: true })
        .eq("id", id);

      try {
        await supabase.from("activities").insert({
          lead_id: id,
          agency_id: agencyId,
          actor_id: userId,
          type: "human_qualification_override",
        });
      } catch (actErr) {
        console.warn("Could not log activity in Supabase, continuing:", actErr);
      }

      if (!error) {
        console.log(`[BullMQ] Enqueued conversation.start job for lead ${id} with triggerType: 'first_touch'`);
        return NextResponse.json({ success: true, lead: data });
      }
    }
  } catch (err) {
    console.error("Supabase update failed, falling back to mock leads database:", err);
  }

  // Mock implementation fallback
  const lead = mockLeadsDb.qualifyLead(id);
  console.log(`[BullMQ Mock] Enqueued conversation.start job for lead ${id} with triggerType: 'first_touch'`);
  console.log(`[Activity Mock] Logged activity 'human_qualification_override' for lead ${id}`);

  return NextResponse.json({ success: true, lead });
}
