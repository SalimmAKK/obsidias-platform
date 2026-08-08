import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "Awaiting Approval"
  | "Sent"
  | "Rejected"
  | "Processing"
  | "No Matches"
  | "Error";

interface StyleMap {
  dot: string;
  pill: string;
  label: string;
}

const STATUS_STYLES: Record<StatusType, StyleMap> = {
  "Awaiting Approval": {
    dot: "bg-[var(--purple)]",
    pill: "bg-[var(--purple-lt)] text-[var(--purple)]",
    label: "Awaiting Approval",
  },
  "Sent": {
    dot: "bg-[var(--green)]",
    pill: "bg-[var(--green-lt)] text-[var(--green)]",
    label: "Sent",
  },
  "Rejected": {
    dot: "bg-[var(--red)]",
    pill: "bg-[var(--red-lt)] text-[var(--red)]",
    label: "Rejected",
  },
  "No Matches": {
    dot: "bg-[var(--ink3)]",
    pill: "bg-[var(--rule)] text-[var(--ink3)]",
    label: "No Matches",
  },
  "Processing": {
    dot: "bg-[var(--yellow)] animate-pulse",
    pill: "bg-amber-50 text-amber-600",
    label: "Processing",
  },
  "Error": {
    dot: "bg-[var(--red)]",
    pill: "bg-[var(--red-lt)] text-[var(--red)]",
    label: "Error",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusType;
  className?: string;
}) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES["Error"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans font-medium text-[12px] whitespace-nowrap select-none",
        styles.pill,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
      {styles.label}
    </span>
  );
}
