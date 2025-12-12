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
    creativity:
      "border-emerald-900/15 bg-emerald-50/70 text-emerald-950",
    activity: "border-lime-900/15 bg-lime-50/70 text-lime-950",
    service: "border-rose-900/15 bg-rose-50/70 text-rose-950",
    conversation:
      "border-teal-900/15 bg-teal-50/70 text-teal-950",
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

function daysBetween(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((bb.getTime() - aa.getTime()) / ms);
}

function computeStreak(dates: Date[]) {
  // dates: unique, sorted desc by day
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()))
  )
    .map((t) => new Date(t))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const diff = daysBetween(uniqueDays[i + 1], uniqueDays[i]); // next older to newer
    // since list is desc, we compare (older -> newer) by swapping:
    // easier: compute diff between newer (i) and older (i+1) should be 1
    const diff2 = daysBetween(uniqueDays[i + 1], uniqueDays[i]); // negative typically
    // Let's do absolute with correct direction:
    const correct = daysBetween(uniqueDays[i + 1], uniqueDays[i]) === -1;
    if (correct) streak++;
    else break;
  }
  return streak;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);

  // functionality
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
      .filter((e) => {
        if (!query) return true;
        return (
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
        );
      });
  }, [entries, kind, q]);

  const counts = useMemo(() => {
    return {
      creativity: entries.filter((e) => e.kind === "creativity").length,
      activity: entries.filter((e) => e.kind === "activity").length,
      service: entries.filter((e) => e.kind === "service").length,
      conversation: entries.filter((e) => e.kind === "conversation").length,
      total: entries.length,
    };
  }, [entries]);

  const sortedByDate = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = new Date(((a as any).entryDate as string | undefined) || a.createdAt);
      const db = new Date(((b as any).entryDate as string | undefined) || b.createdAt);
      return db.getTime() - da.getTime();
    });
  }, [filtered]);

  const timelineGroups = useMemo(() => {
    const map = new Map<string, CasEntryDB[]>();
    for (const e of sortedByDate) {
      const dateToShow =
        ((e as any).entryDate as string | undefined) || e.createdAt;
      const day = new Date(dateToShow);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(day.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items,
      label: formatDate(key),
    }));
  }, [sortedByDate]);

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);

    const allDates = entries.map((e) => {
      const d = ((e as any).entryDate as string | undefined) || e.createdAt;
      return new Date(d);
    });

    const monthCount = allDates.filter((d) => monthKey(d) === thisMonth).length;

    // streak based on all entries dates
    const streak = (() => {
      if (allDates.length === 0) return 0;
      // sort desc
      const sorted = [...allDates].sort((a, b) => b.getTime() - a.getTime());
      // compute consecutive-day streak ending today OR yesterday if none today
      const daySet = new Set(
        sorted.map(
          (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        )
      );

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // start anchor: today if exists, else yesterday if exists, else most recent
      let anchor =
        daySet.has(today.getTime())
          ? today
          : daySet.has(yesterday.getTime())
          ? yesterday
          : new Date(
              new Date(sorted[0]).getFullYear(),
              new Date(sorted[0]).getMonth(),
              new Date(sorted[0]).getDate()
            );

      let s = 0;
      while (daySet.has(anchor.getTime())) {
        s++;
        anchor = new Date(anchor.getTime() - 24 * 60 * 60 * 1000);
      }
      return s;
    })();

    const latest = (() => {
      if (entries.length === 0) return null;
      const s = [...entries].sort((a, b) => {
        const da = new Date(((a as any).entryDate as string | undefined) || a.createdAt);
        const db = new Date(((b as any).entryDate as string | undefined) || b.createdAt);
        return db.getTime() - da.getTime();
      });
      return s[0];
    })();

    return { monthCount, streak, latest };
  }, [entries]);

  const monthProgressPct = Math.min(
    100,
    Math.round((insights.monthCount / Math.max(1, goalPerMonth)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.6))] backdrop-blur-xl shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
        {/* racing green wash + warm brass highlight */}
        <div className="absolute inset-0 opacity-[0.90] bg-[radial-gradient(900px_circle_at_15%_15%,rgba(6,78,59,0.22),transparent_55%),radial-gradient(700px_circle_at_90%_25%,rgba(212,175,55,0.14),transparent_55%),radial-gradient(900px_circle_at_50%_110%,rgba(15,23,42,0.08),transparent_60%)]" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.26em] text-emerald-950/70">
                CAS Portfolio · Dashboard
              </p>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950">
                Your CAS, curated.
              </h1>

              <p className="max-w-2xl text-sm sm:text-base text-slate-700">
                Off-white, racing green accents, and a cleaner “portfolio” feel.
                Filter, search, and track your monthly pace.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin/new"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_45px_rgba(6,78,59,0.25)] hover:opacity-95 transition"
                >
                  + New entry
                </Link>
                <Link
                  href="/creativity"
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-white transition"
                >
                  View strands →
                </Link>
              </div>
            </div>

            {/* Month progress */}
            <div className="w-full lg:w-[360px] rounded-[1.75rem] border border-black/5 bg-white/70 backdrop-blur-xl p-5 shadow-[0_16px_55px_rgba(15,23,42,0.10)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
                    This month
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {insights.monthCount}
                    <span className="text-slate-400 text-lg font-medium">
                      {" "}
                      / {goalPerMonth}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Pace + goal tracker (editable)
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
                    Streak
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-950">
                    {insights.streak}d
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-black/5">
                <div
                  className="h-full bg-emerald-950"
                  style={{ width: `${monthProgressPct}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <label className="text-xs text-slate-600">
                  Monthly goal:
                </label>
                <input
                  type="number"
                  min={1}
                  value={goalPerMonth}
                  onChange={(e) => setGoalPerMonth(Number(e.target.value || 1))}
                  className="w-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>

              {insights.latest && (
                <p className="mt-4 text-xs text-slate-600">
                  Latest:{" "}
                  <span className="font-medium text-slate-900">
                    {(insights.latest as any).title}
                  </span>{" "}
                  ·{" "}
                  <span className="text-slate-500">
                    {formatDate(
                      (((insights.latest as any).entryDate as string | undefined) ||
                        insights.latest.createdAt) as string
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[1.75rem] border border-black/5 bg-white/70 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
            Filters
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", "creativity", "activity", "service", "conversation"] as Kind[]).map(
              (k) => (
                <KindPill key={k} kind={k} active={kind === k} onClick={() => setKind(k)} />
              )
            )}
          </div>

          <div className="mt-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles or reflections…"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* COUNTS as compact “totals” (not the old grid) */}
        <div className="rounded-[1.75rem] border border-black/5 bg-white/70 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-600">
            Totals
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="text-xs text-slate-600">Total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {counts.total}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="text-xs text-slate-600">Conversations</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {counts.conversation}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="text-xs text-slate-600">Creativity</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {counts.creativity}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="text-xs text-slate-600">Activity + Service</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {counts.activity + counts.service}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/new"
              className="flex-1 text-center rounded-2xl bg-emerald-950 px-3 py-2.5 text-sm font-medium text-white hover:opacity-95 transition"
            >
              New
            </Link>
            <Link
              href="/admin"
              className="flex-1 text-center rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Timeline
            </h2>
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {sortedByDate.length}
              </span>{" "}
              entries
              {kind !== "all" ? (
                <>
                  {" "}
                  · filtered by{" "}
                  <span className="font-medium text-emerald-950">{kind}</span>
                </>
              ) : null}
              {q.trim() ? (
                <>
                  {" "}
                  · search “<span className="font-medium">{q.trim()}</span>”
                </>
              ) : null}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/creativity"
              className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white transition"
            >
              Creativity →
            </Link>
            <Link
              href="/activity"
              className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white transition"
            >
              Activity →
            </Link>
            <Link
              href="/service"
              className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white transition"
            >
              Service →
            </Link>
            <Link
              href="/conversations"
              className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white transition"
            >
              Conversations →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[1.75rem] border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
            Loading entries…
          </div>
        ) : sortedByDate.length === 0 ? (
          <div className="rounded-[1.75rem] border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
            No entries match your filters. Try switching to “All” or clearing the
            search.
          </div>
        ) : (
          <div className="space-y-4">
            {timelineGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-[1.75rem] border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
                    {group.label}
                  </p>
                  <span className="text-xs text-slate-500">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="p-5 grid gap-3 sm:grid-cols-2">
                  {group.items.map((e, idx) => {
                    const dateToShow =
                      ((e as any).entryDate as string | undefined) || e.createdAt;

                    const badge =
                      e.kind === "creativity"
                        ? "border-emerald-900/15 bg-emerald-50/70 text-emerald-950"
                        : e.kind === "activity"
                        ? "border-lime-900/15 bg-lime-50/70 text-lime-950"
                        : e.kind === "service"
                        ? "border-rose-900/15 bg-rose-50/70 text-rose-950"
                        : "border-teal-900/15 bg-teal-50/70 text-teal-950";

                    return (
                      <article
                        key={e.id ?? `${(e as any).title}-${idx}`}
                        className="group rounded-3xl border border-black/5 bg-white p-5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)] transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-950 leading-snug">
                            {e.title}
                          </h3>
                          <span
                            className={classNames(
                              "rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em]",
                              badge
                            )}
                          >
                            {e.kind}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(dateToShow)}
                          {(e as any).week ? ` · Week ${(e as any).week}` : ""}
                          {(e as any).media?.length
                            ? ` · ${(e as any).media.length} media`
                            : ""}
                        </p>

                        <p className="mt-3 text-sm text-slate-700 line-clamp-3">
                          {e.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {/* subtle accent line */}
                            <span className="inline-block h-px w-10 bg-gradient-to-r from-emerald-950/40 to-transparent align-middle" />
                          </span>

                          <Link
                            href={
                              e.kind === "creativity"
                                ? "/creativity"
                                : e.kind === "activity"
                                ? "/activity"
                                : e.kind === "service"
                                ? "/service"
                                : "/conversations"
                            }
                            className="text-xs font-medium text-emerald-950 hover:underline underline-offset-4"
                          >
                            View strand →
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
