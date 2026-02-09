"use client";

import { useEffect, useMemo, useState } from "react";
import type { CasEntryDB } from "@/lib/casModel";
import Link from "next/link";

type Kind = "all" | "creativity" | "activity" | "service" | "conversation";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function KindPill({
  kind,
  active,
  onClick,
}: {
  kind: Kind;
  active: boolean;
  onClick: () => void;
}) {
  const label =
    kind === "all"
      ? "All"
      : kind.charAt(0).toUpperCase() + kind.slice(1);

  const palette: Record<Kind, string> = {
    all: "border-black/10 bg-white text-slate-900",
    creativity: "border-emerald-900/15 bg-emerald-50/70 text-emerald-950",
    activity: "border-lime-900/15 bg-lime-50/70 text-lime-950",
    service: "border-rose-900/15 bg-rose-50/70 text-rose-950",
    conversation: "border-teal-900/15 bg-teal-50/70 text-teal-950",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] uppercase tracking-[0.18em] transition",
        palette[kind],
        active
          ? "shadow-[0_10px_30px_rgba(6,78,59,0.12)] ring-2 ring-emerald-900/10"
          : "hover:shadow-sm hover:bg-white/80"
      )}
    >
      <span
        className={classNames(
          "h-1.5 w-1.5 rounded-full",
          kind === "all" && "bg-slate-500",
          kind === "creativity" && "bg-emerald-700",
          kind === "activity" && "bg-lime-700",
          kind === "service" && "bg-rose-700",
          kind === "conversation" && "bg-teal-700"
        )}
      />
      {label}
    </button>
  );
}

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [goalPerMonth, setGoalPerMonth] = useState<number>(8);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries");
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return entries
      .filter((e) => (kind === "all" ? true : e.kind === kind))
      .filter((e) =>
        !query
          ? true
          : e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query)
      );
  }, [entries, kind, q]);

  const counts = useMemo(
    () => ({
      creativity: entries.filter((e) => e.kind === "creativity").length,
      activity: entries.filter((e) => e.kind === "activity").length,
      service: entries.filter((e) => e.kind === "service").length,
      conversation: entries.filter((e) => e.kind === "conversation").length,
      total: entries.length,
    }),
    [entries]
  );

  const sortedByDate = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = new Date((a as any).entryDate || a.createdAt);
      const db = new Date((b as any).entryDate || b.createdAt);
      return db.getTime() - da.getTime();
    });
  }, [filtered]);

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const dates = entries.map(
      (e) => new Date((e as any).entryDate || e.createdAt)
    );

    return {
      monthCount: dates.filter((d) => monthKey(d) === thisMonth).length,
      streak: dates.length,
    };
  }, [entries]);

  const monthProgressPct = Math.min(
    100,
    Math.round((insights.monthCount / Math.max(1, goalPerMonth)) * 100)
  );

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        <div className="relative p-6 sm:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.26em] text-emerald-950/70">
            Student Educational Portfolio · IB CAS
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950">
            CAS Portfolio Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-700">
            A personal student portfolio created to document International
            Baccalaureate Creativity, Activity, and Service (CAS) experiences.
            This site is for academic reflection, learning, and university
            applications.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/admin/new"
              className="rounded-2xl bg-emerald-950 px-4 py-2.5 text-sm font-medium text-white"
            >
              + New entry
            </Link>
            <Link
              href="/creativity"
              className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium"
            >
              View strands →
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[1.75rem] border border-black/5 bg-white/70 p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
            Filters
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", "creativity", "activity", "service", "conversation"] as Kind[]).map(
              (k) => (
                <KindPill
                  key={k}
                  kind={k}
                  active={kind === k}
                  onClick={() => setKind(k)}
                />
              )
            )}
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reflections…"
            className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div className="rounded-[1.75rem] border border-black/5 bg-white/70 p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
            This Month
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {insights.monthCount} / {goalPerMonth}
          </p>

          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-950"
              style={{ width: `${monthProgressPct}%` }}
            />
          </div>

          <label className="mt-3 block text-xs text-slate-600">
            Monthly goal
          </label>
          <input
            type="number"
            min={1}
            value={goalPerMonth}
            onChange={(e) => setGoalPerMonth(Number(e.target.value || 1))}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="space-y-4">
        {loading ? (
          <div className="rounded-[1.75rem] border border-black/5 bg-white/70 p-6">
            Loading entries…
          </div>
        ) : sortedByDate.length === 0 ? (
          <div className="rounded-[1.75rem] border border-black/5 bg-white/70 p-6">
            No entries yet.
          </div>
        ) : (
          sortedByDate.map((e) => (
            <article
              key={e.id}
              className="rounded-[1.75rem] border border-black/5 bg-white p-5"
            >
              <h3 className="text-sm font-semibold">{e.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate((e as any).entryDate || e.createdAt)}
              </p>
              <p className="mt-3 text-sm text-slate-700">
                {e.description}
              </p>
            </article>
          ))
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-10 rounded-[1.75rem] border border-black/5 bg-white/70 p-5 text-xs text-slate-600">
        <p>
          © {new Date().getFullYear()} Ruhan Gupta · Student Educational Portfolio
        </p>
        <p className="mt-1">
          International Baccalaureate CAS documentation · Non-commercial academic
          use · Built with Next.js
        </p>
      </footer>
    </div>
  );
}
