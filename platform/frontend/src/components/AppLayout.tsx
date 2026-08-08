"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  greeting?: boolean;
}

function useCurrentAgent() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) setName(profile?.full_name || user.email || null);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { name, email };
}

export function AppLayout({ children, title, greeting = false }: AppLayoutProps) {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const { name, email } = useCurrentAgent();
  const displayName = name || "there";
  const initials = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[var(--rule)] flex items-center justify-between px-8 h-[64px] shrink-0">
          <h1 className="font-sans font-semibold text-[22px] text-[var(--ink)] tracking-tight">
            {greeting ? `${timeOfDay}, ${displayName}!` : title}
          </h1>
          <div className="flex items-center gap-3">
            <button className="ghost-button !py-2 !px-4 flex items-center gap-2 !text-[13px]">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--rule)]">
              <div className="w-8 h-8 rounded-full bg-[var(--purple-lt)] text-[var(--purple)] flex items-center justify-center text-[13px] font-semibold border border-[var(--rule)] shrink-0">
                {initials}
              </div>
              <span className="font-sans font-semibold text-[13.5px] text-[var(--ink)]">{name || email || "Loading…"}</span>
            </div>
          </div>
        </header>

        {/* Page content — fades in on every navigation */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
