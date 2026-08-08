import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "premium" | "ghost";
  fullWidth?: boolean;
}

export function Button({ 
  className, 
  variant = "premium", 
  fullWidth = false, 
  children, 
  ...props 
}: ButtonProps) {
  
  if (variant === "ghost") {
    return (
      <button 
        className={cn("ghost-button", fullWidth && "w-full", className)}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button 
      className={cn("premium-button", fullWidth && "w-full", className)}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}
