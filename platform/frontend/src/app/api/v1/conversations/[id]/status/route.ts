import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/lib/mockDb";

async function handle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (status !== "ai" && status !== "human") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("conversations").update({ status }).eq("id", id);
      if (!error) return NextResponse.json({ success: true, status });
      throw error;
    }
  } catch (err) {
    console.error("Supabase status update failed, falling back to mock data:", err);
  }

  const conversation = mockConversations.find(c => c.id === id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  conversation.status = status;
  return NextResponse.json({ success: true, status: conversation.status });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(request, ctx);
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(request, ctx);
}
