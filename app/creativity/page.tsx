"use client";

import { useEffect, useState } from "react";
import type { CasEntryDB } from "@/lib/casModel";

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

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-7">
      <PageHeader
        strand="Creativity"
        title="Creativity reflections"
        description="Weekly creativity experiences documented with photos and reflections."
      />

      {entries.length === 0 && (
        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 text-sm text-slate-600">
          No creativity entries yet. Create one in the Admin panel.
        </div>
      )}

      <section className="grid gap-4">
        {entries.map((e: any) => {
          const firstImage = e.media?.find((m: any) => m.kind === "image");
          const dateToShow = (e.entryDate as string | undefined) || e.createdAt;

          return (
            <article
              key={e.id}
              className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
            >
              {firstImage && (
                <img
                  src={firstImage.url}
                  alt={firstImage.name}
                  className="w-full max-h-[520px] object-contain rounded-3xl border border-black/5 bg-white"
                />
              )}

              <div className="mt-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {e.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(dateToShow).toLocaleDateString()}
                    {e.week ? ` · Week ${e.week}` : ""}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-indigo-700">
                  creativity
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {e.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
