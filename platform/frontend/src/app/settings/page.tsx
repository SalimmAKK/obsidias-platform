"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Trash2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import { ChannelIcon } from "@/components/LeadBadges";

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

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", sub: "Meta Cloud API" },
  { id: "instagram_dm", label: "Instagram DM", sub: "Meta Graph API" },
  { id: "email", label: "Email", sub: "SendGrid" },
];

export default function SettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dangerModalOpen, setDangerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/settings");
        const data = await res.json();
        setAgencyName(data.agencyName || "");
        setFullName(data.fullName || "");
        setEmail(data.email || "");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, fullName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
      addToast("Settings saved.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/v1/settings/delete-all-leads", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete leads");
      }
      addToast("All leads deleted.", "error");
      setDangerOpen(false);
    } catch (err: any) {
      addToast(err.message || "Failed to delete leads", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-[var(--purple)]" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="max-w-[740px] flex flex-col gap-6">

        {/* Agency Profile */}
        <motion.div {...fadeUp(0)}>
          <GlassPanel className="p-8">
            <h2 className="font-sans font-semibold text-[17px] text-[var(--ink)] mb-1">Agency Profile</h2>
            <p className="font-sans text-[13px] text-[var(--ink3)] mb-7">Your agency and account details.</p>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[var(--ink3)]">Agency Name</label>
                  <input type="text" className="input-field" value={agencyName} onChange={e => setAgencyName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[var(--ink3)]">Your Name</label>
                  <input type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[var(--ink3)]">Email Address</label>
                <input type="email" className="input-field opacity-60" value={email} disabled title="Change your email from your account provider" />
              </div>
              <div className="flex justify-end pt-2">
                <motion.button
                  type="submit" disabled={saving}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="premium-button flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </GlassPanel>
        </motion.div>

        {/* Channel connections */}
        <motion.div {...fadeUp(0.08)}>
          <GlassPanel className="p-8">
            <h2 className="font-sans font-semibold text-[17px] text-[var(--ink)] mb-1">Channel Connections</h2>
            <p className="font-sans text-[13px] text-[var(--ink3)] mb-7">
              Where leads are captured from. Automated capture and AI-driven replies are on the roadmap — for now leads can be added manually from the Dashboard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CHANNELS.map(ch => (
                <div key={ch.id} className="p-5 rounded-2xl shadow-[inset_0_0_0_1px_var(--hair)] bg-white flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center">
                    <ChannelIcon channel={ch.id} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-[14px] text-[var(--ink)]">{ch.label}</p>
                    <p className="font-sans text-[12px] text-[var(--ink3)]">{ch.sub}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[var(--rule)] text-[var(--ink3)] font-sans font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink3)]" /> Not connected
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        {/* Danger Zone */}
        <motion.div {...fadeUp(0.16)}>
          <div className="p-6 rounded-2xl border border-[var(--red)] bg-[var(--red-lt)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h3 className="font-sans font-semibold text-[14px] text-[var(--red)] mb-1">Danger Zone</h3>
              <p className="font-sans text-[13px] text-[var(--ink3)]">
                Permanently deletes every lead, conversation, and message for your agency. Cannot be undone.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="ghost-button flex items-center gap-2 shrink-0 !text-[var(--red)] !border-[var(--red)] hover:!bg-[var(--red)] hover:!text-white transition-all"
              onClick={() => setDangerOpen(true)}
            >
              <Trash2 className="w-4 h-4" /> Delete All Leads
            </motion.button>
          </div>
        </motion.div>

      </div>

      {/* Danger Modal */}
      <Modal isOpen={dangerModalOpen} onClose={() => setDangerOpen(false)} title="Confirm Deletion" maxWidth="max-w-[440px]">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-[var(--red-lt)] flex items-center justify-center"
          >
            <Trash2 className="w-7 h-7 text-[var(--red)]" />
          </motion.div>
          <p className="font-sans text-[14px] text-[var(--ink2)] leading-relaxed">
            All <strong>leads, conversations, messages, and score history</strong> for your agency will be permanently wiped.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--hair)]">
            <button className="ghost-button" onClick={() => setDangerOpen(false)} disabled={deleting}>Cancel</button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={deleting}
              className="premium-button !bg-[var(--red)] flex items-center gap-2"
              onClick={handleDeleteAll}
            >
              <Trash2 className="w-4 h-4" /> {deleting ? "Deleting…" : "Yes, Delete All"}
            </motion.button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
