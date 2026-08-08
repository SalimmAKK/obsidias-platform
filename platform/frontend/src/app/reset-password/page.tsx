"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Hexagon } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The Supabase browser client reads the recovery tokens out of the URL
  // fragment automatically on load and fires PASSWORD_RECOVERY once the
  // temporary session is established. Until then, don't render the form —
  // there's nothing valid to submit against yet.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setInvalid((current) => current || !document.hidden);
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (ready) setInvalid(false);
  }, [ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
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
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--purple)] flex items-center justify-center mb-4">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <p className="font-sans font-semibold text-[11px] tracking-[0.14em] text-[var(--ink3)] uppercase mb-3">Obsidias</p>
            <h1 className="font-sans font-medium text-[21px] text-[var(--ink)] tracking-tight">Set a new password</h1>
          </div>

          {invalid && !ready ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <AlertCircle className="w-8 h-8 text-[var(--red)]" />
              <p className="font-sans text-[13.5px] text-[var(--ink)] font-semibold">This reset link is invalid or has expired.</p>
              <button type="button" className="text-[12px] font-sans font-semibold text-[var(--purple)] hover:underline" onClick={() => router.push("/login")}>
                Back to Sign In
              </button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--green)]" />
              <p className="font-sans text-[13.5px] text-[var(--ink)] font-semibold">Password updated. Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    placeholder="••••••••"
                    required
                    disabled={!ready}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink3)] hover:text-[var(--ink)]" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[var(--ink3)] font-semibold uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "42px" }}
                    placeholder="••••••••"
                    required
                    disabled={!ready}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button type="submit" fullWidth disabled={loading || !ready}>
                  {!ready ? "Verifying link…" : loading ? "Saving…" : "Update Password"}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-[var(--red-lt)] border border-[var(--red)]/20 rounded-xl flex items-center gap-2.5 mt-2">
                  <AlertCircle size={16} className="text-[var(--red)] shrink-0" />
                  <span className="text-[12.5px] font-sans font-semibold text-[var(--red)]">{error}</span>
                </div>
              )}
            </form>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
}
