"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, User, Building, Mail, Lock } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/* Google's mark is kept multi-colour (its brand guidelines require this,
   unlike GitHub's which is fine as a monochrome glyph) — everything else on
   this page is single-ink, so this is a deliberate, contained exception. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="shrink-0">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

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

  // /auth/callback redirects back here with ?error=... when the code
  // exchange fails (provider not enabled yet, denied consent, etc.) — this
  // is the only way that failure can reach the user, since it happens after
  // they've already left this page for the provider and come back.
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) setError(oauthError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTab = (next: "signin" | "signup" | "forgot") => {
    setTab(next);
    setError(null);
    setResetSent(false);
  };

  // Real calls, not decoration — but nothing works until Google/GitHub are
  // switched on in Supabase (Authentication → Providers) with a Client
  // ID/Secret from Google Cloud Console / a GitHub OAuth App, and this
  // origin added as an authorized redirect URI on both sides.
  //
  // Verified against the real project this app is configured against: with
  // a provider not yet enabled, signInWithOAuth() does a top-level redirect
  // to Supabase's own /auth/v1/authorize endpoint BEFORE that endpoint has
  // validated anything — the "provider is not enabled" rejection only
  // happens once the browser is already there, so it lands on Supabase's
  // raw JSON error response, not this page's banner. That's standard
  // Supabase behavior for every integration, not a bug here, and it goes
  // away entirely the moment the provider is actually enabled — which is
  // the whole point of testing this before handing it off. If you want that
  // failure mode caught gracefully even pre-configuration, it needs
  // `skipBrowserRedirect: true` plus a manual fetch of the authorize URL to
  // inspect the response before navigating — real additional plumbing, not
  // something worth doing for a state that's meant to be temporary.
  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    if (!configured) {
      setError("Supabase isn't configured yet — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      return;
    }
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` },
    });
    // Only reachable for errors caught before the redirect fires (e.g. a
    // malformed call) — see the comment above for why "provider not
    // enabled" doesn't take this path.
    if (error) setError(error.message);
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
    // No solid bg-color here on purpose: body already paints the canvas
    // fill in globals.css, and behind that sits the same fixed paper-grain
    // texture (styles/paper.css) every other page in the app has — this div
    // used to cover it completely with an opaque colour, so the login page
    // was the one flat, textureless screen in the product. It shows through
    // now, the same one line of CSS that would have shown a dark WebGL dot
    // grid on the reference component instead paints the paper this app
    // already runs on.
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* A static warm glow standing in for the reference's animated dark
          backdrop — same "something is behind the card" gesture, at rest
          rather than in motion, so it needs no reduced-motion handling. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 68%)", opacity: 0.6 }}
      />
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <GlassPanel className="p-8 md:p-10">

          {!configured && (
            <div className="mb-6 p-3 rounded-lg shadow-[inset_0_0_0_1px_var(--hair)] bg-[var(--card2)] flex items-start gap-2.5">
              <AlertCircle size={16} className="text-[var(--purple)] shrink-0 mt-0.5" />
              <span className="text-[12px] font-sans font-medium text-[var(--ink2)] leading-relaxed">
                Dev mode: Supabase isn't configured. Add credentials to <code className="font-mono">.env.local</code> to enable sign in.
              </span>
            </div>
          )}

          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            {/* Same serif-in-a-circle mark as the marketing nav and sidebar. */}
            <span
              className="w-10 h-10 rounded-full border-[1.5px] border-[var(--ink)] flex items-center justify-center mb-4 italic text-[19px] text-[var(--ink)]"
              style={{ fontFamily: "var(--serif)" }}
              aria-hidden="true"
            >
              O
            </span>
            <p className="font-sans font-semibold text-[11px] tracking-[0.14em] text-[var(--ink3)] uppercase mb-3">Obsidias</p>
            <h1 className="font-sans font-medium text-[21px] text-[var(--ink)] tracking-tight">
              {tab === "forgot" ? "Reset your password" : tab === "signup" ? "Create your account" : "Sign in to your agency"}
            </h1>
          </div>

          {/* Tab Selector */}
          {tab !== "forgot" && (
            <div className="relative flex w-full mb-8 bg-[var(--card2)] p-1 rounded-lg shadow-[inset_0_0_0_1px_var(--hair)]">
              <button
                type="button"
                className={`flex-1 py-2 text-[13px] font-sans font-semibold transition-all relative rounded-md ${tab === "signin" ? "text-[var(--purple)]" : "text-[var(--ink3)] hover:text-[var(--ink)]"}`}
                onClick={() => switchTab("signin")}
              >
                {tab === "signin" && (
                  <motion.div
                    layoutId="active-login-tab"
                    className="absolute inset-0 bg-white rounded-md shadow-[inset_0_0_0_1px_var(--hair)]"
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
                    className="absolute inset-0 bg-white rounded-md shadow-[inset_0_0_0_1px_var(--hair)]"
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
              <div className="w-11 h-11 rounded-xl bg-[var(--card2)] shadow-[inset_0_0_0_1px_var(--hair)] flex items-center justify-center">
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

          {tab !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-6">
                <span className="h-px flex-1 bg-[var(--hair-strong)]" />
                <span className="text-[10.5px] font-sans font-semibold uppercase tracking-[0.14em] text-[var(--ink4)]">or</span>
                <span className="h-px flex-1 bg-[var(--hair-strong)]" />
              </div>

              <div className="flex flex-col gap-2.5">
                <button type="button" onClick={() => handleOAuth("google")} className="ghost-button w-full">
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button type="button" onClick={() => handleOAuth("github")} className="ghost-button w-full">
                  <GitHubIcon />
                  Continue with GitHub
                </button>
              </div>
            </>
          )}

        </GlassPanel>
      </motion.div>
    </div>
  );
}
