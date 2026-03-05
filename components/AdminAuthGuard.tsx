"use client";

import { useEffect, useState } from "react";
import type { ReactNode, FormEvent } from "react";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordInput.trim() || submitting) return;
    login();
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="flex min-h-[calc(100vh-220px)] items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute -inset-8 bg-[radial-gradient(700px_circle_at_10%_20%,rgba(56,189,248,0.26),transparent_55%),radial-gradient(700px_circle_at_90%_20%,rgba(245,158,11,0.20),transparent_60%),radial-gradient(700px_circle_at_40%_110%,rgba(244,63,94,0.15),transparent_60%)] blur-3xl" />

          <div className="panel relative overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-300/85 via-amber-300/65 to-emerald-300/70" />

            <div className="p-7 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[conic-gradient(from_210deg,rgba(34,211,238,0.95),rgba(245,158,11,0.85),rgba(52,211,153,0.8),rgba(34,211,238,0.95))] shadow-[0_18px_48px_rgba(34,211,238,0.2)]" />
                <div className="space-y-1">
                  <p className="kicker text-cyan-200/80">Protected area</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
                    Admin Login
                  </h2>
                  <p className="text-sm text-slate-300">
                    Enter your admin password to manage entries.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
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
                      className="w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 pr-16 text-sm text-slate-100 placeholder:text-slate-500"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.1]"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-rose-300/35 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passwordInput.trim()}
                  className="w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/12 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>

                <p className="text-xs text-slate-400">
                  Session is cached on this device using local storage.
                </p>
              </form>
            </div>
          </div>

          <p className="mt-4 text-center text-[0.7rem] text-slate-500">
            CAS Portfolio Admin · Secure access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
