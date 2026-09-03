"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Network } from "lucide-react";
import { useState } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const heading = mode === "login" ? "Log in to continue learning." : "Create your learning account.";
  const description = mode === "login"
    ? "Use Google or your email and password to access your progress, notes, quizzes, and subnet calculator."
    : "Create a free account to save your progress and start exploring the lab.";

  async function handlePasswordAuth(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("");
    const supabase = createClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setStatus("Account created. Check your email to confirm it, then log in.");
      setMode("login");
      setIsLoading(false);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <main className="h-screen overflow-hidden" style={{ background: "#fbfcfa" }}>
      <div className="grid h-full lg:grid-cols-2">
        <section className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between" style={{ background: "#17181b", color: "#f1f2f3" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(244,242,233,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,233,0.12) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          <div className="relative">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#d7d9dc", color: "#17181b" }}><Network size={21} /></span><span className="font-semibold tracking-wide">CN Lab</span></div>
            <p className="mono mt-12 text-xs uppercase tracking-[0.2em]" style={{ color: "#aebdb4" }}>Computer networks / 2026</p>
            <h2 className="mt-4 max-w-lg text-4xl font-bold leading-[1.05]">Understand the system behind the signal.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: "#bcc0c6" }}>A focused workspace for studying protocols, testing your understanding, and seeing subnetting work step by step.</p>
          </div>
          <div className="relative grid max-w-md gap-3 text-sm" style={{ color: "#d9dade" }}>
            {["Five units of guided notes", "Practice quizzes with explanations", "CIDR and VLSM calculations"].map((item) => <div key={item} className="flex items-center gap-3"><Check size={15} style={{ color: "#b7bbc1" }} />{item}</div>)}
          </div>
        </section>

        <section className="flex items-center justify-center overflow-hidden border-l p-5 sm:p-8 lg:p-16" style={{ borderColor: "#dce2dc", background: "#fbfcfa" }}>
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#17181b", color: "#d7d9dc" }}><Network size={18} /></span><span className="font-semibold" style={{ color: "var(--text-primary)" }}>CN Lab</span></div>
            <h1 className="mt-2 text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{heading}</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{description}</p>
            <div className="mt-5 flex border-b" style={{ borderColor: "#dce2dc" }}>
              {(["login", "signup"] as const).map((option) => <button key={option} type="button" role="tab" aria-selected={mode === option} className="flex-1 border-b-2 px-3 pb-3 text-sm font-medium" style={{ borderColor: mode === option ? "var(--accent)" : "transparent", color: mode === option ? "var(--text-primary)" : "var(--text-secondary)" }} onClick={() => { setMode(option); setError(""); setStatus(""); }}>{option === "login" ? "Log in" : "Create account"}</button>)}
            </div>
            <form onSubmit={handlePasswordAuth} className="mt-4 space-y-2.5">
              <label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Email address</span><span className="relative block"><Mail size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded border bg-transparent py-2.5 pl-10 pr-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></span></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Password</span><span className="relative block"><LockKeyhole size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} /><input type={showPassword ? "text" : "password"} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="w-full rounded border bg-transparent py-2.5 pl-10 pr-10 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center" style={{ color: "var(--text-secondary)" }} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
              <button type="submit" disabled={isLoading} className="btn btn-primary w-full justify-between px-4 py-3.5"><span>{isLoading ? "Working..." : mode === "login" ? "Log in with email" : "Create account"}</span>{!isLoading && <ArrowRight size={17} />}</button>
            </form>
            <div className="my-4 flex items-center gap-3"><span className="h-px flex-1" style={{ background: "var(--border)" }} /><span className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>or</span><span className="h-px flex-1" style={{ background: "var(--border)" }} /></div>
            <button
              type="button"
              disabled={isLoading}
              className="btn w-full justify-between px-4 py-3.5"
              onClick={async () => {
                setIsLoading(true);
                setError("");
                const { error: authError } = await createClient().auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}` },
                });
                if (authError) {
                  setError(authError.message);
                  setIsLoading(false);
                }
              }}
            >
              <span className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">G</span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
              {!isLoading && <ArrowRight size={17} />}
            </button>
            {error && <p role="alert" className="mt-3 rounded border px-3 py-2 text-sm" style={{ borderColor: "#e4b7b0", background: "#fff5f3", color: "#9b3d32" }}>{error}</p>}
            {status && <p role="status" className="mt-3 rounded border px-3 py-2 text-sm" style={{ borderColor: "#c9cdd2", background: "#f3f4f5", color: "#4e555d" }}>{status}</p>}
            <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3"><LockKeyhole size={16} style={{ color: "var(--text-secondary)" }} /><div><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>One account, the right workspace</p><p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>New accounts start as students. Approved faculty emails automatically receive faculty tools.</p></div></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
