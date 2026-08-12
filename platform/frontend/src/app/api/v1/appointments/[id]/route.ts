import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cancelCalcomBooking } from "@/lib/calcom";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { id } = await params;
  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase } = ctx;

  const body = await request.json();
  const update: Record<string, any> = {};
  if (typeof body.status === "string") update.status = body.status;
  if (typeof body.scheduledAt === "string") update.scheduled_at = body.scheduledAt;
  if (typeof body.location === "string") update.location = body.location;
  if (typeof body.notes === "string") update.notes = body.notes;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Fetch the existing calcom_booking_uid first — cancelling on Cal.com's
  // side needs it, and it's cheaper to grab up front than to re-query
  // after the update below.
  const { data: existing } = await supabase
    .from("appointments")
    .select("calcom_booking_uid")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  // Best-effort — a failed Cal.com cancellation must never undo the local
  // status change, which is already the source of truth for the dashboard.
  if (update.status === "cancelled" && existing?.calcom_booking_uid) {
    try {
      await cancelCalcomBooking(existing.calcom_booking_uid);
    } catch (err) {
      console.error("Cal.com cancellation sync failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
