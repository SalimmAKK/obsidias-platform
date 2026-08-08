"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Inbox, MapPin, Building, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { StatusBadge, StatusType } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any, delay },
});

interface ApprovalJob {
  id: string;
  leadName: string;
  avatar: string;
  leadEmail: string;
  leadPhone: string;
  budget: string;
  location: string;
  propertyType: string;
  topMatchTitle: string;
  matchScore: number;
  submittedAt: string;
  status: StatusType;
  matches: { title: string; price: string; details: string; score: number; reason: string }[];
}

const MOCK_JOBS: ApprovalJob[] = [
  {
    id: "job-001", leadName: "Ahmad Al-Fahad", avatar: "https://i.pravatar.cc/150?img=11",
    leadEmail: "ahmad@example.com", leadPhone: "+966501112222", budget: "1,500,000 SAR",
    location: "Riyadh / Al-Malqa", propertyType: "Villa", topMatchTitle: "Modern Villa in Al-Malqa",
    matchScore: 92, submittedAt: "3 min ago", status: "Awaiting Approval",
    matches: [
      { title: "Modern Villa in Al-Malqa", price: "1,450,000 SAR", details: "Riyadh, 4 Bed, 5 Bath", score: 92, reason: "Matches budget and requested location perfectly." },
      { title: "Classic Villa",            price: "1,600,000 SAR", details: "Riyadh, 5 Bed, 4 Bath", score: 75, reason: "Slightly over budget but in preferred city." },
    ],
  },
  {
    id: "job-002", leadName: "Sarah Jones", avatar: "https://i.pravatar.cc/150?img=9",
    leadEmail: "sarah@example.com", leadPhone: "+971501234567", budget: "800,000 SAR",
    location: "Dubai / Downtown", propertyType: "Apartment", topMatchTitle: "Luxury Downtown Apartment",
    matchScore: 98, submittedAt: "1 hour ago", status: "Awaiting Approval",
    matches: [
      { title: "Luxury Downtown Apartment", price: "800,000 SAR", details: "Dubai, 2 Bed, 2 Bath", score: 98, reason: "Perfect match on location and budget." },
    ],
  },
];

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? "var(--green)" : score >= 60 ? "var(--purple)" : "var(--yellow)";
  const bg    = score >= 80 ? "var(--green-lt)" : score >= 60 ? "var(--purple-lt)" : "#FEF3C7";
  return (
    <span className="font-sans font-bold text-[12px] px-2.5 py-1 rounded-full" style={{ color, backgroundColor: bg }}>
      {score}% Match
    </span>
  );
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab]     = useState("Pending");
  const [jobs, setJobs]               = useState<ApprovalJob[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<ApprovalJob | null>(null);
  const { addToast } = useToast();

  const filteredJobs = jobs.filter(job =>
    activeTab === "All"     ? true
    : activeTab === "Pending" ? job.status === "Awaiting Approval"
    : job.status === activeTab
  );

  const handleAction = (id: string, action: "approve" | "reject", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: action === "approve" ? "Sent" : "Rejected" } : j));
    addToast(`Proposal ${action === "approve" ? "approved & sent" : "rejected"}`, action === "approve" ? "success" : "warning");
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const TABS = ["Pending", "Sent", "Rejected", "All"];

  return (
    <AppLayout title="Approvals">

      {/* Tab bar */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="inline-flex p-1 bg-white border border-[var(--rule)] rounded-xl shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-lg font-sans font-semibold text-[13px] transition-all ${
                activeTab === tab ? "text-[var(--purple)]" : "text-[var(--ink3)] hover:text-[var(--ink)]"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="approvals-tab"
                  className="absolute inset-0 bg-[var(--purple-lt)] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                />
              )}
              <span className="relative">{tab}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty state */}
      <AnimatePresence mode="wait">
        {filteredJobs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[20px] border border-[var(--rule)]"
          >
            <div className="w-16 h-16 bg-[var(--bg)] rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[var(--ink3)]" />
            </div>
            <h3 className="font-sans font-bold text-[18px] text-[var(--ink)] mb-1">You're all caught up!</h3>
            <p className="font-sans text-[14px] text-[var(--ink3)]">No items in this category.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                {...fadeUp(i * 0.06)}
                whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="saas-card p-6 cursor-pointer flex flex-col group relative"
                onClick={() => setSelectedJob(job)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <img src={job.avatar} alt={job.leadName} className="w-10 h-10 rounded-full object-cover border border-[var(--rule)]" />
                    <div>
                      <h4 className="font-sans font-bold text-[14px] text-[var(--ink)] leading-tight">{job.leadName}</h4>
                      <span className="font-sans text-[12px] text-[var(--ink3)]">{job.submittedAt}</span>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {/* Specs */}
                <div className="flex flex-col gap-2.5 mb-5 bg-[var(--bg)] p-4 rounded-xl">
                  {[
                    { Icon: DollarSign, value: job.budget },
                    { Icon: MapPin,     value: job.location },
                    { Icon: Building,   value: job.propertyType },
                  ].map(({ Icon, value }, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[13px] text-[var(--ink2)]">
                      <Icon className="w-4 h-4 text-[var(--ink3)] shrink-0" />
                      <span>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Top match */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-[var(--ink3)]">Top Match</span>
                    <ScorePill score={job.matchScore} />
                  </div>
                  <p className="font-sans font-semibold text-[13px] text-[var(--ink)] truncate">{job.topMatchTitle}</p>
                </div>

                {/* Hover quick-actions */}
                {job.status === "Awaiting Approval" && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={e => handleAction(job.id, "reject", e)}
                      className="w-9 h-9 rounded-full bg-white border border-[var(--rule)] shadow-sm flex items-center justify-center text-[var(--red)] hover:bg-[var(--red-lt)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={e => handleAction(job.id, "approve", e)}
                      className="w-9 h-9 rounded-full bg-[var(--green)] shadow-sm flex items-center justify-center text-white hover:bg-[#059669] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Proposal Review" maxWidth="max-w-[800px]">
        {selectedJob && (
          <div className="flex flex-col gap-7">
            {/* Lead info grid */}
            <div className="bg-[var(--bg)] rounded-2xl p-6 grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { label: "Client Name",    value: selectedJob.leadName     },
                { label: "Email",          value: selectedJob.leadEmail    },
                { label: "Phone",          value: selectedJob.leadPhone    },
                { label: "Budget",         value: selectedJob.budget       },
                { label: "Location",       value: selectedJob.location     },
                { label: "Property Type",  value: selectedJob.propertyType },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-[var(--ink3)]">{label}</span>
                  <span className="font-sans font-semibold text-[14px] text-[var(--ink)]">{value}</span>
                </div>
              ))}
            </div>

            {/* Matches */}
            <div>
              <h3 className="font-sans font-bold text-[17px] text-[var(--ink)] mb-4">Recommended Properties</h3>
              <div className="flex flex-col gap-4">
                {selectedJob.matches.map((match, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="p-5 border border-[var(--rule)] rounded-2xl flex flex-col md:flex-row gap-4 md:items-center"
                  >
                    <div className="w-20 h-20 bg-[var(--bg)] rounded-xl shrink-0 flex items-center justify-center border border-[var(--rule)]">
                      <ScorePill score={match.score} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-sans font-bold text-[15px] text-[var(--ink)]">{match.title}</h4>
                        <span className="font-sans font-bold text-[14px] text-[var(--purple)]">{match.price}</span>
                      </div>
                      <p className="font-sans text-[12px] text-[var(--ink2)] mb-3">{match.details}</p>
                      <div className="font-sans text-[12px] text-[var(--ink3)] p-3 bg-[var(--bg)] rounded-xl leading-relaxed">
                        <span className="font-bold text-[var(--ink)]">AI Note: </span>{match.reason}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer actions */}
            {selectedJob.status === "Awaiting Approval" && (
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--rule)]">
                <button
                  onClick={() => handleAction(selectedJob.id, "reject")}
                  className="ghost-button hover:!border-[var(--red)] hover:!text-[var(--red)] hover:!bg-[var(--red-lt)] transition-all"
                >
                  Reject
                </button>
                <Button onClick={() => handleAction(selectedJob.id, "approve")}>
                  Approve & Send Proposal
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </AppLayout>
  );
}
