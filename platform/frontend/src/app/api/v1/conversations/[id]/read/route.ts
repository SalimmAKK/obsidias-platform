import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/lib/mockDb";

async function handle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("conversations").update({ unread: false }).eq("id", id);
      if (!error) return NextResponse.json({ success: true });
      throw error;
    }
  } catch (err) {
    console.error("Supabase read update failed, falling back to mock data:", err);
  }

  const conversation = mockConversations.find(c => c.id === id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  conversation.unread = false;
  return NextResponse.json({ success: true, conversation });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(request, ctx);
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(request, ctx);
}
