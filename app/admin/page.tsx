"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";
import type { EntryKind } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import {
  cn,
  ErrorState,
  PageHero,
  StatTile,
  StrandBadge,
} from "@/components/portfolio";

type AdminEntry = CasEntryDTO;

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
    <div className="fixed inset-0 z-50 px-4 py-10">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative mx-auto max-w-lg">
        <div className="site-panel p-6">
          <p className="kicker">Confirm action</p>
          <h3 className="mt-3 font-serif text-3xl text-foreground">{title}</h3>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="action-button-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={danger ? "danger-button" : "action-button"}
            >
              {confirmLabel ?? "Confirm"}
            </button>
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

    void load();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries
      .filter((entry) => (kindFilter === "all" ? true : entry.kind === kindFilter))
      .filter((entry) => {
        if (!normalizedQuery) return true;
        return (
          entry.title.toLowerCase().includes(normalizedQuery) ||
          entry.description.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [entries, kindFilter, query]);

  function requestDelete(entry: AdminEntry) {
    setPendingDelete(entry);
    setConfirmOpen(true);
  }

  async function deleteEntryConfirmed() {
    if (!pendingDelete) return;
    setDeleting(true);

    const response = await fetch(`/api/entries/${pendingDelete.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (response.ok) {
      setEntries((current) => current.filter((entry) => entry.id !== pendingDelete.id));
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }

    const responseText = await response.text();
    console.error("Delete failed:", responseText);
    alert("Error deleting entry.");
  }

  const totalMedia = useMemo(
    () => entries.reduce((total, entry) => total + entry.media.length, 0),
    [entries]
  );

  return (
    <AdminAuthGuard>
      <div className="space-y-8">
        <PageHero
          eyebrow="Admin"
          title="Manage the portfolio archive without breaking the aesthetic."
          description="This workspace keeps the editing experience practical while staying inside the same Kodama Grove visual system as the public portfolio."
          actions={
            <Link href="/admin/new" className="action-button">
              New entry
            </Link>
          }
          aside={
            <div className="grid gap-3">
              <StatTile label="Entries" value={entries.length} />
              <StatTile label="Media" value={totalMedia} />
              <StatTile label="Visible now" value={filtered.length} />
            </div>
          }
        />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="site-panel p-5 sm:p-6">
            <label className="field-label" htmlFor="admin-search">
              Search entries
            </label>
            <input
              id="admin-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles or reflections..."
              className="form-field mt-2"
            />
          </div>

          <div className="site-panel p-5 sm:p-6">
            <label className="field-label" htmlFor="kind-filter">
              Filter strand
            </label>
            <select
              id="kind-filter"
              value={kindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as EntryKind | "all")
              }
              className="form-field mt-2"
            >
              <option value="all">All strands</option>
              <option value="creativity">Creativity</option>
              <option value="activity">Activity</option>
              <option value="service">Service</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="site-panel p-6 text-sm text-muted-foreground">
            Loading entries...
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <div className="site-panel p-6 text-sm text-muted-foreground">
            No entries match the current filters.
          </div>
        ) : (
          <section className="space-y-4">
            {filtered.map((entry) => {
              const dateToShow = entry.entryDate || entry.createdAt;
              const dateLabel = new Date(dateToShow).toLocaleDateString();

              return (
                <article key={entry.id} className="site-panel p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StrandBadge kind={entry.kind} />
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {dateLabel}
                          {entry.week ? ` · Week ${entry.week}` : ""}
                          {entry.media.length ? ` · ${entry.media.length} assets` : ""}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl text-foreground">
                        {entry.title}
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => requestDelete(entry)}
                        className={cn("danger-button", deleting && "opacity-60")}
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
              ? `This will permanently remove "${pendingDelete.title}". This cannot be undone.`
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
