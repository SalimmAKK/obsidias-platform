import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassPanel({ className, children, ...props }: GlassPanelProps) {
  return (
    <div 
      className={cn("saas-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}
