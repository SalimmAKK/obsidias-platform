"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Loader2, Plus, Check, X, UserX, CalendarCheck2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { ChannelIcon } from "@/components/LeadBadges";

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any, delay },
});

interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadChannel: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  location: string;
  notes: string;
  calcomSynced: boolean;
}

interface LeadOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_TABS = [
  { value: "scheduled", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
  { value: "all", label: "All" },
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-[var(--purple-lt)] text-[var(--purple)]",
  completed: "bg-[var(--green-lt)] text-[var(--green)]",
  cancelled: "bg-[var(--rule)] text-[var(--ink3)]",
  no_show: "bg-[var(--red-lt)] text-[var(--red)]",
};

function ScheduleModal({ isOpen, onClose, onScheduled }: { isOpen: boolean; onClose: () => void; onScheduled: () => void }) {
  const { addToast } = useToast();
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [leadId, setLeadId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/v1/leads?pageSize=200")
      .then(r => r.json())
      .then(d => setLeads(d.leads || []));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !date || !time) return;
    setSaving(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, scheduledAt, location, notes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to schedule");
      }
      const result = await res.json().catch(() => ({}));
      if (result.calcomWarning) {
        addToast(result.calcomWarning, "warning");
      } else {
        addToast("Viewing scheduled.", "success");
      }
      setLeadId(""); setDate(""); setTime(""); setLocation(""); setNotes("");
      onScheduled();
      onClose();
    } catch (err: any) {
      addToast(err.message || "Failed to schedule viewing", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Viewing" maxWidth="max-w-[480px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Lead</label>
          <select required className="input-field" value={leadId} onChange={e => setLeadId(e.target.value)}>
            <option value="">Select a lead…</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Date</label>
            <input required type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Time</label>
            <input required type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Location</label>
          <input className="input-field" placeholder="Property address" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Notes</label>
          <textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          <Button type="submit" disabled={saving}>{saving ? "Scheduling…" : "Schedule Viewing"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AppointmentsPage() {
  const { addToast } = useToast();
  const [tab, setTab] = useState("scheduled");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/appointments?status=${tab}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      addToast("Appointment updated.", "success");
      fetchAppointments();
    } catch {
      addToast("Failed to update appointment.", "error");
    }
  };

  return (
    <AppLayout title="Appointments">
      <ScheduleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onScheduled={fetchAppointments} />

      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="inline-flex p-1 bg-white border border-[var(--rule)] rounded-xl shadow-sm">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-lg font-sans font-semibold text-[13px] transition-all ${tab === t.value ? "bg-[var(--purple-lt)] text-[var(--purple)]" : "text-[var(--ink3)] hover:text-[var(--ink)]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="premium-button flex items-center gap-2 !py-2.5 !px-5" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Schedule Viewing
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <GlassPanel className="p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 animate-spin text-[var(--purple)]" /></div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Calendar className="w-8 h-8 text-[var(--ink3)]" />
              <p className="font-sans text-[14px] text-[var(--ink3)]">No {tab !== "all" ? tab.replace("_", " ") : ""} appointments.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--rule)]">
              {appointments.map((a, i) => {
                const dt = new Date(a.scheduledAt);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-5 px-6 py-4 hover:bg-[var(--bg)] transition-colors"
                  >
                    <div className="w-14 shrink-0 text-center">
                      <p className="font-sans font-semibold text-[18px] text-[var(--ink)] leading-none">{dt.getDate()}</p>
                      <p className="font-sans font-semibold text-[10px] uppercase text-[var(--ink3)] mt-1">{dt.toLocaleDateString("en-US", { month: "short" })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-sans font-semibold text-[14px] text-[var(--ink)]">{a.leadName}</p>
                        <ChannelIcon channel={a.leadChannel} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-[var(--ink3)] font-sans flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</span>}
                      </div>
                    </div>
                    {a.calcomSynced && (
                      <span title="Synced to Cal.com" className="shrink-0 text-[var(--green)]">
                        <CalendarCheck2 className="w-4 h-4" />
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full font-sans font-semibold text-[11px] shrink-0 ${STATUS_STYLES[a.status]}`}>
                      {a.status.replace("_", " ")}
                    </span>
                    {a.status === "scheduled" && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button title="Mark completed" onClick={() => updateStatus(a.id, "completed")} className="w-8 h-8 rounded-lg border border-[var(--rule)] flex items-center justify-center text-[var(--green)] hover:bg-[var(--green-lt)] transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button title="No show" onClick={() => updateStatus(a.id, "no_show")} className="w-8 h-8 rounded-lg border border-[var(--rule)] flex items-center justify-center text-[var(--red)] hover:bg-[var(--red-lt)] transition-colors">
                          <UserX className="w-4 h-4" />
                        </button>
                        <button title="Cancel" onClick={() => updateStatus(a.id, "cancelled")} className="w-8 h-8 rounded-lg border border-[var(--rule)] flex items-center justify-center text-[var(--ink3)] hover:bg-[var(--rule)] transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </AppLayout>
  );
}
