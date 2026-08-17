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

/* Status wears the RESERVED status scale, not chart-series colours — these
   mean good/warning/critical, and the skill's collision rule is that a thing
   which means good or bad wears status tokens and never doubles as "series
   4". Every pair here was contrast-checked as 11–12px text on its own tint,
   on paper, and on white; all clear 4.5:1. The label is always present, so
   identity is never carried by colour alone. */
const STATUS_STYLES: Record<LeadStatus, { pill: string; dot: string; label: string }> = {
  new:          { pill: "bg-[var(--st-active-bg)] text-[var(--st-active)]",     dot: "bg-[var(--st-active)]",   label: "New" },
  needs_review: { pill: "bg-[var(--st-warn-bg)] text-[var(--st-warn)]",         dot: "bg-[var(--st-warn)] animate-pulse", label: "Needs Review" },
  qualified:    { pill: "bg-[var(--st-good-bg)] text-[var(--st-good)]",         dot: "bg-[var(--st-good)]",     label: "Qualified" },
  nurturing:    { pill: "bg-[var(--st-neutral-bg)] text-[var(--st-neutral)]",   dot: "bg-[var(--st-neutral)]",  label: "Nurturing" },
  booked:       { pill: "bg-[var(--st-good-bg)] text-[var(--st-good)]",         dot: "bg-[var(--st-good)]",     label: "Booked" },
  archived:     { pill: "bg-[var(--st-neutral-bg)] text-[var(--st-neutral)]",   dot: "bg-[var(--st-neutral)]",  label: "Archived" },
  dead:         { pill: "bg-[var(--st-critical-bg)] text-[var(--st-critical)]", dot: "bg-[var(--st-critical)]", label: "Dead" },
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

/* Buckets are ordinal — hot > warm > cold — so intensity, not three
   unrelated hues, carries the order. Was a near-black plum chip with neon
   purple text (#2A1030/#C77DFF), a dark-theme component stranded in a light
   app since the original design. */
const BUCKET_STYLES: Record<LeadBucket, string> = {
  hot:  "bg-[var(--st-active-bg)] text-[var(--st-active)]",
  warm: "bg-[var(--st-warn-bg)] text-[var(--st-warn)]",
  cold: "bg-[var(--st-neutral-bg)] text-[var(--st-neutral)]",
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

/* Channel is nominal, and it always appears beside the channel's own name or
   in a labelled column — so the icon SHAPE already carries identity and the
   colour was doing no work. Five unrelated brand hues (emerald, sky, indigo,
   pink, gray) just fought the page. One recessive ink for all of them. */
export function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  const tone = "w-4 h-4 text-[var(--ink3)]";
  switch (channel) {
    case "whatsapp": return <WhatsAppIcon className={cn(tone, className)} />;
    case "sms": return <Phone className={cn(tone, className)} />;
    case "email": return <Mail className={cn(tone, className)} />;
    case "instagram_dm": return <InstagramIcon className={cn(tone, className)} />;
    default: return <MessageSquare className={cn(tone, className)} />;
  }
}
