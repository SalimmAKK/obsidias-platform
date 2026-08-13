"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Clock, Users, Flame } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { ChannelIcon, CHANNEL_LABELS } from "@/components/LeadBadges";
import type { AnalyticsResponse } from "@/app/api/v1/analytics/route";

/* Entrance animation intentionally disabled on dashboard surfaces.
   `initial` values are server-rendered as inline styles, so an
   `opacity: 0` start ships invisible content in the raw HTML — if the JS
   bundle fails or is slow, the page is blank. `initial={false}` renders
   straight to the final state instead.

   This is also the right call on merit: these are screens an agent opens
   dozens of times a day, and a fade-in that reads as considered on first
   visit reads as latency on the fortieth. Crafted motion belongs on the
   marketing site; the tool should just be there. */
const fadeUp = (_delay = 0) => ({
  initial: false as const,
  animate: { opacity: 1, y: 0 },
});

const STATUS_LABELS: Record<string, string> = {
  new: "New", needs_review: "Needs Review", qualified: "Qualified",
  nurturing: "Nurturing", booked: "Booked", archived: "Archived", dead: "Dead",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#8B78FC", needs_review: "#F59E0B", qualified: "#10B981",
  nurturing: "#0EA5E9", booked: "#059669", archived: "#9CA3AF", dead: "#EF4444",
};
const BUCKET_COLORS: Record<string, string> = { hot: "#C77DFF", warm: "#10B981", cold: "#9CA3AF" };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-[inset_0_0_0_1px_var(--hair)] rounded-2xl p-4 min-w-[140px]" style={{ boxShadow: "0 8px 24px rgba(13,13,13,0.08)" }}>
      <p className="font-sans font-semibold text-[13px] text-[var(--ink)] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="font-sans text-[12px] text-[var(--ink3)]">{p.name}</span>
          <span className="font-sans font-semibold text-[12px] text-[var(--ink)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/analytics")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout title="Analytics">
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-[var(--purple)]" /></div>
      </AppLayout>
    );
  }

  const weeklyChart = (data?.weeklyVolume || []).map(w => ({
    name: new Date(w.weekStart).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    leads: w.count,
  }));

  const maxBucket = Math.max(1, ...(data?.bucketDistribution.map(b => b.count) || [1]));
  const totalStatus = data?.statusDistribution.reduce((s, x) => s + x.count, 0) || 0;

  return (
    <AppLayout title="Analytics">
      <motion.div {...fadeUp(0)} className="mb-6">
        <p className="font-sans text-[13.5px] text-[var(--ink3)]">
          Real performance derived from your lead data. Time-to-qualify is a proxy based on when a lead's record was last
          updated, since the pipeline doesn't track stage-change events yet.
        </p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <motion.div {...fadeUp(0.05)} className="saas-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-[var(--ink2)]">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center"><Users className="w-4 h-4 text-[var(--ink3)]" /></div>
          </div>
          <span className="font-sans font-semibold text-[30px] text-[var(--ink)]">{data?.totalLeads ?? 0}</span>
        </motion.div>
        <motion.div {...fadeUp(0.1)} className="saas-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-[var(--ink2)]">Avg Time to Qualify</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center"><Clock className="w-4 h-4 text-[var(--ink3)]" /></div>
          </div>
          <span className="font-sans font-semibold text-[30px] text-[var(--ink)]">
            {data?.avgTimeToQualifyHours != null ? `${data.avgTimeToQualifyHours}h` : "—"}
          </span>
        </motion.div>
        <motion.div {...fadeUp(0.15)} className="saas-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-[var(--ink2)]">Hot Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center"><Flame className="w-4 h-4 text-[var(--ink3)]" /></div>
          </div>
          <span className="font-sans font-semibold text-[30px] text-[var(--ink)]">
            {data?.bucketDistribution.find(b => b.bucket === "hot")?.count ?? 0}
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Weekly volume */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Lead Volume — Last 12 Weeks</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--rule)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--ink3)", fontSize: 10, fontWeight: 600 }} dy={8} interval={1} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--ink3)", fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(91,79,245,0.05)" }} />
                <Bar dataKey="leads" name="Leads" fill="#C1662E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bucket distribution */}
        <motion.div {...fadeUp(0.25)} className="saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Lead Temperature</h3>
          {(!data || data.bucketDistribution.length === 0) ? (
            <p className="text-[13px] text-[var(--ink3)] font-sans">No leads yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {["hot", "warm", "cold"].map(bucket => {
                const found = data.bucketDistribution.find(b => b.bucket === bucket);
                const count = found?.count ?? 0;
                return (
                  <div key={bucket}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans font-semibold text-[13px] text-[var(--ink)] capitalize">{bucket}</span>
                      <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / maxBucket) * 100}%`, background: BUCKET_COLORS[bucket] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status distribution */}
        <motion.div {...fadeUp(0.3)} className="saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Leads by Pipeline Stage</h3>
          {totalStatus === 0 ? (
            <p className="text-[13px] text-[var(--ink3)] font-sans">No leads yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.statusDistribution.map(s => (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{STATUS_LABELS[s.status] || s.status}</span>
                    <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{s.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / totalStatus) * 100}%`, background: STATUS_COLORS[s.status] || "#9CA3AF" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Channel performance */}
        <motion.div {...fadeUp(0.35)} className="saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Channel Performance</h3>
          {(!data || data.channelPerformance.length === 0) ? (
            <p className="text-[13px] text-[var(--ink3)] font-sans">No leads yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.channelPerformance.map(c => (
                <div key={c.channel} className="flex items-center gap-3">
                  <ChannelIcon channel={c.channel} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">
                        {CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] || c.channel}
                      </span>
                      <span className="font-sans text-[12px] text-[var(--ink3)]">{c.total} leads · {c.qualificationRate}% qualified</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--purple)]" style={{ width: `${c.qualificationRate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
