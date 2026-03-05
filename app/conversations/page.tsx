"use client";

import { useEffect, useState } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import { fetchEntries } from "@/lib/apiEntries";

function PageHeader({
  strand,
  title,
  description,
}: {
  strand: string;
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-3">
      <p className="kicker">Strand · {strand}</p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-slate-300">{description}</p>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-200/35 to-transparent" />
    </header>
  );
}

export default function ConversationsPage() {
  const [entries, setEntries] = useState<CasEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEntries("conversation");
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

  if (loading) return <p className="text-sm text-slate-300">Loading...</p>;
  if (error) return <p className="text-sm text-rose-200">Error: {error}</p>;

  return (
    <div className="space-y-7">
      <PageHeader
        strand="CAS Conversations"
        title="Conversation logs"
        description="Audio-based reflections documenting termly CAS progress. Uploaded via the Admin panel."
      />

      {entries.length === 0 && (
        <div className="panel p-6 text-sm text-slate-300">
          No CAS conversations yet. Create one in the Admin panel.
        </div>
      )}

      <section className="grid gap-4">
        {entries.map((entry) => {
          const audios = entry.media.filter((m) => m.kind === "audio");
          const dateToShow = entry.entryDate || entry.createdAt;

          return (
            <article key={entry.id} className="panel p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {entry.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(dateToShow).toLocaleDateString()}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-rose-300/35 bg-rose-300/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-rose-100">
                  conversation
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {entry.description}
              </p>

              {audios.length > 0 && (
                <div className="mt-5 space-y-3">
                  {audios.map((audio, idx) => (
                    <div key={audio.url} className="panel-soft p-4">
                      <p className="mb-2 text-xs text-slate-400">
                        Audio {idx + 1} — {audio.name}
                      </p>
                      <audio controls src={audio.url} className="w-full" />
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
