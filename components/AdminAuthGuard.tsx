"use client";

import { useEffect, useState } from "react";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("admin_auth");
    if (stored === "true") {
      setAuthed(true);
      return;
    }

    if (document.cookie.includes("admin_auth=true")) {
      window.localStorage.setItem("admin_auth", "true");
      setAuthed(true);
    } else {
      setAuthed(false);
    }
  }, []);

  async function login() {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("admin_auth", "true");
        }
        setAuthed(true);
        return;
      }

      setError("Incorrect password. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordInput.trim() || submitting) return;
    login();
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* background glow to match the off-white / racing green aesthetic */}
          <div className="pointer-events-none absolute -inset-6 opacity-[0.95] bg-[radial-gradient(900px_circle_at_20%_10%,rgba(6,78,59,0.18),transparent_55%),radial-gradient(700px_circle_at_90%_30%,rgba(212,175,55,0.12),transparent_55%),radial-gradient(800px_circle_at_40%_120%,rgba(15,23,42,0.06),transparent_60%)] blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
            {/* subtle top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-950/70 via-amber-500/40 to-emerald-950/30" />

            <div className="p-7 sm:p-8">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[conic-gradient(from_180deg,rgba(6,78,59,0.95),rgba(212,175,55,0.55),rgba(6,78,59,0.80))] shadow-[0_18px_45px_rgba(6,78,59,0.22)]" />
                <div className="space-y-1">
                  <p className="text-[0.7rem] uppercase tracking-[0.26em] text-emerald-950/70">
                    Protected area
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Admin Login
                  </h2>
                  <p className="text-sm text-slate-600">
                    Enter your admin password to manage entries.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setError(null);
                      }}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-900/20 focus:ring-2 focus:ring-emerald-900/10"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {error}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passwordInput.trim()}
                  className="w-full rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(6,78,59,0.22)] hover:opacity-95 disabled:opacity-60 transition"
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </button>

                <p className="text-xs text-slate-500">
                  Tip: This login is stored on this device via{" "}
                  <span className="font-medium text-slate-700">localStorage</span>
                  .
                </p>
              </form>
            </div>
          </div>

          {/* tiny footer */}
          <p className="mt-4 text-center text-[0.7rem] text-slate-500">
            CAS Portfolio Admin · Secure access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
