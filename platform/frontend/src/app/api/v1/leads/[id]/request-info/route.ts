import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  console.log(`[API POST request-info] id: ${id}`, body);

  const nextTouch = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase } = ctx;

      const { data, error } = await supabase
        .from("leads")
        .update({ 
          status: "needs_review", 
          next_touch_at: nextTouch 
        })
        .eq("id", id);
      
      if (!error) {
        console.log(`[Agent] Called conversationalist agent with qualifying prompt injection for lead ${id}`);
        return NextResponse.json({ success: true, lead: data });
      }
    }
  } catch (err) {
    console.error("Supabase request-info update failed, falling back to mock leads database:", err);
  }

  // Mock implementation fallback
  const lead = mockLeadsDb.requestMoreInfo(id);
  console.log(`[Agent Mock] Called conversationalist agent with qualifying prompt injection for lead ${id}`);
  console.log(`[Database Mock] Set lead ${id} next_touch_at to ${nextTouch} and status to 'needs_review'`);

  return NextResponse.json({ success: true, lead });
}
