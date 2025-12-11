"use client";

import { useEffect, useState } from "react";
import type { CasEntryDB } from "@/lib/casModel";

export default function Dashboard() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries"); // no kind -> all entries
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  const counts = {
    creativity: entries.filter((e) => e.kind === "creativity").length,
    activity: entries.filter((e) => e.kind === "activity").length,
    service: entries.filter((e) => e.kind === "service").length,
    conversation: entries.filter((e) => e.kind === "conversation").length,
  };

  const recent = [...entries]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          CAS Portfolio
        </p>
        <h2 className="text-4xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            Dashboard Overview
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm">
          See a snapshot of your Creativity, Activity, Service and CAS
          Conversation entries at a glance.
        </p>
      </header>

      {loading && (
        <p className="text-slate-500 text-sm">Loading your entries…</p>
      )}

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { key: "creativity", label: "Creativity" },
          { key: "activity", label: "Activity" },
          { key: "service", label: "Service" },
          { key: "conversation", label: "Conversations" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-from)_0,transparent_60%)] opacity-60 pointer-events-none" />
            <div className="relative space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {label}
              </p>
              <p className="text-3xl font-semibold text-slate-50">
                {counts[key as keyof typeof counts]}
              </p>
              <p className="text-[0.7rem] text-slate-500">
                total entries logged
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent entries */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>Recent entries</span>
          <span className="h-px flex-1 bg-gradient-to-r from-slate-600/80 via-slate-700/40 to-transparent" />
        </h3>

        {recent.length === 0 && !loading && (
          <p className="text-slate-500 text-sm">
            No entries yet. Head to the Admin Panel to create your first CAS
            reflection.
          </p>
        )}

        <div className="space-y-2">
          {recent.map((e, idx) => {
            const dateToShow =
              ((e as any).entryDate as string | undefined) || e.createdAt; // 👈 NEW

            return (
              <article
                key={e.id ?? `${e.title}-${idx}`}
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 flex flex-col gap-1 hover:border-indigo-400/40 hover:bg-slate-900/90 transition"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-medium text-slate-50 text-sm">
                    {e.title}
                  </h4>
                  <span className="text-[0.6rem] uppercase tracking-[0.16em] text-indigo-300">
                    {e.kind}
                  </span>
                </div>
                <p className="text-[0.7rem] text-slate-500">
                  {new Date(dateToShow).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {e.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
