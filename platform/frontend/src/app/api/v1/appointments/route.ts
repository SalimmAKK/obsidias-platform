import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function mapAppointment(a: any) {
  return {
    id: a.id,
    leadId: a.lead_id,
    leadName: a.leads ? `${a.leads.first_name || ""} ${a.leads.last_name || ""}`.trim() : "Unknown Lead",
    leadPhone: a.leads?.phone || "",
    leadChannel: a.leads?.channel || "",
    scheduledAt: a.scheduled_at,
    status: a.status,
    location: a.location,
    notes: a.notes,
    createdAt: a.created_at,
  };
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ appointments: [] });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("appointments")
    .select("*, leads(first_name, last_name, phone, channel)")
    .order("scheduled_at", { ascending: true });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ appointments: (data || []).map(mapAppointment) });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase, agencyId } = ctx;

  const body = await request.json();
  const { leadId, scheduledAt, location, notes } = body;

  if (!leadId || !scheduledAt) {
    return NextResponse.json({ error: "leadId and scheduledAt are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      agency_id: agencyId,
      lead_id: leadId,
      scheduled_at: scheduledAt,
      location: location || "",
      notes: notes || "",
    })
    .select("*, leads(first_name, last_name, phone, channel)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Booking a viewing is a strong forward-pipeline signal — bump the lead
  // toward "booked" so it's reflected on the Dashboard/Leads/Lead Detail.
  await supabase.from("leads").update({ status: "booked" }).eq("id", leadId);

  return NextResponse.json({ success: true, appointment: mapAppointment(data) });
}
