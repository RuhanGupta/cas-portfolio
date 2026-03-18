"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";
import {
  EmptyState,
  EntryCard,
  ErrorState,
  LoadingState,
  PageHero,
  STRAND_META,
  StatTile,
} from "@/components/portfolio";

export default function Dashboard() {
  const [entries, setEntries] = useState<CasEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const summary = useMemo(() => {
    const latestEntry = entries[0];

    return {
      total: entries.length,
      strands: new Set(entries.map((entry) => entry.kind)).size,
      latestDate: latestEntry
        ? new Date(latestEntry.entryDate || latestEntry.createdAt).toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          )
        : "Not yet started",
      recent: entries.slice(0, 3),
    };
  }, [entries]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Ruhan Gupta · CAS Portfolio"
        title="A quiet record of creativity, activity, service, and reflection."
        description="This portfolio is meant to feel restrained and readable: a simple archive of work, evidence, and growth across the CAS journey."
        actions={
          <>
            <Link href="/creativity" className="action-button">
              View portfolio
            </Link>
            <Link href="/admin/new" className="action-button-secondary">
              Add entry
            </Link>
          </>
        }
        aside={
          <div className="space-y-3">
            <p className="kicker">Overview</p>
            <StatTile label="Entries" value={summary.total} />
            <StatTile label="Latest" value={summary.latestDate} />
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Archive" value={summary.total} hint="published entries" />
        <StatTile label="Strands" value={summary.strands} hint="active categories" />
        <StatTile label="Latest" value={summary.latestDate} hint="most recent reflection" />
      </section>

      <section className="site-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">Strands</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              Browse the archive by focus area.
            </h2>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {Object.entries(STRAND_META).map(([kind, meta]) => (
            <Link
              key={kind}
              href={meta.href}
              className="rounded-full border border-border/70 bg-popover/70 px-4 py-2 text-sm text-foreground transition hover:bg-card"
            >
              {meta.label}
            </Link>
          ))}
        </div>
      </section>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading portfolio entries..." />
      ) : summary.recent.length === 0 ? (
        <EmptyState
          title="No entries yet."
          description="Add the first reflection from the admin area to start building the portfolio."
        />
      ) : (
        <section className="space-y-4">
          <div>
            <p className="kicker">Recent work</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              A small selection from the latest entries.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {summary.recent.map((entry, index) => (
              <EntryCard key={entry.id} entry={entry} featured={index === 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
