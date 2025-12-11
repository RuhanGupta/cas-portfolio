"use client";

import { useEffect, useState } from "react";
import type { EntryKind, MediaItem } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";


type AdminEntry = {
  id: string;
  kind: EntryKind;
  title: string;
  description: string;
  createdAt: string;
  week?: number | null;
  media: MediaItem[];
};

export default function AdminPage() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/entries");
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    load();
  }, []);

  async function deleteEntry(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });

    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      const errText = await res.text();
      console.error("Delete failed:", errText);
      alert("Error deleting entry.");
    }
  }

  return (
    <AdminAuthGuard>
        <div className="space-y-6">
        <h2 className="text-3xl font-semibold">Admin Panel</h2>
        <p className="text-gray-400">
            Manage all CAS entries and create new reflections.
        </p>

        <a
            href="/admin/new"
            className="inline-block rounded-xl px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
            + New Entry
        </a>

        {loading ? (
            <p className="text-gray-500 text-sm">Loading entries…</p>
        ) : (
            <section className="space-y-3">
            {entries.map((e, idx) => (
                <article
                    key={e.id ?? `admin-entry-${idx}`}
                    className="border border-white/10 rounded-xl bg-slate-900/60 p-4 flex justify-between items-center"
                >
                    <div>
                    <h4 className="font-medium text-slate-100">{e.title}</h4>
                    <p className="text-xs text-slate-400">
                        {e.kind} · {new Date(e.createdAt).toLocaleDateString()}
                    </p>
                    </div>

                    <button
                    onClick={() => deleteEntry(e.id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition"
                    >
                    Delete
                    </button>
                </article>
                ))}
            </section>
        )}
        </div>
    </AdminAuthGuard>
  );
}
