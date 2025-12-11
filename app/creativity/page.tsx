"use client";

import { useEffect, useState } from "react";
import type { CasEntryDB } from "@/lib/casModel";

export default function CreativityPage() {
  const [entries, setEntries] = useState<CasEntryDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries?kind=creativity");
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading…</p>;
  }

  // inside CreativityPage return, replace the top <div> with:

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Strand · Creativity
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Creativity Reflections
          </span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          Weekly creativity experiences documented with photos and reflections.
          All entries are created in the Admin Panel.
        </p>
      </header>

      {entries.length === 0 && (
        <p className="text-slate-500 text-sm">
          No creativity entries yet. Create one in the Admin Panel.
        </p>
      )}

      <section className="space-y-4">
        {entries.map((e: any) => {
          const firstImage = e.media?.find((m: any) => m.kind === "image");
          const dateToShow = (e.entryDate as string | undefined) || e.createdAt; // 👈 NEW

          return (
            <article
              key={e.id}
              className="border border-white/10 bg-slate-950/40 rounded-2xl p-4 md:p-5 hover:border-indigo-300/40 hover:bg-slate-900/80 transition shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            >
              {firstImage && (
                <img
                  src={firstImage.url}
                  alt={firstImage.name}
                  className="w-full max-h-[480px] h-auto object-contain rounded-2xl mb-4 border border-white/10 bg-black/10"
                />
              )}
              <h3 className="font-semibold text-xl mb-1 text-slate-50">
                {e.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {new Date(dateToShow).toLocaleDateString()}{" "}
                {e.week ? `· Week ${e.week}` : ""}
              </p>
              <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                {e.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
