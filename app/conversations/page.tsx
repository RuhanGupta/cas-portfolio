"use client";

import { useEffect, useState } from "react";
import type { CasEntryDB, MediaItem } from "@/lib/casModel";

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

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Strand · CAS Conversations
        </p>

        <h2 className="text-3xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
            CAS Conversation Logs
          </span>
        </h2>

        <p className="text-slate-400 text-sm max-w-2xl">
          Audio-based reflections documenting termly CAS progress. Uploaded via
          the Admin Panel and stored with Cloudinary.
        </p>
      </header>

      {/* No entries */}
      {entries.length === 0 && (
        <p className="text-slate-500 text-sm">
          No CAS conversations yet. Create one in the Admin Panel.
        </p>
      )}

      {/* Entries */}
      <section className="space-y-4">
        {entries.map((entry: any) => {
          const audios: MediaItem[] =
            entry.media?.filter((m: any) => m.kind === "audio") ?? [];
          const dateToShow =
            (entry.entryDate as string | undefined) || entry.createdAt; // 👈 NEW

          return (
            <article
              key={entry.id}
              className="border border-white/10 bg-slate-950/40 rounded-2xl p-5 hover:border-emerald-300/40 hover:bg-slate-900/80 transition shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            >
              {/* Title */}
              <h3 className="font-semibold text-xl mb-1 text-slate-50">
                {entry.title}
              </h3>

              {/* Date */}
              <p className="text-xs text-slate-400 mb-3">
                {new Date(dateToShow).toLocaleDateString()}
              </p>

              {/* Description */}
              <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed mb-4">
                {entry.description}
              </p>

              {/* Audio Players */}
              {audios.length > 0 && (
                <div className="space-y-4">
                  {audios.map((audio, idx) => (
                    <div
                      key={audio.url}
                      className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
                    >
                      <p className="text-xs text-slate-400 mb-2">
                        Audio {idx + 1} — {audio.name}
                      </p>

                      <audio
                        controls
                        src={audio.url}
                        className="w-full h-10 rounded-lg bg-slate-800"
                      />
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
