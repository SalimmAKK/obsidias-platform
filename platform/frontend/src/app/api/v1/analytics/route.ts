import { NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface AnalyticsResponse {
  statusDistribution: { status: string; count: number }[];
  channelPerformance: { channel: string; total: number; qualified: number; qualificationRate: number }[];
  bucketDistribution: { bucket: string; count: number }[];
  weeklyVolume: { weekStart: string; count: number }[];
  avgTimeToQualifyHours: number | null;
  totalLeads: number;
}

const WEEKS = 12;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      statusDistribution: [], channelPerformance: [], bucketDistribution: [],
      weeklyVolume: [], avgTimeToQualifyHours: null, totalLeads: 0,
    } satisfies AnalyticsResponse);
  }

  const ctx = await getAuthedAgencyContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { supabase } = ctx;

  // Bounded fetch + in-memory aggregation — same known simplification as
  // the dashboard/campaigns routes; replace with a Postgres view/RPC once
  // lead volume outgrows this.
  const { data, error } = await supabase
    .from("leads")
    .select("status, channel, bucket, captured_at, updated_at")
    .order("captured_at", { ascending: false })
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const r of rows) statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Channel performance
  const channelGroups = new Map<string, { total: number; qualified: number }>();
  for (const r of rows) {
    const g = channelGroups.get(r.channel) || { total: 0, qualified: 0 };
    g.total += 1;
    if (r.status === "qualified" || r.status === "booked") g.qualified += 1;
    channelGroups.set(r.channel, g);
  }
  const channelPerformance = Array.from(channelGroups.entries())
    .map(([channel, g]) => ({
      channel, total: g.total, qualified: g.qualified,
      qualificationRate: g.total > 0 ? Math.round((g.qualified / g.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Bucket distribution
  const bucketCounts: Record<string, number> = {};
  for (const r of rows) bucketCounts[r.bucket] = (bucketCounts[r.bucket] || 0) + 1;
  const bucketDistribution = Object.entries(bucketCounts).map(([bucket, count]) => ({ bucket, count }));

  // Weekly volume, last 12 weeks
  const weeks: { weekStart: string; count: number }[] = [];
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(startOfThisWeek);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = rows.filter(r => {
      const t = new Date(r.captured_at).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    weeks.push({ weekStart: start.toISOString().slice(0, 10), count });
  }

  // Avg time-to-qualify (captured_at -> updated_at) for leads that reached
  // qualified/booked. This is a proxy, not a tracked event timestamp — the
  // schema doesn't record a qualified_at, so updated_at is the best signal
  // available without adding pipeline event history.
  const qualifiedRows = rows.filter(r => r.status === "qualified" || r.status === "booked");
  const avgTimeToQualifyHours = qualifiedRows.length > 0
    ? Math.round(
        (qualifiedRows.reduce((sum, r) => sum + (new Date(r.updated_at).getTime() - new Date(r.captured_at).getTime()), 0)
          / qualifiedRows.length) / (1000 * 60 * 60) * 10
      ) / 10
    : null;

  const response: AnalyticsResponse = {
    statusDistribution, channelPerformance, bucketDistribution, weeklyVolume: weeks,
    avgTimeToQualifyHours, totalLeads: rows.length,
  };

  return NextResponse.json(response);
}
