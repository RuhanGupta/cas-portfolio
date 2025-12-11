"use client";

import { useEffect, useState } from "react";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    // Run only in the browser
    if (typeof window === "undefined") return;

    // 1. Prefer localStorage – this is per-device persistence
    const stored = window.localStorage.getItem("admin_auth");
    if (stored === "true") {
      setAuthed(true);
      return;
    }

    // 2. Fallback: if you still keep a non-httpOnly cookie
    if (document.cookie.includes("admin_auth=true")) {
      window.localStorage.setItem("admin_auth", "true");
      setAuthed(true);
    } else {
      setAuthed(false);
    }
  }, []);

  async function login() {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    });

    if (res.ok) {
      // Persist auth on this device
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_auth", "true");
      }
      setAuthed(true);
    } else {
      alert("Incorrect password");
    }
  }

  if (authed === null) return null;

  if (!authed)
    return (
      <div className="mx-auto max-w-sm mt-20 p-6 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-4 text-center">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white"
        />
        <button
          onClick={login}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </div>
    );

  return <>{children}</>;
}
