import { NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface CampaignRow {
  name: string;
  isSource: boolean; // true if this is a fallback grouping by `source`, not a real campaign tag
  total: number;
  qualified: number;
  hot: number;
  qualificationRate: number; // 0-100
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ campaigns: [] });
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase } = ctx;

  // Bounded fetch + in-memory aggregation, same known simplification as the
  // dashboard summary route — fine at current lead volumes, replace with a
  // Postgres view/RPC if/when that stops being true.
  const { data, error } = await supabase
    .from("leads")
    .select("source, campaign, status, bucket")
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const groups = new Map<string, { isSource: boolean; total: number; qualified: number; hot: number }>();

  for (const lead of data || []) {
    const name = lead.campaign?.trim() || lead.source;
    const isSource = !lead.campaign?.trim();
    const g = groups.get(name) || { isSource, total: 0, qualified: 0, hot: 0 };
    g.total += 1;
    if (lead.status === "qualified" || lead.status === "booked") g.qualified += 1;
    if (lead.bucket === "hot") g.hot += 1;
    groups.set(name, g);
  }

  const campaigns: CampaignRow[] = Array.from(groups.entries())
    .map(([name, g]) => ({
      name,
      isSource: g.isSource,
      total: g.total,
      qualified: g.qualified,
      hot: g.hot,
      qualificationRate: g.total > 0 ? Math.round((g.qualified / g.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ campaigns });
}
