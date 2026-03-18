"use client";

import { useEffect, useMemo, useState } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";
import type { EntryKind } from "@/lib/casModel";
import {
  EmptyState,
  EntryCard,
  ErrorState,
  LoadingState,
  PageHero,
  STRAND_META,
  StatTile,
} from "@/components/portfolio";

export default function EntryCollectionPage({
  kind,
  eyebrow,
  title,
  description,
}: {
  kind: EntryKind;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [entries, setEntries] = useState<CasEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEntries(kind);
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
  }, [kind]);

  const mediaCount = useMemo(
    () => entries.reduce((total, entry) => total + entry.media.length, 0),
    [entries]
  );

  const latestDate = useMemo(() => {
    if (entries.length === 0) return "Not available";
    const latest = entries
      .map((entry) => new Date(entry.entryDate || entry.createdAt).getTime())
      .sort((a, b) => b - a)[0];

    return new Date(latest).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [entries]);

  const meta = STRAND_META[kind];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={
          <div className="space-y-4">
            <p className="kicker">{meta.label} at a glance</p>
            <StatTile label="Entries" value={entries.length} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <StatTile label="Evidence" value={mediaCount} />
              <StatTile label="Latest" value={latestDate} />
            </div>
          </div>
        }
      />

      {loading ? (
        <LoadingState label={`Loading ${meta.label.toLowerCase()} entries...`} />
      ) : error ? (
        <ErrorState message={error} />
      ) : entries.length === 0 ? (
        <EmptyState
          title={`No ${meta.label.toLowerCase()} entries yet.`}
          description="Use the admin area to add your first reflection and supporting evidence."
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {entries.map((entry, index) => (
            <EntryCard key={entry.id} entry={entry} featured={index === 0} />
          ))}
        </section>
      )}
    </div>
  );
}
