"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Hexagon, User, Building, Mail, Lock } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");

  const configured = isSupabaseConfigured();

  const switchTab = (next: "signin" | "signup" | "forgot") => {
    setTab(next);
    setError(null);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!configured) {
      setError("Supabase isn't configured yet — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
      } else if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        router.push(redirectTo);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, agency } },
        });
        if (error) throw error;
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <GlassPanel className="p-8 md:p-10">

          {!configured && (
            <div className="mb-6 p-3 rounded-lg border border-[var(--rule)] bg-[var(--card2)] flex items-start gap-2.5">
              <AlertCircle size={16} className="text-[var(--purple)] shrink-0 mt-0.5" />
              <span className="text-[12px] font-sans font-medium text-[var(--ink2)] leading-relaxed">
                Dev mode: Supabase isn't configured. Add credentials to <code className="font-mono">.env.local</code> to enable sign in.
              </span>
            </div>
          )}

          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--purple)] flex items-center justify-center mb-4">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <p className="font-sans font-semibold text-[11px] tracking-[0.14em] text-[var(--ink3)] uppercase mb-3">Obsidias</p>
            <h1 className="font-sans font-medium text-[21px] text-[var(--ink)] tracking-tight">
              {tab === "forgot" ? "Reset your password" : "Sign in to your agency"}
            </h1>
          </div>

          {/* Tab Selector */}
          {tab !== "forgot" && (
            <div className="relative flex w-full mb-8 bg-[var(--card2)] p-1 rounded-lg border border-[var(--rule)]">
              <button
                type="button"
                className={`flex-1 py-2 text-[13px] font-sans font-semibold transition-all relative rounded-md ${tab === "signin" ? "text-[var(--purple)]" : "text-[var(--ink3)] hover:text-[var(--ink)]"}`}
                onClick={() => switchTab("signin")}
              >
                {tab === "signin" && (
                  <motion.div
                    layoutId="active-login-tab"
                    className="absolute inset-0 bg-white rounded-md border border-[var(--rule)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[13px] font-sans font-semibold transition-all relative rounded-md ${tab === "signup" ? "text-[var(--purple)]" : "text-[var(--ink3)] hover:text-[var(--ink)]"}`}
                onClick={() => switchTab("signup")}
              >
                {tab === "signup" && (
                  <motion.div
                    layoutId="active-login-tab"
                    className="absolute inset-0 bg-white rounded-md border border-[var(--rule)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>
          )}

          {tab === "forgot" && (
            <div className="mb-8 text-center">
              <p className="font-sans text-[13px] text-[var(--ink2)] leading-relaxed">
                Enter your account email and we&rsquo;ll send you a link to reset your password.
              </p>
            </div>
          )}

          {tab === "forgot" && resetSent ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--card2)] border border-[var(--rule)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[var(--purple)]" />
              </div>
              <p className="font-sans text-[13.5px] text-[var(--ink)] font-semibold">Check your inbox</p>
              <p className="font-sans text-[12.5px] text-[var(--ink3)] leading-relaxed">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
              <button type="button" className="text-[12px] font-sans font-semibold text-[var(--purple)] hover:underline" onClick={() => switchTab("signin")}>
                Back to Sign In
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <AnimatePresence mode="wait">
              {tab === "signup" && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                      <input type="text" className="input-field" style={{ paddingLeft: "42px" }} placeholder="Mohammed Al-Rashid" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider ml-1">Agency Name</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                      <input type="text" className="input-field" style={{ paddingLeft: "42px" }} placeholder="Al-Rashid Real Estate" required value={agency} onChange={e => setAgency(e.target.value)} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                <input type="email" className="input-field" style={{ paddingLeft: "42px" }} placeholder="you@agency.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            {tab !== "forgot" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider">Password</label>
                  {tab === "signin" && (
                    <button type="button" className="text-[11px] font-sans font-semibold text-[var(--purple)] hover:underline" onClick={() => switchTab("forgot")}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink3)] hover:text-[var(--ink)]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Processing..." : tab === "signin" ? "Sign In" : tab === "forgot" ? "Send Reset Link" : "Create Account"}
              </Button>
            </div>

            {tab === "forgot" && (
              <button type="button" className="text-center text-[12px] font-sans font-semibold text-[var(--ink3)] hover:text-[var(--ink)] transition-colors" onClick={() => switchTab("signin")}>
                Back to Sign In
              </button>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-[var(--red-lt)] border border-[var(--red)]/20 rounded-lg flex items-center gap-2.5 mt-2"
                >
                  <AlertCircle size={16} className="text-[var(--red)] shrink-0" />
                  <span className="text-[12.5px] font-sans font-semibold text-[var(--red)]">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {tab === "signup" && (
              <p className="text-center text-[11px] text-[var(--ink3)] mt-2 leading-relaxed">
                By creating an account, you agree to our <span className="underline cursor-pointer hover:text-[var(--ink)]">Terms of Service</span>.
              </p>
            )}

          </form>
          )}

        </GlassPanel>
      </motion.div>
    </div>
  );
}
