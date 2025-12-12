"use client";

import { useEffect, useState } from "react";
import type { CasEntryDB, MediaItem } from "@/lib/casModel";

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
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
        Strand · {strand}
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-slate-600">{description}</p>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </header>
  );
}

export default function ConversationsPage() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries?kind=conversation");
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-7">
      <PageHeader
        strand="CAS Conversations"
        title="Conversation logs"
        description="Audio-based reflections documenting termly CAS progress. Uploaded via the Admin panel."
      />

      {entries.length === 0 && (
        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
          No CAS conversations yet. Create one in the Admin panel.
        </div>
      )}

      <section className="grid gap-4">
        {entries.map((entry: any) => {
          const audios: MediaItem[] =
            entry.media?.filter((m: any) => m.kind === "audio") ?? [];
          const dateToShow =
            (entry.entryDate as string | undefined) || entry.createdAt;

          return (
            <article
              key={entry.id}
              className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {entry.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(dateToShow).toLocaleDateString()}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-sky-700">
                  conversation
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {entry.description}
              </p>

              {audios.length > 0 && (
                <div className="mt-5 space-y-3">
                  {audios.map((audio, idx) => (
                    <div
                      key={audio.url}
                      className="rounded-2xl border border-black/5 bg-white p-4"
                    >
                      <p className="text-xs text-slate-500 mb-2">
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
