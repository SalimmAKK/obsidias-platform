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
    <div className="flex min-h-screen bg-[var(--canvas)]">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[rgba(247,246,242,0.82)] backdrop-blur-xl shadow-[inset_0_-1px_0_var(--hair)] flex items-center justify-between px-8 h-[68px] shrink-0">
          <h1 className="font-sans font-bold text-[22px] text-[var(--ink)] tracking-[-0.03em]">
            {greeting ? `${timeOfDay}, ${displayName}` : title}
          </h1>
          <div className="flex items-center gap-3">
            <button className="ghost-button !py-2 !px-4 flex items-center gap-2 !text-[13px]">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <div className="flex items-center gap-2.5 pl-4 ml-1 shadow-[inset_1px_0_0_var(--hair)]">
              <div className="w-8 h-8 rounded-full bg-[var(--bone)] text-[var(--ink)] flex items-center justify-center text-[13px] font-bold shadow-[inset_0_0_0_1px_var(--hair-strong)] shrink-0">
                {initials}
              </div>
              <span className="font-sans font-semibold text-[13.5px] text-[var(--ink)]">{name || email || "Loading…"}</span>
            </div>
          </div>
        </header>

        {/* Page content.

            This previously wrapped every dashboard page in a 900ms
            opacity-0 fade. Two problems: `initial` is server-rendered as an
            inline style, so the entire app shipped invisible in raw HTML and
            stayed blank if the bundle was slow or failed; and 900ms is past
            the 700ms ceiling the motion system sets, which made every
            navigation feel like a load. Plain container now — the page is
            simply there. */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
