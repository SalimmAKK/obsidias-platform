"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Download, ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { LeadStatusBadge, BucketBadge, ChannelIcon, CHANNEL_LABELS } from "@/components/LeadBadges";

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any, delay },
});

interface ApiLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  channel: string;
  capturedAt: string;
  status: string;
  bucket: string;
  score: number;
  confidence: number;
}

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "needs_review", label: "Needs Review" },
  { value: "qualified", label: "Qualified" },
  { value: "nurturing", label: "Nurturing" },
  { value: "booked", label: "Booked" },
  { value: "archived", label: "Archived" },
  { value: "dead", label: "Dead" },
];

const PAGE_SIZE = 20;

function toCsv(leads: ApiLead[]): string {
  const header = ["First Name", "Last Name", "Email", "Phone", "Source", "Channel", "Status", "Bucket", "Score", "Captured At"];
  const rows = leads.map(l => [
    l.firstName, l.lastName, l.email, l.phone, l.source,
    CHANNEL_LABELS[l.channel as keyof typeof CHANNEL_LABELS] || l.channel,
    l.status, l.bucket, String(l.score), l.capturedAt,
  ]);
  return [header, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function LeadsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [filter, debouncedSearch]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter, page: String(page), pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/v1/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [filter, page, debouncedSearch]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleExport = async () => {
    // Export the full filtered result set, not just the current page.
    const params = new URLSearchParams({ status: filter, page: "1", pageSize: "1000" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    const res = await fetch(`/api/v1/leads?${params.toString()}`);
    const data = await res.json();
    const csv = toCsv(data.leads ?? []);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppLayout title="Leads Database">

      {/* Controls */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
          <input
            type="text" placeholder="Search name, email…"
            className="input-field w-full pl-10 bg-white"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            className="input-field cursor-pointer appearance-none min-w-[190px] bg-white pr-10"
            value={filter} onChange={e => setFilter(e.target.value)}
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)] pointer-events-none" />
        </div>

        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          className="ghost-button flex items-center gap-2 bg-white sm:ml-auto"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" /> Export CSV
        </motion.button>
      </motion.div>

      {/* Table card */}
      <motion.div {...fadeUp(0.08)}>
        <GlassPanel className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--rule)]">
                  {["PROFILE", "CONTACT", "SOURCE", "CHANNEL", "DATE", "BUCKET", "STATUS", "SCORE"].map((h, i) => (
                    <th key={h} className={`py-3.5 px-5 font-sans font-semibold text-[10px] uppercase tracking-wider text-[var(--ink3)] ${i === 7 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--purple)] inline-block" />
                  </td></tr>
                )}
                {!loading && leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center font-sans text-[14px] text-[var(--ink3)]">
                      No leads match your search.
                    </td>
                  </tr>
                )}
                {!loading && leads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03, duration: 0.3, ease: "easeOut" }}
                    whileHover={{ backgroundColor: "var(--bg)" }}
                    className="border-b border-[var(--rule)] last:border-0 cursor-pointer transition-colors"
                    onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    <td className="py-4 px-5">
                      <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{lead.firstName} {lead.lastName}</span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-sans text-[13px] text-[var(--ink)]">{lead.email || "—"}</p>
                      <p className="font-sans text-[11px] text-[var(--ink3)] mt-0.5">{lead.phone || "—"}</p>
                    </td>
                    <td className="py-4 px-5 font-sans text-[13px] text-[var(--ink2)]">{lead.source}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <ChannelIcon channel={lead.channel} />
                        <span className="font-sans text-[12px] text-[var(--ink2)]">{CHANNEL_LABELS[lead.channel as keyof typeof CHANNEL_LABELS] || lead.channel}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-sans text-[13px] text-[var(--ink2)]">
                      {lead.capturedAt ? new Date(lead.capturedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="py-4 px-5"><BucketBadge bucket={lead.bucket} /></td>
                    <td className="py-4 px-5"><LeadStatusBadge status={lead.status} /></td>
                    <td className="py-4 px-5 text-right font-sans font-semibold text-[13px] text-[var(--ink)]">{lead.score || "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-[var(--rule)] px-5 py-3.5 flex items-center justify-between">
            <motion.button
              whileHover={{ x: -2 }} whileTap={{ scale: 0.96 }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 font-sans text-[13px] font-medium text-[var(--ink3)] hover:text-[var(--ink)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg)] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </motion.button>
            <span className="font-sans text-[13px] text-[var(--ink3)]">
              Page {page} of {totalPages} · {total} leads
            </span>
            <motion.button
              whileHover={{ x: 2 }} whileTap={{ scale: 0.96 }}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 font-sans text-[13px] font-medium text-[var(--ink3)] hover:text-[var(--ink)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg)] disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </GlassPanel>
      </motion.div>

    </AppLayout>
  );
}
