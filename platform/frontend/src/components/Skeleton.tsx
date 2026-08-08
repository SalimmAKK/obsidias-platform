import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
}

export function Skeleton({ className, rows = 1, ...props }: SkeletonProps) {
  if (rows > 1) {
    return (
      <div className="w-full flex flex-col gap-4" aria-busy="true" {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-12 w-full bg-white/5 rounded-lg animate-shimmer",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      className={cn("h-full w-full bg-white/5 rounded-lg animate-shimmer", className)}
      {...props}
    />
  );
}
