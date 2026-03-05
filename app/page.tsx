"use client";

import { useEffect, useMemo, useState } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";
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
  const label = kind === "all" ? "All" : kind.charAt(0).toUpperCase() + kind.slice(1);

  const palette: Record<Kind, string> = {
    all: "border-white/20 bg-white/5 text-slate-200",
    creativity: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
    activity: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
    service: "border-amber-300/35 bg-amber-300/10 text-amber-100",
    conversation: "border-rose-300/35 bg-rose-300/10 text-rose-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.2em] transition",
        palette[kind],
        active
          ? "ring-2 ring-cyan-300/30 shadow-[0_12px_34px_rgba(6,182,212,0.18)]"
          : "hover:bg-white/12"
      )}
    >
      <span
        className={classNames(
          "h-1.5 w-1.5 rounded-full",
          kind === "all" && "bg-slate-300",
          kind === "creativity" && "bg-cyan-300",
          kind === "activity" && "bg-emerald-300",
          kind === "service" && "bg-amber-300",
          kind === "conversation" && "bg-rose-300"
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
  const [entries, setEntries] = useState<CasEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [goalPerMonth, setGoalPerMonth] = useState<number>(8);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEntries();
        setEntries(data);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load entries";
        setEntries([]);
        setError(message);
      } finally {
        setLoading(false);
      }
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
      const da = new Date(a.entryDate || a.createdAt);
      const db = new Date(b.entryDate || b.createdAt);
      return db.getTime() - da.getTime();
    });
  }, [filtered]);

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const dates = entries.map((e) => new Date(e.entryDate || e.createdAt));

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
    <div className="space-y-8">
      <section className="panel relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 left-20 h-52 w-52 rounded-full bg-amber-300/14 blur-3xl" />

        <p className="kicker">Student Educational Portfolio · IB CAS</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-100">
          CAS Portfolio Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300">
          Curated reflections from Creativity, Activity, Service, and
          Conversations, presented in a cinematic dark showcase format.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/new"
            className="rounded-2xl border border-cyan-300/35 bg-cyan-300/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
          >
            + New entry
          </Link>
          <Link
            href="/creativity"
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            View strands →
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="panel p-4 lg:col-span-3">
          <p className="kicker">Filters</p>
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
            placeholder="Search reflections..."
            className="mt-4 w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="panel p-4 lg:col-span-2">
          <p className="kicker">This Month</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {insights.monthCount} / {goalPerMonth}
          </p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
              style={{ width: `${monthProgressPct}%` }}
            />
          </div>
          <label className="mt-3 block text-xs text-slate-400">Monthly goal</label>
          <input
            type="number"
            min={1}
            value={goalPerMonth}
            onChange={(e) => setGoalPerMonth(Number(e.target.value || 1))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-[#090f21] px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="panel-soft p-3">
          <p className="text-xs text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{counts.total}</p>
        </div>
        <div className="panel-soft p-3">
          <p className="text-xs text-cyan-200">Creativity</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-100">{counts.creativity}</p>
        </div>
        <div className="panel-soft p-3">
          <p className="text-xs text-emerald-200">Activity</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-100">{counts.activity}</p>
        </div>
        <div className="panel-soft p-3">
          <p className="text-xs text-amber-200">Service</p>
          <p className="mt-1 text-2xl font-semibold text-amber-100">{counts.service}</p>
        </div>
        <div className="panel-soft p-3">
          <p className="text-xs text-rose-200">Conversations</p>
          <p className="mt-1 text-2xl font-semibold text-rose-100">{counts.conversation}</p>
        </div>
      </section>

      <section className="space-y-4">
        {error && (
          <div className="panel border-rose-300/35 bg-rose-400/10 p-6 text-sm text-rose-100">
            Failed to load entries: {error}
          </div>
        )}

        {loading ? (
          <div className="panel p-6 text-slate-300">Loading entries...</div>
        ) : sortedByDate.length === 0 ? (
          <div className="panel p-6 text-slate-300">No entries yet.</div>
        ) : (
          sortedByDate.map((e, idx) => (
            <article
              key={e.id}
              className="panel p-5"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <h3 className="text-sm font-semibold text-slate-100">{e.title}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {formatDate(e.entryDate || e.createdAt)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                {e.description}
              </p>
            </article>
          ))
        )}
      </section>

      <footer className="panel-soft p-5 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Ruhan Gupta · Student Educational Portfolio</p>
        <p className="mt-1">
          International Baccalaureate CAS documentation · Non-commercial
          academic use · Built with Next.js
        </p>
      </footer>
    </div>
  );
}
