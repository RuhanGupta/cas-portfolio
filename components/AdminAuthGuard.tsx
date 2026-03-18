"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (response.ok) {
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

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!passwordInput.trim() || submitting) return;
    void login();
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-2">
        <div className="site-panel w-full max-w-xl p-6 sm:p-8">
          <p className="kicker">Protected area</p>
          <h2 className="mt-3 font-serif text-4xl text-foreground">
            Admin Login
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            Enter the admin password to manage portfolio entries, upload
            evidence, and curate the archive.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="admin-password">
                Password
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(event) => {
                    setPasswordInput(event.target.value);
                    setError(null);
                  }}
                  className="form-field flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="action-button-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-[1.35rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !passwordInput.trim()}
              className="action-button w-full disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-sm text-muted-foreground">
              Session access is cached on this device with local storage.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
