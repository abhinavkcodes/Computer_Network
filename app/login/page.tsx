"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--bg-light)" }}>
      <section className="card w-full max-w-md p-8 text-center">
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          CN Lab
        </p>
        <h1 className="mt-4 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Log in or create your account
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Continue with Google to log in or create a student account. Faculty access is assigned to approved email addresses.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-8 w-full"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}` },
            });
          }}
        >
          Sign in or create with Google
        </button>
      </section>
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
