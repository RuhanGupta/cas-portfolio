"use client";

import { useEffect, useMemo, useState } from "react";
import type { EntryKind, MediaItem } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import Link from "next/link";

type AdminEntry = {
  id: string;
  kind: EntryKind;
  title: string;
  description: string;
  createdAt: string;
  week?: number | null;
  media: MediaItem[];
  entryDate?: string;
};

function KindBadge({ kind }: { kind: EntryKind }) {
  const map: Record<EntryKind, string> = {
    creativity: "bg-[rgba(99,102,241,0.10)] text-indigo-700 border-indigo-200",
    activity: "bg-[rgba(16,185,129,0.10)] text-emerald-700 border-emerald-200",
    service: "bg-[rgba(244,63,94,0.10)] text-rose-700 border-rose-200",
    conversation: "bg-[rgba(14,165,233,0.10)] text-sky-700 border-sky-200",
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
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-black/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-2xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition ${
                  danger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-slate-900 hover:opacity-95"
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

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<EntryKind | "all">("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => (kindFilter === "all" ? true : e.kind === kindFilter))
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
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
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
              Admin
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
              Manage entries
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Create, review, and clean up your portfolio entries — in a
              polished, presentable dashboard.
            </p>
          </div>

          <Link
            href="/admin/new"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] hover:opacity-95 transition"
          >
            + New Entry
          </Link>
        </header>

        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles or reflections…"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
            />
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Filter
            </label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as any)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-300"
            >
              <option value="all">All kinds</option>
              <option value="creativity">Creativity</option>
              <option value="activity">Activity</option>
              <option value="service">Service</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading entries…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
            No entries match your filters.
          </div>
        ) : (
          <section className="space-y-3">
            {filtered.map((e) => {
              const dateToShow = (e.entryDate as string | undefined) || e.createdAt;
              const mediaCount = e.media?.length ?? 0;

              return (
                <article
                  key={e.id}
                  className="group rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)] transition"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindBadge kind={e.kind} />
                        <span className="text-xs text-slate-500">
                          {new Date(dateToShow).toLocaleDateString()}
                          {e.week ? ` · Week ${e.week}` : ""}
                          {mediaCount ? ` · ${mediaCount} media` : ""}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-slate-950">
                        {e.title}
                      </h3>

                      <p className="text-sm text-slate-700 line-clamp-2">
                        {e.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <button
                        onClick={() => requestDelete(e)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition"
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
          title={deleting ? "Deleting…" : "Delete this entry?"}
          description={
            pendingDelete
              ? `This will permanently remove “${pendingDelete.title}”. This can’t be undone.`
              : undefined
          }
          confirmLabel={deleting ? "Deleting…" : "Yes, delete"}
          onClose={() => {
            if (deleting) return;
            setConfirmOpen(false);
            setPendingDelete(null);
          }}
          onConfirm={() => {
            if (deleting) return;
            deleteEntryConfirmed();
          }}
          danger
        />
      </div>
    </AdminAuthGuard>
  );
}
