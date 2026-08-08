import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/lib/mockDb";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { count, error } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("unread", true);

      if (!error && count !== null) {
        return NextResponse.json({ count });
      }
    }
  } catch (err) {
    console.error("Supabase unread count query failed, falling back to mock data:", err);
  }

  const count = mockConversations.filter(c => c.unread).length;
  return NextResponse.json({ count });
}
