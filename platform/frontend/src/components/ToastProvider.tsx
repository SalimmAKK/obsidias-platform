"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CONFIG: Record<ToastType, { icon: React.ElementType; accent: string; bg: string; text: string }> = {
  success: { icon: CheckCircle,  accent: "var(--green)",  bg: "var(--green-lt)", text: "var(--green)" },
  error:   { icon: AlertCircle,  accent: "var(--red)",    bg: "var(--red-lt)",   text: "var(--red)" },
  warning: { icon: Info,         accent: "var(--amber)",  bg: "var(--amber-lt)", text: "var(--amber)" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      const updated = [...prev, { id, type, message }];
      return updated.length > 4 ? updated.slice(1) : updated;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3" aria-live="polite">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className="saas-card min-w-[300px] max-w-[420px] py-4 px-5 flex items-start gap-3 relative overflow-hidden"
              style={{ animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {/* Accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]" style={{ backgroundColor: config.accent }} />

              <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: config.bg }}>
                <Icon className="w-4 h-4" style={{ color: config.accent }} />
              </div>

              <p className="font-sans text-[13px] font-medium text-[var(--ink)] m-0 leading-snug pt-2 flex-1">
                {toast.message}
              </p>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--ink3)] hover:bg-[var(--bg)] transition-colors mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
