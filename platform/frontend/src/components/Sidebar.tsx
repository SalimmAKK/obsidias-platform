"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Settings, LogOut,
  Search, Zap, Hexagon, ChevronRight, MessageSquare,
  CalendarClock, Megaphone, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <i 
      className={cn("ti ti-checkbox", className)} 
      style={{ fontSize: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }} 
    />
  );
}

const SETTINGS_NAV = [
  { label: "Settings",   href: "/settings",   icon: Settings },
];

function NavItem({ href, icon: Icon, label, badge, isWarningBadge }: {
  href: string; icon: React.ElementType; label: string; badge?: number; isWarningBadge?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 3 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors text-[13.5px] font-medium",
          isActive
            ? "bg-[var(--accent-soft)] text-[var(--accent-deep)] font-semibold"
            : "text-[var(--ink2)] hover:bg-[var(--core)] hover:text-[var(--ink)]"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--ink4)]")} />
        <span className="flex-1 leading-none">{label}</span>
        {badge ? (
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none",
            isWarningBadge
              ? "bg-[var(--bg-warning)] text-[var(--text-warning)]"
              : isActive
                ? "bg-[var(--purple)] text-white"
                : "bg-[var(--sunk)] text-[var(--ink2)]"
          )}>
            {badge}
          </span>
        ) : isActive ? (
          <ChevronRight className="w-3 h-3 text-[var(--accent)] opacity-60" />
        ) : null}
      </motion.div>
    </Link>
  );
}

function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <motion.button
      whileHover={{ x: 3 }}
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors text-[13.5px] font-medium text-[var(--ink2)] hover:bg-[var(--core)] hover:text-[var(--ink)] disabled:opacity-50"
    >
      <LogOut className="w-4 h-4 shrink-0 text-[var(--ink3)]" />
      <span className="flex-1 leading-none text-left">{signingOut ? "Signing out…" : "Sign Out"}</span>
    </motion.button>
  );
}

function usePolledCount(url: string, intervalMs = 60000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const res = await fetch(url);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch (err) {
        console.error(`Failed to fetch count from ${url}:`, err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, intervalMs);
    return () => { cancelled = true; clearInterval(interval); };
  }, [url, intervalMs]);

  return count;
}

export function Sidebar() {
  const [search, setSearch] = useState("");
  const reviewCount = usePolledCount("/api/v1/leads/review-count");
  const unreadCount = usePolledCount("/api/v1/conversations/unread-count");

  const mainNavItems = [
    { label: "Dashboard",      href: "/dashboard",      icon: LayoutDashboard },
    { label: "Inbox",          href: "/conversations",  icon: MessageSquare,   badge: unreadCount },
    { label: "Leads",          href: "/leads",          icon: Users },
    { label: "Review",         href: "/review",         icon: CheckboxIcon,    badge: reviewCount, isWarningBadge: true },
    { label: "Appointments",   href: "/appointments",   icon: CalendarClock },
    { label: "Campaigns",      href: "/campaigns",      icon: Megaphone },
    { label: "Analytics",      href: "/analytics",      icon: BarChart3 },
  ];

  return (
    <aside className="w-[248px] shrink-0 sticky top-0 h-screen flex flex-col bg-[var(--shell)] shadow-[inset_-1px_0_0_var(--hair)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[68px] shrink-0">
        <div className="w-8 h-8 rounded-[10px] bg-[var(--accent)] flex items-center justify-center shrink-0">
          <Hexagon className="w-4 h-4 text-white" />
        </div>
        <span className="font-sans font-bold text-[16px] text-[var(--ink)] tracking-[-0.02em]">Obsidias</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink3)]" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 bg-[var(--core)] rounded-[10px] text-[13px] text-[var(--ink)] placeholder:text-[var(--ink4)] shadow-[inset_0_0_0_1px_var(--hair)] focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_3px_var(--accent-soft)] transition-shadow"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[var(--ink4)] bg-[var(--sunk)] px-1.5 py-0.5 rounded-md font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-0.5">
        <p className="meta-label px-3 py-2">Main Menu</p>
        {mainNavItems.map(item => <NavItem key={item.href} {...item} />)}

        <div className="my-3 h-px bg-[var(--hair)] mx-2" />

        <p className="meta-label px-3 py-2">Settings</p>
        {SETTINGS_NAV.map(item => <NavItem key={item.href} {...item} />)}
        <SignOutButton />
      </nav>

      {/* Bottom promo */}
      <div className="p-3 shrink-0">
        <div
          className="rounded-[20px] p-4 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #C1662E 0%, #E8A96C 100%)" }}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full bg-white/10" />
          <div className="w-8 h-8 rounded-[10px] bg-white/20 flex items-center justify-center mb-3 relative">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="font-sans font-semibold text-[13px] mb-1 relative">Stay on top of review</p>
          <p className="font-sans text-[11px] text-white/70 mb-3 leading-relaxed relative">
            Leads below the AI confidence threshold are waiting on you
          </p>
          <Link href="/review" className="w-full block text-center bg-white text-[var(--accent-deep)] rounded-full py-2 text-[12px] font-semibold hover:bg-white/90 transition-colors relative">
            Go to Review Queue
          </Link>
        </div>
      </div>
    </aside>
  );
}
