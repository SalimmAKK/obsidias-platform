import { NextRequest, NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";
import { mockConversations } from "@/lib/mockDb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase } = ctx;

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (leadError) throw leadError;
      if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

      const [{ data: conversation }, { data: scoreHistory }, { data: activities }] = await Promise.all([
        supabase.from("conversations").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("lead_score_history").select("*").eq("lead_id", id).order("recorded_at", { ascending: true }),
        supabase.from("activities").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(20),
      ]);

      let messages: any[] = [];
      if (conversation) {
        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", (conversation as any).id)
          .order("created_at", { ascending: true });
        messages = data || [];
      }

      return NextResponse.json({
        lead: mapLead(lead),
        conversation: conversation ? {
          id: (conversation as any).id,
          status: (conversation as any).status,
          channel: (conversation as any).channel,
          lastMessageAt: (conversation as any).last_message_at,
        } : null,
        messages: messages.map((m: any) => ({
          id: m.id,
          direction: m.direction,
          content: m.content,
          isAi: m.is_ai,
          isHuman: m.is_human,
          channel: m.channel,
          createdAt: m.created_at,
        })),
        scoreHistory: (scoreHistory || []).map((s: any) => ({ score: s.score, recordedAt: s.recorded_at })),
        activities: (activities || []).map((a: any) => ({ type: a.type, metadata: a.metadata, createdAt: a.created_at })),
      });
    }
  } catch (err) {
    console.error("Supabase lead detail query failed, falling back to mock data:", err);
  }

  // Mock fallback
  const mockLead = mockLeadsDb.getLeads({}).find(l => l.id === id);
  const mockConvo = mockConversations.find(c => c.leadId === id || c.id === id);

  if (!mockLead && !mockConvo) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    lead: mockLead ? mapLead(mockLead) : {
      id: mockConvo!.leadId,
      firstName: mockConvo!.leadName.split(" ")[0],
      lastName: mockConvo!.leadName.split(" ").slice(1).join(" "),
      email: "", phone: "",
      source: "Meta Ad", channel: mockConvo!.channel,
      status: "nurturing", bucket: mockConvo!.bucket, score: mockConvo!.score, confidence: mockConvo!.score / 100,
      bant: { budget: "unknown", authority: "unknown", need: "unknown", timeline: "unknown" },
      qualificationNotes: "", capturedAt: new Date().toISOString(),
    },
    conversation: mockConvo ? { id: mockConvo.id, status: mockConvo.status, channel: mockConvo.channel, lastMessageAt: mockConvo.lastMessageAt } : null,
    messages: mockConvo ? mockConvo.messages.map(m => ({
      id: m.id, direction: m.direction, content: m.content, isAi: m.isAi, isHuman: m.isHuman, channel: m.channel, createdAt: m.sentAt,
    })) : [],
    scoreHistory: mockConvo ? [{ score: mockConvo.score, recordedAt: new Date().toISOString() }] : [],
    activities: [],
  });
}

function mapLead(l: any) {
  return {
    id: String(l.id),
    firstName: l.first_name,
    lastName: l.last_name,
    email: l.email || "",
    phone: l.phone || "",
    source: l.source,
    channel: l.channel,
    status: l.status,
    bucket: l.bucket,
    score: Number(l.score || 0),
    confidence: Number(l.confidence || 0),
    bant: {
      budget: l.bant_budget || "unknown",
      authority: l.bant_authority || "unknown",
      need: l.bant_need || "unknown",
      timeline: l.bant_timeline || "unknown",
    },
    qualificationNotes: l.qualification_notes || "",
    disqualifyReason: l.disqualify_reason || null,
    capturedAt: l.captured_at,
  };
}
