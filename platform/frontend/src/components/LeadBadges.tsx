import React from "react";
import { MessageSquare, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

// Lead-gen/BANT status + bucket + channel vocabulary, shared across
// Dashboard, Leads table, and Lead Detail. Distinct from the legacy
// StatusBadge (Awaiting Approval/Sent/Rejected/...), which belongs to the
// spreadsheet/property-matching flow.

export type LeadStatus = "new" | "needs_review" | "qualified" | "nurturing" | "booked" | "archived" | "dead";
export type LeadBucket = "hot" | "warm" | "cold";
export type LeadChannel = "sms" | "whatsapp" | "email" | "instagram_dm";

const STATUS_STYLES: Record<LeadStatus, { pill: string; dot: string; label: string }> = {
  new:          { pill: "bg-[var(--purple-lt)] text-[var(--purple)]", dot: "bg-[var(--purple)]", label: "New" },
  needs_review: { pill: "bg-amber-50 text-amber-600",                  dot: "bg-amber-500 animate-pulse", label: "Needs Review" },
  qualified:    { pill: "bg-[var(--green-lt)] text-[var(--green)]",   dot: "bg-[var(--green)]", label: "Qualified" },
  nurturing:    { pill: "bg-sky-50 text-sky-600",                      dot: "bg-sky-500", label: "Nurturing" },
  booked:       { pill: "bg-[var(--green-lt)] text-[var(--green)]",   dot: "bg-[var(--green)]", label: "Booked" },
  archived:     { pill: "bg-[var(--rule)] text-[var(--ink3)]",        dot: "bg-[var(--ink3)]", label: "Archived" },
  dead:         { pill: "bg-[var(--red-lt)] text-[var(--red)]",       dot: "bg-[var(--red)]", label: "Dead" },
};

export function LeadStatusBadge({ status, className }: { status: string; className?: string }) {
  const styles = STATUS_STYLES[status as LeadStatus] ?? STATUS_STYLES.new;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans font-medium text-[12px] whitespace-nowrap select-none",
      styles.pill, className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
      {styles.label}
    </span>
  );
}

const BUCKET_STYLES: Record<LeadBucket, string> = {
  hot:  "bg-[#2A1030] text-[#C77DFF]",
  warm: "bg-[var(--green-lt)] text-[var(--green)]",
  cold: "bg-[var(--rule)] text-[var(--ink3)]",
};

export function BucketBadge({ bucket, className }: { bucket: string; className?: string }) {
  const style = BUCKET_STYLES[bucket as LeadBucket] ?? BUCKET_STYLES.cold;
  const label = bucket.charAt(0).toUpperCase() + bucket.slice(1);
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full font-sans font-semibold text-[11px] whitespace-nowrap select-none", style, className)}>
      {label}
    </span>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.448L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.976C16.608 1.906 14.133.882 11.5.882 6.063.882 1.64 5.304 1.636 10.743c-.002 1.702.447 3.368 1.3 4.802l-1.001 3.655 3.712-.974z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export const CHANNEL_LABELS: Record<LeadChannel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  instagram_dm: "Instagram DM",
};

export function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  switch (channel) {
    case "whatsapp": return <WhatsAppIcon className={cn("w-4 h-4 text-emerald-500", className)} />;
    case "sms": return <Phone className={cn("w-4 h-4 text-sky-500", className)} />;
    case "email": return <Mail className={cn("w-4 h-4 text-indigo-500", className)} />;
    case "instagram_dm": return <InstagramIcon className={cn("w-4 h-4 text-pink-500", className)} />;
    default: return <MessageSquare className={cn("w-4 h-4 text-gray-400", className)} />;
  }
}
