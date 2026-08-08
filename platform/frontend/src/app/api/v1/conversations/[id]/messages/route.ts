import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/lib/mockDb";

function mapMessage(m: any) {
  return {
    id: m.id,
    direction: m.direction,
    content: m.content,
    sentAt: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    isAi: m.is_ai,
    isHuman: m.is_human,
    channel: m.channel,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return NextResponse.json(data.map(mapMessage));
      }
    }
  } catch (err) {
    console.error("Supabase messages query failed, falling back to mock data:", err);
  }

  const conversation = mockConversations.find(c => c.id === id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json(conversation.messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { content, direction, isHuman } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("channel")
        .eq("id", id)
        .maybeSingle();

      if (convError) throw convError;
      if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: id,
          direction: direction || "outbound",
          content,
          is_ai: !isHuman,
          is_human: !!isHuman,
          channel: (conversation as any).channel,
        })
        .select("*")
        .single();

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", id);

      return NextResponse.json(mapMessage(data));
    }
  } catch (err: any) {
    console.error("Supabase message insert failed:", err);
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }

  // Mock fallback
  const conversation = mockConversations.find(c => c.id === id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const now = new Date();
  const sentAt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const newMessage = {
    id: `m_${Date.now()}`,
    direction: direction || "outbound",
    content,
    sentAt,
    isAi: !isHuman,
    isHuman: !!isHuman,
    channel: conversation.channel,
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = content;
  conversation.lastMessageAt = "just now";

  return NextResponse.json(newMessage);
}
