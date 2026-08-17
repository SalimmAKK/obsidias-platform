"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { LeadStatusBadge, BucketBadge, ChannelIcon, CHANNEL_LABELS } from "@/components/LeadBadges";
import { useToast } from "@/components/ToastProvider";
import { SERIES_1 } from "@/lib/vizColors";

interface LeadDetail {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  source: string; channel: string; status: string; bucket: string; score: number; confidence: number;
  bant: { budget: string; authority: string; need: string; timeline: string };
  qualificationNotes: string; disqualifyReason: string | null; capturedAt: string;
}

interface Message {
  id: string; direction: "inbound" | "outbound"; content: string; isAi: boolean; isHuman: boolean; createdAt: string;
}

interface DetailResponse {
  lead: LeadDetail;
  conversation: { id: string; status: string; channel: string; lastMessageAt: string } | null;
  messages: Message[];
  scoreHistory: { score: number; recordedAt: string }[];
  activities: { type: string; metadata: any; createdAt: string }[];
}

const BANT_LABELS: Record<string, string> = { budget: "Budget", authority: "Authority", need: "Need", timeline: "Timeline" };

function bantTone(value: string): string {
  if (["high", "strong", "immediate", "true"].includes(value)) return "text-[var(--green)] bg-[var(--green-lt)]";
  if (["medium", "moderate", "3months"].includes(value)) return "text-[var(--st-warn)] bg-[var(--st-warn-bg)]";
  if (["low", "weak"].includes(value)) return "text-[var(--red)] bg-[var(--red-lt)]";
  return "text-[var(--ink3)] bg-[var(--rule)]";
}

function bantDisplay(value: string): string {
  const map: Record<string, string> = { true: "Yes", false: "No", "3months": "3 months", "6months": "6 months", immediate: "Immediate", unknown: "Unknown" };
  return map[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/leads/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleQualify = async () => {
    setActing(true);
    try {
      await fetch(`/api/v1/leads/${id}/qualify`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "qualified", overriddenByHuman: true }),
      });
      addToast("Lead qualified.", "success");
      await load();
    } finally {
      setActing(false);
    }
  };

  const handleDisqualify = async () => {
    setActing(true);
    try {
      await fetch(`/api/v1/leads/${id}/disqualify`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived", disqualifyReason: "Manually disqualified from lead detail", overriddenByHuman: true }),
      });
      addToast("Lead disqualified.", "warning");
      await load();
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Lead Detail">
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-[var(--purple)]" /></div>
      </AppLayout>
    );
  }

  if (notFound || !data) {
    return (
      <AppLayout title="Lead Detail">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="font-sans text-[15px] text-[var(--ink3)]">Lead not found.</p>
          <button className="ghost-button" onClick={() => router.push("/leads")}>Back to Leads</button>
        </div>
      </AppLayout>
    );
  }

  const { lead, conversation, messages, scoreHistory, activities } = data;
  const chartData = scoreHistory.map(s => ({
    date: new Date(s.recordedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    score: s.score,
  }));

  return (
    <AppLayout title="Lead Detail">
      <button onClick={() => router.push("/leads")} className="flex items-center gap-1.5 text-[13px] font-sans font-medium text-[var(--ink3)] hover:text-[var(--ink)] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      {/* Header */}
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="saas-card p-6 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="font-sans font-semibold text-[20px] text-[var(--ink)]">{lead.firstName} {lead.lastName}</h2>
            <BucketBadge bucket={lead.bucket} />
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[var(--ink3)] font-sans">
            <span className="flex items-center gap-1.5"><ChannelIcon channel={lead.channel} />{CHANNEL_LABELS[lead.channel as keyof typeof CHANNEL_LABELS] || lead.channel}</span>
            <span>·</span>
            <span>{lead.source}</span>
            <span>·</span>
            <span>Captured {lead.capturedAt ? new Date(lead.capturedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
          </div>
        </div>
        {lead.status === "needs_review" && (
          <div className="flex items-center gap-2">
            <button onClick={handleDisqualify} disabled={acting} className="ghost-button flex items-center gap-2 hover:!border-[var(--red)] hover:!text-[var(--red)]">
              <XCircle className="w-4 h-4" /> Disqualify
            </button>
            <button onClick={handleQualify} disabled={acting} className="premium-button flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Qualify
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: BANT + notes + score history */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="saas-card p-6">
            <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-4">BANT Qualification</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {Object.entries(lead.bant).map(([key, value]) => (
                <div key={key} className="bg-[var(--bg)] rounded-2xl p-4">
                  <p className="font-sans font-semibold text-[9px] uppercase tracking-wider text-[var(--ink3)] mb-2">{BANT_LABELS[key]}</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full font-sans font-semibold text-[12px] ${bantTone(value)}`}>{bantDisplay(value)}</span>
                </div>
              ))}
            </div>
            {lead.qualificationNotes && (
              <div className="p-4 rounded-xl bg-[var(--bg)] shadow-[inset_0_0_0_1px_var(--hair)]">
                <p className="font-sans font-semibold text-[10px] uppercase tracking-wider text-[var(--ink3)] mb-1.5">AI Qualification Notes</p>
                <p className="font-sans text-[13px] text-[var(--ink2)] leading-relaxed">{lead.qualificationNotes}</p>
              </div>
            )}
            {lead.disqualifyReason && (
              <div className="mt-3 p-4 rounded-xl bg-[var(--red-lt)] border border-[var(--red)]/20">
                <p className="font-sans font-semibold text-[10px] uppercase tracking-wider text-[var(--red)] mb-1.5">Disqualify Reason</p>
                <p className="font-sans text-[13px] text-[var(--ink2)]">{lead.disqualifyReason}</p>
              </div>
            )}
          </motion.div>

          {chartData.length > 0 && (
            <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="saas-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)]">Score History</h3>
                <span className="font-sans font-semibold text-[24px] text-[var(--ink)]">{lead.score}</span>
              </div>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--ink3)", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--ink3)", fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke={SERIES_1} strokeWidth={2.5} dot={{ r: 3, fill: SERIES_1 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Conversation timeline */}
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="saas-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--ink3)]" /> Conversation
              </h3>
              {conversation && (
                <button className="text-[12px] font-semibold text-[var(--purple)] hover:underline" onClick={() => router.push("/conversations")}>
                  Open in Inbox
                </button>
              )}
            </div>
            {!conversation || messages.length === 0 ? (
              <p className="text-[13px] text-[var(--ink3)] font-sans">No conversation started yet.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {messages.map(m => {
                  const isOut = m.direction === "outbound";
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[80%] ${isOut ? "self-end items-end" : "self-start items-start"}`}>
                      <div className={`text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl ${isOut ? "bg-[var(--purple)] text-white" : "bg-[var(--bg)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hair)]"}`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-[var(--ink3)] mt-1 font-sans">
                        {m.isAi ? "AI · " : m.isHuman ? "Human · " : ""}{new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: contact + activity log */}
        <div className="flex flex-col gap-5">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="saas-card p-6">
            <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-4">Contact Info</h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-sans font-semibold text-[9px] uppercase tracking-wider text-[var(--ink3)] mb-1">Email</p>
                <p className="font-sans text-[13px] text-[var(--ink)]">{lead.email || "—"}</p>
              </div>
              <div>
                <p className="font-sans font-semibold text-[9px] uppercase tracking-wider text-[var(--ink3)] mb-1">Phone</p>
                <p className="font-sans text-[13px] text-[var(--ink)]">{lead.phone || "—"}</p>
              </div>
              <div>
                <p className="font-sans font-semibold text-[9px] uppercase tracking-wider text-[var(--ink3)] mb-1">Confidence</p>
                <p className="font-sans text-[13px] text-[var(--ink)]">{Math.round(lead.confidence * 100)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="saas-card p-6">
            <h3 className="font-sans font-semibold text-[15px] text-[var(--ink)] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--ink3)]" /> Activity Log
            </h3>
            {activities.length === 0 ? (
              <p className="text-[13px] text-[var(--ink3)] font-sans">No activity recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {activities.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--purple)] mt-1.5 shrink-0" />
                    <div>
                      <p className="font-sans text-[13px] text-[var(--ink)] font-medium">{a.type.replace(/_/g, " ")}</p>
                      <p className="font-sans text-[11px] text-[var(--ink3)]">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
