import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";

function mapLead(l: any) {
  return {
    id: String(l.id),
    firstName: l.first_name || "",
    lastName: l.last_name || "",
    email: l.email || "",
    phone: l.phone || "",
    source: l.source,
    channel: l.channel,
    campaign: l.campaign || "",
    capturedAt: l.captured_at || l.created_at,
    status: l.status || "new",
    bucket: l.bucket || "warm",
    score: Number(l.score || 0),
    confidence: Number(l.confidence || 0),
    bant: {
      budget: l.bant_budget || "unknown",
      authority: l.bant_authority || "unknown",
      need: l.bant_need || "unknown",
      timeline: l.bant_timeline || "unknown",
    },
    qualificationNotes: l.qualification_notes || "",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const source = searchParams.get("source") || undefined;
  const channel = searchParams.get("channel") || undefined;
  const q = searchParams.get("q") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      let query = supabase.from("leads").select("*", { count: "exact" });

      if (status && status !== "all") query = query.eq("status", status);
      if (source && source !== "all") query = query.eq("source", source);
      if (channel && channel !== "all") query = query.eq("channel", channel);
      if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.order("captured_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (!error && data) {
        return NextResponse.json({
          leads: data.map(mapLead),
          total: count ?? data.length,
          page,
          pageSize,
        });
      }
    }
  } catch (err) {
    console.error("Supabase query failed, falling back to mock leads database:", err);
  }

  // Fallback to mock leads (no pagination — mock set is small)
  const mockLeads = mockLeadsDb.getLeads({ status, source, channel });
  return NextResponse.json({
    leads: mockLeads.map(mapLead),
    total: mockLeads.length,
    page: 1,
    pageSize: mockLeads.length || pageSize,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, phone, source, channel, campaign } = body;

  if (!firstName) {
    return NextResponse.json({ error: "firstName is required" }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase, agencyId } = ctx;

      const { data, error } = await supabase
        .from("leads")
        .insert({
          agency_id: agencyId,
          first_name: firstName,
          last_name: lastName || "",
          email: email || null,
          phone: phone || null,
          source: source || "Landing Page",
          channel: channel || "whatsapp",
          campaign: campaign?.trim() || null,
          status: "new",
        })
        .select("*")
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, lead: mapLead(data) });
      }
      if (error) throw error;
    }
  } catch (err: any) {
    console.error("Supabase insert failed:", err);
    return NextResponse.json({ error: err.message || "Failed to create lead" }, { status: 500 });
  }

  return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
}
