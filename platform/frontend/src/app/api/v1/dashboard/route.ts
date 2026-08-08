import { NextResponse } from "next/server";
import { getAuthedAgencyContext } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockLeadsDb } from "@/lib/mockLeadsDb";

export interface DashboardSummary {
  totalLeads: number;
  needsReview: number;
  hotLeads: number;
  qualifiedThisWeek: number;
  channelBreakdown: { channel: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  volume: { date: string; captured: number; qualified: number }[];
  recentLeads: {
    id: string;
    firstName: string;
    lastName: string;
    source: string;
    channel: string;
    bucket: string;
    status: string;
    score: number;
    capturedAt: string;
  }[];
}

const VOLUME_DAYS = 30;

function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function buildVolumeSeries(rows: { captured_at: string; status: string }[]): DashboardSummary["volume"] {
  const days: Record<string, { captured: number; qualified: number }> = {};
  const today = new Date();

  for (let i = VOLUME_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days[key] = { captured: 0, qualified: 0 };
  }

  for (const row of rows) {
    const key = row.captured_at?.slice(0, 10);
    if (!key || !(key in days)) continue;
    days[key].captured += 1;
    if (row.status === "qualified") days[key].qualified += 1;
  }

  return Object.entries(days).map(([date, v]) => ({ date, ...v }));
}

function aggregateBreakdowns(rows: { channel: string; status: string }[]) {
  const channelCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const row of rows) {
    channelCounts[row.channel] = (channelCounts[row.channel] || 0) + 1;
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }

  return {
    channelBreakdown: Object.entries(channelCounts).map(([channel, count]) => ({ channel, count })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
  };
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const ctx = await getAuthedAgencyContext();
      if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { supabase } = ctx;

      const [totalRes, needsReviewRes, hotRes, qualifiedWeekRes, recentRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "needs_review"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("bucket", "hot"),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "qualified")
          .gte("updated_at", startOfWeekISO()),
        // Bounded fetch for chart/breakdown aggregation. Fine for an agency's
        // current lead volume; once volume outgrows this, replace with a
        // Postgres view/RPC that aggregates server-side instead.
        supabase
          .from("leads")
          .select("id, first_name, last_name, source, channel, bucket, status, score, captured_at")
          .order("captured_at", { ascending: false })
          .limit(200),
      ]);

      if (!totalRes.error && !recentRes.error && recentRes.data) {
        const rows = recentRes.data;
        const { channelBreakdown, statusBreakdown } = aggregateBreakdowns(rows as any);
        const volume = buildVolumeSeries(rows as any);

        const summary: DashboardSummary = {
          totalLeads: totalRes.count ?? 0,
          needsReview: needsReviewRes.count ?? 0,
          hotLeads: hotRes.count ?? 0,
          qualifiedThisWeek: qualifiedWeekRes.count ?? 0,
          channelBreakdown,
          statusBreakdown,
          volume,
          recentLeads: rows.slice(0, 8).map((l: any) => ({
            id: l.id,
            firstName: l.first_name,
            lastName: l.last_name,
            source: l.source,
            channel: l.channel,
            bucket: l.bucket,
            status: l.status,
            score: l.score,
            capturedAt: l.captured_at,
          })),
        };

        return NextResponse.json(summary);
      }
    }
  } catch (err) {
    console.error("Dashboard summary query failed, falling back to mock data:", err);
  }

  return NextResponse.json(buildMockSummary());
}

function buildMockSummary(): DashboardSummary {
  const leads = mockLeadsDb.getLeads({});
  const { channelBreakdown, statusBreakdown } = aggregateBreakdowns(
    leads.map(l => ({ channel: l.channel, status: l.status }))
  );
  const volume = buildVolumeSeries(leads.map(l => ({ captured_at: new Date().toISOString(), status: l.status })));

  return {
    totalLeads: leads.length,
    needsReview: leads.filter(l => l.status === "needs_review").length,
    hotLeads: leads.filter(l => l.bucket === "warm").length,
    qualifiedThisWeek: 0,
    channelBreakdown,
    statusBreakdown,
    volume,
    recentLeads: leads.slice(0, 8).map(l => ({
      id: l.id,
      firstName: l.first_name,
      lastName: l.last_name,
      source: l.source,
      channel: l.channel,
      bucket: l.bucket,
      status: l.status,
      score: 0,
      capturedAt: l.captured_at,
    })),
  };
}
