"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, CheckSquare, Flame, CalendarCheck, Plus, ExternalLink, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { LeadStatusBadge, BucketBadge, ChannelIcon, CHANNEL_LABELS } from "@/components/LeadBadges";
import type { DashboardSummary } from "@/app/api/v1/dashboard/route";

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-[inset_0_0_0_1px_var(--hair)] rounded-2xl p-4 min-w-[160px]" style={{ boxShadow: "0 8px 24px rgba(13,13,13,0.08)" }}>
      <p className="font-sans font-semibold text-[13px] text-[var(--ink)] mb-3">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
            <span className="font-sans text-[12px] text-[var(--ink3)]">{p.name}</span>
          </div>
          <span className="font-sans font-semibold text-[12px] text-[var(--ink)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface CardData {
  title: string; value: number; icon: React.ElementType; tone?: "default" | "warning" | "success";
}

function MetricCard({ title, value, icon: Icon, tone = "default", delay = 0 }: CardData & { delay?: number }) {
  const toneColor = tone === "warning" ? "text-amber-600" : tone === "success" ? "text-[var(--green)]" : "text-[var(--ink)]";
  return (
    <motion.div {...fadeUp(delay)} className="saas-card p-6" style={{ height: "100%" }}>
      <div className="flex items-start justify-between mb-3">
        <span className="font-sans font-semibold text-[13px] text-[var(--ink2)]">{title}</span>
        <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[var(--ink3)]" />
        </div>
      </div>
      <div className={`font-sans font-semibold text-[30px] tracking-tight leading-none ${toneColor}`}>
        {value.toLocaleString()}
      </div>
    </motion.div>
  );
}

function AddLeadModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const emptyForm = {
    firstName: "", lastName: "", email: "", phone: "",
    source: "Landing Page", channel: "whatsapp", campaign: "", inquiryText: "",
  };
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add lead");
      }
      addToast(
        form.inquiryText.trim() ? `${form.firstName} added and sent for AI qualification.` : `${form.firstName} added.`,
        "success"
      );
      setForm(emptyForm);
      onCreated();
      onClose();
    } catch (err: any) {
      addToast(err.message || "Failed to add lead", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lead" maxWidth="max-w-[480px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">First Name</label>
            <input required className="input-field" value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Last Name</label>
            <input className="input-field" value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Email</label>
          <input type="email" className="input-field" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Phone</label>
          <input className="input-field" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Source</label>
            <select className="input-field" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {["Meta Ad", "Landing Page", "Chat Widget", "Referral", "Instagram"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Channel</label>
            <select className="input-field" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
              {Object.entries(CHANNEL_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Campaign <span className="normal-case font-normal text-[var(--ink3)]">(optional)</span></label>
          <input className="input-field" placeholder="e.g. Q1 Riyadh Villas" value={form.campaign}
            onChange={e => setForm(f => ({ ...f, campaign: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">
            What did they say? <span className="normal-case font-normal text-[var(--ink3)]">(optional — logged as their first message, and sent for AI qualification)</span>
          </label>
          <textarea
            className="input-field !h-auto py-2.5"
            rows={3}
            placeholder="e.g. Looking for a 3 bedroom villa in Riyadh, budget around 1.5M SAR, want to move within 2 months"
            value={form.inquiryText}
            onChange={e => setForm(f => ({ ...f, inquiryText: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add Lead"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [chartGrouping, setChartGrouping] = useState<"daily" | "weekly">("daily");

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/v1/dashboard");
      if (res.ok) setSummary(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const chartData = (() => {
    if (!summary) return [];
    if (chartGrouping === "daily") {
      return summary.volume.map(v => ({
        name: new Date(v.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        captured: v.captured,
        qualified: v.qualified,
      }));
    }
    // Weekly grouping: bucket the 30-day daily series into 4-5 week chunks.
    const weeks: { name: string; captured: number; qualified: number }[] = [];
    for (let i = 0; i < summary.volume.length; i += 7) {
      const chunk = summary.volume.slice(i, i + 7);
      const captured = chunk.reduce((sum, v) => sum + v.captured, 0);
      const qualified = chunk.reduce((sum, v) => sum + v.qualified, 0);
      weeks.push({ name: `Wk of ${new Date(chunk[0].date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`, captured, qualified });
    }
    return weeks;
  })();

  const totalChannel = summary?.channelBreakdown.reduce((s, c) => s + c.count, 0) || 0;
  const totalStatus = summary?.statusBreakdown.reduce((s, c) => s + c.count, 0) || 0;

  if (loading) {
    return (
      <AppLayout greeting>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--purple)]" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout greeting>
      <AddLeadModal isOpen={addOpen} onClose={() => setAddOpen(false)} onCreated={fetchSummary} />

      {/* ── Header actions ────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="font-sans text-[13.5px] text-[var(--ink3)]">
          Here's what's happening across your pipeline today.
        </p>
        <button className="premium-button flex items-center gap-2 !py-2.5 !px-5" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </motion.div>

      {/* ── Metric Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard title="Total Leads" value={summary?.totalLeads ?? 0} icon={Users} delay={0.05} />
        <MetricCard title="Needs Review" value={summary?.needsReview ?? 0} icon={CheckSquare} tone="warning" delay={0.1} />
        <MetricCard title="Hot Leads" value={summary?.hotLeads ?? 0} icon={Flame} tone="success" delay={0.15} />
        <MetricCard title="Qualified This Week" value={summary?.qualifiedThisWeek ?? 0} icon={CalendarCheck} tone="success" delay={0.2} />
      </div>

      {/* ── Row 2: Chart + Channel breakdown ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <motion.div {...fadeUp(0.25)} className="lg:col-span-2 saas-card p-6">
          <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
            <div>
              <p className="font-sans font-semibold text-[13px] text-[var(--ink2)] mb-1">Lead Volume (last 30 days)</p>
              <span className="font-sans font-semibold text-[28px] text-[var(--ink)] tracking-tight">{summary?.totalLeads ?? 0}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink2)]">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#C1662E" }} />Captured
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink2)]">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#E8A96C" }} />Qualified
              </div>
              <div className="flex items-center bg-[var(--bg)] shadow-[inset_0_0_0_1px_var(--hair)] rounded-lg p-1">
                {(["daily", "weekly"] as const).map(g => (
                  <button key={g} onClick={() => setChartGrouping(g)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${chartGrouping === g ? "bg-white shadow-sm text-[var(--purple)]" : "text-[var(--ink3)]"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: 240, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={chartGrouping === "daily" ? 10 : 32} barGap={2}
                margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--rule)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: "var(--ink3)", fontSize: 10, fontWeight: 600 }} dy={8}
                  interval={chartGrouping === "daily" ? 4 : 0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--ink3)", fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(91,79,245,0.05)" }} />
                <Bar dataKey="captured" name="Captured" fill="#C1662E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualified" name="Qualified" fill="#E8A96C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Channel breakdown */}
        <motion.div {...fadeUp(0.3)} className="saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Leads by Channel</h3>
          {totalChannel === 0 ? (
            <p className="text-[13px] text-[var(--ink3)] font-sans">No leads captured yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {summary?.channelBreakdown.map(c => (
                <div key={c.channel}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ChannelIcon channel={c.channel} />
                    <span className="font-sans font-semibold text-[13px] text-[var(--ink)] flex-1">
                      {CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] || c.channel}
                    </span>
                    <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{c.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--purple)]" style={{ width: `${(c.count / totalChannel) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Recent leads + Status distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div {...fadeUp(0.35)} className="lg:col-span-2 saas-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hair)]">
            <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)]">Recent Leads</h3>
            <button className="text-[12px] font-semibold text-[var(--purple)] hover:underline flex items-center gap-1" onClick={() => router.push("/leads")}>
              View All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--hair)]">
                  {["LEAD", "SOURCE", "CHANNEL", "BUCKET", "STATUS"].map(h => (
                    <th key={h} className="py-3 px-4 font-sans font-semibold text-[10px] uppercase tracking-wider text-[var(--ink3)] text-left first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(summary?.recentLeads.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-[13px] text-[var(--ink3)] font-sans">No leads yet — add one to get started.</td></tr>
                )}
                {summary?.recentLeads.map((row, i) => (
                  <motion.tr key={row.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--bg)] cursor-pointer transition-colors"
                    onClick={() => router.push(`/leads/${row.id}`)}
                  >
                    <td className="py-3.5 px-4 pl-6">
                      <p className="font-sans font-semibold text-[13px] text-[var(--ink)] leading-tight">{row.firstName} {row.lastName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[13px] text-[var(--ink2)]">{row.source}</td>
                    <td className="py-3.5 px-4"><ChannelIcon channel={row.channel} /></td>
                    <td className="py-3.5 px-4"><BucketBadge bucket={row.bucket} /></td>
                    <td className="py-3.5 px-4"><LeadStatusBadge status={row.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Status distribution */}
        <motion.div {...fadeUp(0.4)} className="saas-card p-6">
          <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-5">Pipeline Status</h3>
          {totalStatus === 0 ? (
            <p className="text-[13px] text-[var(--ink3)] font-sans">No leads yet.</p>
          ) : (
            <>
              <div className="flex rounded-full overflow-hidden h-2.5 mb-5 gap-0.5">
                {summary?.statusBreakdown.map(s => (
                  <div key={s.status} style={{
                    background: STATUS_COLORS[s.status] || "#9CA3AF",
                    width: `${(s.count / totalStatus) * 100}%`,
                  }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {summary?.statusBreakdown.map(s => (
                  <div key={s.status} className="bg-[var(--bg)] rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] || "#9CA3AF" }} />
                      <span className="font-sans text-[9px] font-semibold uppercase tracking-wider text-[var(--ink3)] leading-tight">
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </div>
                    <span className="font-sans font-semibold text-[24px] text-[var(--ink)] leading-none">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
