"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Loader2, Flame } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import type { CampaignRow } from "@/app/api/v1/campaigns/route";

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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/campaigns")
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = campaigns.reduce((s, c) => s + c.total, 0);

  return (
    <AppLayout title="Campaigns">
      <motion.div {...fadeUp(0)} className="mb-6">
        <p className="font-sans text-[13.5px] text-[var(--ink3)]">
          Real leads grouped by campaign tag, or by source when no campaign was set. Ad spend and click metrics require connecting Meta Ads — not wired up yet, so only lead-derived numbers are shown here.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 animate-spin text-[var(--purple)]" /></div>
      ) : campaigns.length === 0 ? (
        <GlassPanel className="flex flex-col items-center justify-center py-24 gap-3">
          <Megaphone className="w-8 h-8 text-[var(--ink3)]" />
          <p className="font-sans text-[14px] text-[var(--ink3)]">No leads yet — campaigns will appear once leads come in.</p>
        </GlassPanel>
      ) : (
        <motion.div {...fadeUp(0.08)}>
          <GlassPanel className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-[var(--hair)]">
                    {["CAMPAIGN / SOURCE", "LEADS", "SHARE", "HOT", "QUALIFIED", "QUALIFICATION RATE"].map((h, i) => (
                      <th key={h} className={`py-3.5 px-5 font-sans font-semibold text-[10px] uppercase tracking-wider text-[var(--ink3)] ${i > 0 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <motion.tr
                      key={c.name}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--bg)] transition-colors"
                    >
                      <td className="py-4 px-5">
                        <p className="font-sans font-semibold text-[13px] text-[var(--ink)]">{c.name}</p>
                        {c.isSource && <p className="font-sans text-[11px] text-[var(--ink3)] mt-0.5">No campaign tag — grouped by source</p>}
                      </td>
                      <td className="py-4 px-5 text-right font-sans font-semibold text-[13px] text-[var(--ink)]">{c.total}</td>
                      <td className="py-4 px-5 text-right font-sans text-[13px] text-[var(--ink2)]">
                        {totalLeads > 0 ? Math.round((c.total / totalLeads) * 100) : 0}%
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center gap-1 font-sans font-semibold text-[13px] text-[var(--ink)]">
                          <Flame className="w-3.5 h-3.5 text-[var(--st-active)]" />{c.hot}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-sans text-[13px] text-[var(--ink2)]">{c.qualified}</td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <span className="font-sans font-semibold text-[13px] text-[var(--ink)]">{c.qualificationRate}%</span>
                          <span className="w-16 h-1.5 rounded-full bg-[var(--bg)] overflow-hidden inline-block">
                            <span className="h-full block rounded-full bg-[var(--green)]" style={{ width: `${c.qualificationRate}%` }} />
                          </span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AppLayout>
  );
}
