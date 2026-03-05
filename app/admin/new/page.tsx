"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EntryKind, MediaItem } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import Link from "next/link";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video"
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function NewEntryPage() {
  const router = useRouter();

  const [kind, setKind] = useState<EntryKind>("creativity");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [week, setWeek] = useState<string>("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isConversation = kind === "conversation";

  const [entryDate, setEntryDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  const wordCount = useMemo(() => {
    const text = description.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [description]);

  const wordLimit = 150;
  const progress = Math.min(100, Math.round((wordCount / wordLimit) * 100));

  const handleImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file, "image");
        return { kind: "image" as const, name: file.name, url };
      });

      const results = await Promise.all(uploads);
      setMedia((prev) => [...prev, ...results]);
    } finally {
      setUploading(false);
    }
  };

  const handleAudio = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file, "video");
        return { kind: "audio" as const, name: file.name, url };
      });

      const results = await Promise.all(uploads);
      setMedia((prev) => [...prev, ...results]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSaving(true);

    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        title: title.trim(),
        description: description.trim(),
        week: week ? Number(week) : null,
        media,
        entryDate,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      console.error("Failed to save entry", await res.text());
      return;
    }

    if (kind === "creativity") router.push("/creativity");
    else if (kind === "activity") router.push("/activity");
    else if (kind === "service") router.push("/service");
    else router.push("/conversations");
  };

  return (
    <AdminAuthGuard>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="kicker">Admin · New entry</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
              Create a new entry
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Build polished entries with strong reflections and evidence.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1]"
          >
            ← Back to Admin
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionCard title="Basics" subtitle="Core details for the entry.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Entry type
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => {
                      setKind(e.target.value as EntryKind);
                      setMedia([]);
                    }}
                    className="w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100"
                  >
                    <option value="creativity">Creativity</option>
                    <option value="activity">Activity</option>
                    <option value="service">Service</option>
                    <option value="conversation">CAS Conversation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      isConversation
                        ? "e.g. Term 1 CAS Conversation"
                        : "e.g. Designing a school play poster"
                    }
                    className="w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Date of activity / entry
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100"
                  />
                  <p className="text-xs text-slate-400">
                    Use the date when the experience happened.
                  </p>
                </div>

                {!isConversation && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Week (optional)
                    </label>
                    <input
                      type="number"
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title={isConversation ? "Conversation audio" : "Photos"}
              subtitle={
                isConversation
                  ? "Upload audio recordings (stored in Cloudinary)."
                  : "Upload evidence photos (stored in Cloudinary)."
              }
            >
              {!isConversation ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                    className="text-sm text-slate-300 file:mr-4 file:rounded-xl file:border file:border-cyan-300/35 file:bg-cyan-300/12 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-100 hover:file:bg-cyan-300/20"
                  />
                  {uploading && (
                    <p className="text-sm text-slate-300">Uploading...</p>
                  )}
                  {media.some((m) => m.kind === "image") && (
                    <div className="panel-soft p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Uploaded
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-300">
                        {media
                          .filter((m) => m.kind === "image")
                          .map((m) => (
                            <li key={m.url} className="truncate">
                              • {m.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleAudio}
                    className="text-sm text-slate-300 file:mr-4 file:rounded-xl file:border file:border-cyan-300/35 file:bg-cyan-300/12 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-100 hover:file:bg-cyan-300/20"
                  />
                  {uploading && (
                    <p className="text-sm text-slate-300">Uploading...</p>
                  )}
                  {media.some((m) => m.kind === "audio") && (
                    <div className="panel-soft p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Uploaded
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-300">
                        {media
                          .filter((m) => m.kind === "audio")
                          .map((m) => (
                            <li key={m.url} className="truncate">
                              • {m.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard
              title={isConversation ? "Conversation notes" : "Reflection"}
              subtitle={
                isConversation
                  ? "Summarise what you discussed with clear outcomes."
                  : "Capture actions, learning points, and next steps."
              }
            >
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isConversation
                      ? "Summarise what you discussed in the CAS conversation..."
                      : "What you did, what you learned, challenges, next steps..."
                  }
                  className="min-h-[220px] w-full rounded-2xl border border-white/15 bg-[#090f21] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
                />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    {wordCount}/{wordLimit} words
                  </p>
                  <div className="h-2 w-40 overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <div className="panel p-5">
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/12 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
              >
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save entry"}
              </button>

              <p className="mt-3 text-xs text-slate-400">
                Keep reflections concise and evidence-driven for a strong portfolio.
              </p>
            </div>
          </div>
        </form>
      </div>
    </AdminAuthGuard>
  );
}
