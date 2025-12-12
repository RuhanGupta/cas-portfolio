"use client";

import { useEffect, useMemo, useState } from "react";
import type { CasEntryDB } from "@/lib/casModel";
import Link from "next/link";

function StatCard({
  label,
  value,
  hint,
  gradient,
}: {
  label: string;
  value: number;
  hint: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
      <div className={`absolute inset-0 opacity-35 ${gradient}`} />
      <div className="relative p-5">
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-600">
          {label}
        </p>
        <p className="mt-2 text-4xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/5 bg-white px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-700">
      {children}
    </span>
  );
}

export default function Dashboard() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries");
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  const counts = useMemo(() => {
    return {
      creativity: entries.filter((e) => e.kind === "creativity").length,
      activity: entries.filter((e) => e.kind === "activity").length,
      service: entries.filter((e) => e.kind === "service").length,
      conversation: entries.filter((e) => e.kind === "conversation").length,
    };
  }, [entries]);

  const recent = useMemo(() => {
    return [...entries]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [entries]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>CAS Portfolio</Pill>
          <Pill>Dashboard</Pill>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950">
          Overview, at a glance.
        </h1>

        <p className="max-w-2xl text-slate-600">
          A clean snapshot of your Creativity, Activity, Service, and CAS
          Conversation entries — designed to look polished and presentable.
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/new"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.20)] hover:opacity-95 transition"
          >
            + Create new entry
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-white transition"
          >
            Open Admin
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-slate-500">Loading entries…</p>}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Creativity"
          value={counts.creativity}
          hint="total reflections logged"
          gradient="bg-[radial-gradient(700px_circle_at_20%_10%,rgba(99,102,241,0.35),transparent_60%)]"
        />
        <StatCard
          label="Activity"
          value={counts.activity}
          hint="total reflections logged"
          gradient="bg-[radial-gradient(700px_circle_at_20%_10%,rgba(16,185,129,0.30),transparent_60%)]"
        />
        <StatCard
          label="Service"
          value={counts.service}
          hint="total reflections logged"
          gradient="bg-[radial-gradient(700px_circle_at_20%_10%,rgba(244,63,94,0.22),transparent_60%)]"
        />
        <StatCard
          label="Conversations"
          value={counts.conversation}
          hint="total conversation logs"
          gradient="bg-[radial-gradient(700px_circle_at_20%_10%,rgba(14,165,233,0.22),transparent_60%)]"
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent entries
          </h2>
          <span className="text-xs text-slate-500">
            Showing {recent.length} items
          </span>
        </div>

        {recent.length === 0 && !loading && (
          <div className="rounded-3xl border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
            No entries yet. Create your first one in the Admin panel.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {recent.map((e, idx) => {
            const dateToShow =
              ((e as any).entryDate as string | undefined) || e.createdAt;

            return (
              <article
                key={e.id ?? `${e.title}-${idx}`}
                className="group rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {e.title}
                  </h3>
                  <span className="rounded-full border border-black/5 bg-white px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-slate-700">
                    {e.kind}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {new Date(dateToShow).toLocaleDateString()}
                </p>

                <p className="mt-3 text-sm text-slate-700 line-clamp-3">
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
