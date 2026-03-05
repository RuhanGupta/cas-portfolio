"use client";

import { useEffect, useMemo, useState } from "react";
import type { EntryKind } from "@/lib/casModel";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import Link from "next/link";

type AdminEntry = CasEntryDTO;

function KindBadge({ kind }: { kind: EntryKind }) {
  const map: Record<EntryKind, string> = {
    creativity: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
    activity: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
    service: "border-amber-300/35 bg-amber-300/10 text-amber-100",
    conversation: "border-rose-300/35 bg-rose-300/10 text-rose-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] ${map[kind]}`}
    >
      {kind}
    </span>
  );
}

function Modal({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
  danger,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#020612]/72 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="panel w-full max-w-lg border-white/15 bg-[#090f20]/90">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition ${
                  danger
                    ? "border border-rose-300/35 bg-rose-400/15 text-rose-100 hover:bg-rose-400/25"
                    : "border border-cyan-300/35 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25"
                }`}
              >
                {confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<EntryKind | "all">("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    const normalizedQuery = query.trim().toLowerCase();
    return entries
      .filter((e) => (kindFilter === "all" ? true : e.kind === kindFilter))
      .filter((e) => {
        if (!normalizedQuery) return true;
        return (
          e.title.toLowerCase().includes(normalizedQuery) ||
          e.description.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [entries, query, kindFilter]);

  function requestDelete(entry: AdminEntry) {
    setPendingDelete(entry);
    setConfirmOpen(true);
  }

  async function deleteEntryConfirmed() {
    if (!pendingDelete) return;
    setDeleting(true);

    const res = await fetch(`/api/entries/${pendingDelete.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== pendingDelete.id));
      setConfirmOpen(false);
      setPendingDelete(null);
    } else {
      const errText = await res.text();
      console.error("Delete failed:", errText);
      alert("Error deleting entry.");
    }
  }

  return (
    <AdminAuthGuard>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="kicker">Admin</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
              Manage entries
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Review and curate your entries before publishing your portfolio.
            </p>
          </div>

          <Link
            href="/admin/new"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
          >
            + New Entry
          </Link>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="panel p-4 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles or reflections..."
              className="mt-2 w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="panel p-4">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Filter
            </label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as EntryKind | "all")}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100"
            >
              <option value="all">All kinds</option>
              <option value="creativity">Creativity</option>
              <option value="activity">Activity</option>
              <option value="service">Service</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-300">Loading entries...</p>
        ) : error ? (
          <div className="panel border-rose-300/35 bg-rose-400/10 p-6 text-sm text-rose-100">
            Failed to load entries: {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel p-6 text-sm text-slate-300">
            No entries match your filters.
          </div>
        ) : (
          <section className="space-y-3">
            {filtered.map((entry) => {
              const dateToShow = entry.entryDate || entry.createdAt;
              const mediaCount = entry.media.length;

              return (
                <article key={entry.id} className="panel p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindBadge kind={entry.kind} />
                        <span className="text-xs text-slate-400">
                          {new Date(dateToShow).toLocaleDateString()}
                          {entry.week ? ` · Week ${entry.week}` : ""}
                          {mediaCount ? ` · ${mediaCount} media` : ""}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-100 sm:text-lg">
                        {entry.title}
                      </h3>

                      <p className="line-clamp-2 text-sm text-slate-300">
                        {entry.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <button
                        onClick={() => requestDelete(entry)}
                        className="rounded-2xl border border-rose-300/35 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <Modal
          open={confirmOpen}
          title={deleting ? "Deleting..." : "Delete this entry?"}
          description={
            pendingDelete
              ? `This will permanently remove “${pendingDelete.title}”. This cannot be undone.`
              : undefined
          }
          confirmLabel={deleting ? "Deleting..." : "Yes, delete"}
          onClose={() => {
            if (deleting) return;
            setConfirmOpen(false);
            setPendingDelete(null);
          }}
          onConfirm={() => {
            if (deleting) return;
            void deleteEntryConfirmed();
          }}
          danger
        />
      </div>
    </AdminAuthGuard>
  );
}
