import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const { count, error } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "needs_review");
      
      if (!error && count !== null) {
        return NextResponse.json({ count });
      }
    }
  } catch (err) {
    console.error("Supabase count query failed, falling back to mock leads database:", err);
  }

  // Fallback to mock count
  const count = mockLeadsDb.getReviewCount();
  return NextResponse.json({ count });
}
