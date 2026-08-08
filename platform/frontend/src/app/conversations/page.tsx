"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Mail, Phone, Send, ShieldAlert, 
  ExternalLink, User, CheckCircle2, ChevronRight, Loader2 
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { useToast } from "@/components/ToastProvider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// Custom WhatsApp SVG Icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.448L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.976C16.608 1.906 14.133.882 11.5.882 6.063.882 1.64 5.304 1.636 10.743c-.002 1.702.447 3.368 1.3 4.802l-1.001 3.655 3.712-.974zm13.123-7.915c-.198-.1-.198-.1-.79-.395-.594-.296-1.482-.73-1.68-.83-.197-.1-.34-.148-.485.07-.145.218-.56.702-.686.849-.126.147-.253.165-.452.065-.198-.1-.837-.308-1.595-.983-.589-.525-.987-1.173-1.103-1.37-.116-.197-.012-.304.087-.402.09-.089.197-.23.296-.346.1-.115.133-.197.2-.329.065-.13.032-.246-.016-.346-.049-.1-.485-1.17-.664-1.602-.175-.421-.347-.363-.485-.37-.126-.007-.27-.008-.414-.008-.145 0-.38.054-.579.273-.197.218-.755.738-.755 1.8 0 1.062.773 2.087.88 2.235.109.148 1.522 2.325 3.687 3.259.515.223.917.355 1.23.454.517.164.988.14 1.36.085.414-.06 1.266-.518 1.444-1.02.178-.499.178-.928.125-1.019-.053-.1-.197-.15-.395-.25z"/>
    </svg>
  );
}

// Custom Instagram SVG Icon
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Conversation data shapes
interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  sentAt: string;
  isAi: boolean;
  isHuman: boolean;
  channel: string;
}

interface Thread {
  id: string;
  leadId: string;
  leadName: string;
  leadInitials: string;
  score: number;
  bucket: "hot" | "warm" | "cold";
  status: "ai" | "human";
  channel: "whatsapp" | "sms" | "email" | "instagram_dm";
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  avatarBg?: string;
  avatarColor?: string;
}

// Channel display helpers
const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  instagram_dm: "Instagram DM",
};

function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  switch (channel) {
    case "whatsapp":
      return <WhatsAppIcon className={cn("w-4 h-4 text-emerald-500", className)} />;
    case "sms":
      return <Phone className={cn("w-4 h-4 text-sky-500", className)} />;
    case "email":
      return <Mail className={cn("w-4 h-4 text-indigo-500", className)} />;
    case "instagram_dm":
      return <InstagramIcon className={cn("w-4 h-4 text-pink-500", className)} />;
    default:
      return <MessageSquare className={cn("w-4 h-4 text-gray-400", className)} />;
  }
}

export default function ConversationsPage() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<"all" | "ai" | "human" | "hot">("all");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [sending, setSending] = useState(false);

  const activeThread = threads.find(t => t.id === activeId) || null;
  const msgListRef = useRef<HTMLDivElement>(null);

  // Fetch threads list
  const fetchThreads = async (currentFilter = filter) => {
    try {
      let url = "/api/v1/conversations";
      const params: string[] = [];
      if (currentFilter === "ai") params.push("status=ai");
      if (currentFilter === "human") params.push("status=human");
      if (currentFilter === "hot") params.push("bucket=hot");
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load threads");
      const data = await res.json();
      setThreads(data);
      
      // Auto select first thread if none active
      if (data.length > 0 && !activeId) {
        setActiveId(data[0].id);
      }
    } catch (err: any) {
      addToast(err.message || "Could not retrieve threads", "error");
    } finally {
      setLoadingThreads(false);
    }
  };

  // Fetch active message thread
  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/v1/conversations/${id}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      addToast(err.message || "Could not retrieve messages", "error");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Mark thread as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/conversations/${id}/read`, { method: "PATCH" });
      setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  // Switch controlling status (Take over / Return to AI)
  const handleToggleStatus = async () => {
    if (!activeThread) return;
    const targetStatus = activeThread.status === "ai" ? "human" : "ai";
    
    // Optimistic UI update
    setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, status: targetStatus } : t));
    addToast(
      targetStatus === "human" ? "Conversation hijacked by agent." : "Conversation returned to AI pilot.",
      "success"
    );

    try {
      const res = await fetch(`/api/v1/conversations/${activeThread.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      // Revert on error
      setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, status: activeThread.status } : t));
      addToast("Failed to switch agent control.", "error");
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!activeThread || !composeText.trim() || sending) return;
    const content = composeText.trim();
    setComposeText("");
    setSending(true);

    const now = new Date();
    const sentAt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    // Optimistic local update
    const tempId = `temp_${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      direction: "outbound",
      content,
      sentAt,
      isAi: false,
      isHuman: true,
      channel: activeThread.channel
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, lastMessage: content, lastMessageAt: "just now" } : t));

    try {
      const res = await fetch(`/api/v1/conversations/${activeThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, direction: "outbound", isHuman: true }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const realMsg = await res.json();
      
      // Update with database message
      setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
      // Refresh thread list preview
      fetchThreads();
    } catch (err) {
      addToast("Failed to deliver message.", "error");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Real-time listener
  useEffect(() => {
    // Subscribe to messages table Realtime insert event
    const channel = supabase
      .channel("public-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          // If new inbound message belongs to the currently active conversation
          if (newMsg.conversation_id === activeId) {
            const mappedMsg: Message = {
              id: newMsg.id,
              direction: newMsg.direction,
              content: newMsg.content,
              sentAt: new Date(newMsg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              isAi: !!newMsg.is_ai,
              isHuman: !!newMsg.is_human,
              channel: newMsg.channel || activeThread?.channel || "whatsapp",
            };
            setMessages(prev => [...prev, mappedMsg]);
            markAsRead(newMsg.conversation_id);
          } else {
            // Otherwise increment unread count/dot on relevant thread row
            setThreads(prev => prev.map(t => 
              t.id === newMsg.conversation_id 
                ? { ...t, unread: true, lastMessage: newMsg.content, lastMessageAt: "just now" } 
                : t
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, activeThread]);

  // Initial fetch and filter change
  useEffect(() => {
    fetchThreads(filter);
  }, [filter]);

  // Load message list when selection changes
  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
      markAsRead(activeId);
    }
  }, [activeId]);

  // Auto Scroll
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppLayout title="Conversation Inbox">
      
      <div 
        style={{ 
          height: "calc(100vh - 160px)", 
          display: "grid", 
          gridTemplateColumns: "280px 1fr",
          border: "0.5px solid var(--rule)",
          borderRadius: "20px",
          overflow: "hidden",
          background: "var(--card)",
        }}
      >
        
        {/* ── LEFT: Thread List ── */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "0.5px solid var(--rule)", background: "var(--card)", height: "100%" }}>
          
          {/* Header + Filters */}
          <div style={{ padding: "16px", borderBottom: "0.5px solid var(--rule)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)", marginBottom: "12px" }}>Conversations</h2>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {([ 
                { id: "all", label: "All" },
                { id: "ai", label: "AI active" },
                { id: "human", label: "Human" },
                { id: "hot", label: "Hot" }
              ] as const).map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id as any)}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "20px",
                    border: filter === c.id ? "1px solid var(--purple)" : "0.5px solid var(--rule)",
                    background: filter === c.id ? "var(--purple)" : "var(--bg)",
                    color: filter === c.id ? "var(--card)" : "var(--ink2)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thread rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingThreads ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px" }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--purple)" }} />
                <span style={{ fontSize: "12px", color: "var(--ink3)" }}>Loading threads…</span>
              </div>
            ) : threads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", fontSize: "13px", color: "var(--ink3)" }}>
                No active threads found.
              </div>
            ) : (
              threads.map(t => {
                const active = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "12px 14px",
                      cursor: "pointer",
                      alignItems: "flex-start",
                      borderBottom: "0.5px solid var(--rule)",
                      borderLeft: active ? "3px solid var(--purple)" : "3px solid transparent",
                      background: active ? "var(--purple-lt)" : "transparent",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 600,
                      backgroundColor: t.avatarBg || "var(--purple-lt)",
                      color: t.avatarColor || "var(--purple)",
                    }}>
                      {t.leadInitials}
                    </div>
                    
                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: t.unread ? 800 : 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>
                          {t.leadName}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--ink3)", flexShrink: 0 }}>{t.lastMessageAt}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: t.unread ? "var(--ink)" : "var(--ink2)", fontWeight: t.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "6px" }}>
                        {t.lastMessage}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                        {/* Status badge */}
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600, background: t.status === "ai" ? "var(--purple-lt)" : "var(--red-lt)", color: t.status === "ai" ? "var(--purple)" : "var(--red)" }}>
                          {t.status === "ai" ? "AI" : "Human"}
                        </span>
                        {/* Bucket badge */}
                        <span style={{
                          fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600,
                          background: t.bucket === "hot" ? "#2A1030" : t.bucket === "warm" ? "var(--green-lt)" : "var(--rule)",
                          color: t.bucket === "hot" ? "#C77DFF" : t.bucket === "warm" ? "var(--green)" : "var(--ink2)",
                        }}>
                          {t.bucket.charAt(0).toUpperCase() + t.bucket.slice(1)}
                        </span>
                        <ChannelIcon channel={t.channel} />
                        {t.unread && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--purple)", marginLeft: "auto" }} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Conversation Detail ── */}
        <div style={{ display: "flex", flexDirection: "column", background: "var(--card2)", height: "100%" }}>
          {activeThread ? (
            <>
              {/* Header bar with gradient tint */}
              <div style={{
                padding: "14px 16px",
                borderBottom: "0.5px solid var(--rule)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
                background: activeThread.bucket === "hot"
                  ? "linear-gradient(90deg, rgba(91,79,245,0.08) 0%, var(--card) 60%)"
                  : activeThread.bucket === "warm"
                  ? "linear-gradient(90deg, rgba(16,185,129,0.08) 0%, var(--card) 60%)"
                  : "var(--card)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 600,
                    backgroundColor: activeThread.avatarBg || "var(--purple-lt)",
                    color: activeThread.avatarColor || "var(--purple)",
                  }}>
                    {activeThread.leadInitials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{activeThread.leadName}</h3>
                    <span style={{ fontSize: "12px", color: "var(--ink2)" }}>
                      Score {activeThread.score} · {CHANNEL_LABELS[activeThread.channel]}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "0.5px solid var(--rule)", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink2)" }} title="Lead profile">
                    <User className="w-4 h-4" />
                  </button>
                  <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "0.5px solid var(--rule)", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink2)" }} title="View in CRM">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleToggleStatus}
                    style={{
                      fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "8px",
                      border: "1px solid var(--purple)", cursor: "pointer", transition: "all 0.15s",
                      background: activeThread.status === "ai" ? "var(--purple-lt)" : "var(--amber-lt)",
                      color: activeThread.status === "ai" ? "var(--purple)" : "var(--amber)",
                    }}
                  >
                    {activeThread.status === "ai" ? "Take over" : "Return to AI"}
                  </button>
                </div>
              </div>

              {/* Status bar */}
              <div style={{ padding: "8px 16px", borderBottom: "0.5px solid var(--rule)", background: "var(--card)", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: activeThread.status === "ai" ? "var(--purple)" : "var(--amber)", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--ink2)", fontWeight: 500 }}>
                  {activeThread.status === "ai" ? "AI handling this conversation" : "Human agent handling this conversation"}
                </span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--ink3)", fontWeight: 500 }}>
                  <ChannelIcon channel={activeThread.channel} />
                  {CHANNEL_LABELS[activeThread.channel]}
                </span>
              </div>

              {/* ── Messages ── */}
              <div 
                ref={msgListRef}
                style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}
              >
                {loadingMessages ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px" }}>
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--purple)" }} />
                    <span style={{ fontSize: "12px", color: "var(--ink3)" }}>Loading messages…</span>
                  </div>
                ) : (
                  messages.map(m => {
                    const isOut = m.direction === "outbound";
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          gap: "8px",
                          maxWidth: "78%",
                          alignSelf: isOut ? "flex-end" : "flex-start",
                          flexDirection: isOut ? "row-reverse" : "row",
                        }}
                      >
                        {/* Mini avatar */}
                        <div style={{
                          width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", fontWeight: 600,
                          backgroundColor: isOut ? "var(--purple-lt)" : (activeThread.avatarBg || "var(--purple-lt)"),
                          color: isOut ? "var(--purple)" : (activeThread.avatarColor || "var(--purple)"),
                        }}>
                          {isOut ? (m.isHuman ? "SK" : "AI") : activeThread.leadInitials}
                        </div>

                        {/* Bubble + meta */}
                        <div>
                          <div style={{
                            fontSize: "13px",
                            lineHeight: "1.55",
                            padding: "10px 14px",
                            borderRadius: isOut ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            background: isOut
                              ? (m.isHuman ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "linear-gradient(135deg, var(--purple), #8B78FC)")
                              : "var(--card)",
                            color: isOut ? "var(--card)" : "var(--ink)",
                            border: isOut ? "none" : "0.5px solid var(--rule)",
                            boxShadow: isOut ? "0 2px 8px rgba(91,79,245,0.18)" : "0 1px 3px rgba(0,0,0,0.04)",
                          }}>
                            {m.content}
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--ink3)", fontWeight: 500, marginTop: "4px", display: "flex", alignItems: "center", gap: "5px", justifyContent: isOut ? "flex-end" : "flex-start" }}>
                            {m.isAi && (
                              <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: "var(--purple-lt)", color: "var(--purple)", fontWeight: 600 }}>AI</span>
                            )}
                            {m.isHuman && (
                              <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: "var(--amber-lt)", color: "var(--amber)", fontWeight: 600 }}>Human</span>
                            )}
                            <span>{m.sentAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Compose ── */}
              <div style={{ padding: "12px 16px", background: "var(--card)", borderTop: "0.5px solid var(--rule)", display: "flex", gap: "10px", alignItems: "flex-end", flexShrink: 0 }}>
                <textarea
                  placeholder={activeThread.status === "ai" ? "Type to takeover — AI pilot is active" : "Type a message…"}
                  value={composeText}
                  onChange={e => setComposeText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={1}
                  style={{
                    flex: 1,
                    resize: "none",
                    height: "40px",
                    maxHeight: "120px",
                    fontSize: "13px",
                    fontWeight: 500,
                    border: "0.5px solid var(--rule)",
                    borderRadius: "12px",
                    padding: "9px 12px",
                    background: "var(--bg)",
                    color: "var(--ink)",
                    outline: "none",
                    lineHeight: "1.4",
                    fontFamily: "inherit",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(91,79,245,0.15)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--rule)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !composeText.trim()}
                  style={{
                    width: "40px", height: "40px", borderRadius: "12px", border: "none",
                    background: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--card)", cursor: "pointer", flexShrink: 0,
                    opacity: (sending || !composeText.trim()) ? 0.5 : 1,
                    transition: "opacity 0.15s",
                    boxShadow: "0 2px 8px rgba(91,79,245,0.25)",
                  }}
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            /* Empty state */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--purple-lt)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare style={{ width: "28px", height: "28px", color: "var(--purple)" }} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)" }}>No Active Conversation</h4>
                <p style={{ fontSize: "12.5px", color: "var(--ink3)", marginTop: "4px", maxWidth: "240px" }}>Select a lead from the left pane to display chat history.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </AppLayout>
  );
}
