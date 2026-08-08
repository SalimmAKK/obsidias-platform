import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/lib/mockDb";

function initials(first: string, last: string): string {
  return `${(first || "?").charAt(0)}${(last || "").charAt(0)}`.toUpperCase();
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const bucket = searchParams.get("bucket");
  const channel = searchParams.get("channel");

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      let query = supabase
        .from("conversations")
        .select("*, leads(first_name, last_name, bucket, score), messages(content, is_ai, is_human, created_at)")
        .order("last_message_at", { ascending: false })
        .order("created_at", { foreignTable: "messages", ascending: false })
        .limit(1, { foreignTable: "messages" });

      if (status) query = query.eq("status", status);
      if (channel) query = query.eq("channel", channel);

      const { data, error } = await query;
      if (!error && data) {
        let rows = data as any[];
        if (bucket) rows = rows.filter(r => r.leads?.bucket === bucket);

        const mapped = rows.map(c => {
          const lastMsg = c.messages?.[0];
          return {
            id: c.id,
            leadId: c.lead_id,
            leadName: `${c.leads?.first_name || ""} ${c.leads?.last_name || ""}`.trim() || "Unknown Lead",
            leadInitials: initials(c.leads?.first_name, c.leads?.last_name),
            score: c.leads?.score ?? 0,
            bucket: c.leads?.bucket ?? "cold",
            status: c.status,
            channel: c.channel,
            lastMessage: lastMsg?.content || "",
            lastMessageAt: relativeTime(lastMsg?.created_at || c.last_message_at),
            unread: c.unread,
          };
        });

        return NextResponse.json(mapped);
      }
    }
  } catch (err) {
    console.error("Supabase conversations query failed, falling back to mock data:", err);
  }

  // Mock fallback
  let filtered = [...mockConversations];
  if (status) filtered = filtered.filter(c => c.status === status);
  if (bucket) filtered = filtered.filter(c => c.bucket === bucket);
  if (channel) filtered = filtered.filter(c => c.channel === channel);

  return NextResponse.json(filtered.map(c => ({
    id: c.id, leadId: c.leadId, leadName: c.leadName, leadInitials: c.leadInitials,
    score: c.score, bucket: c.bucket, status: c.status, channel: c.channel,
    lastMessage: c.lastMessage, lastMessageAt: c.lastMessageAt, unread: c.unread,
    avatarBg: c.avatarBg, avatarColor: c.avatarColor,
  })));
}
