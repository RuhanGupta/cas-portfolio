"use client";

import { useMemo, useState, ChangeEvent, FormEvent } from "react";
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
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
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
    const t = description.trim();
    return t ? t.split(/\s+/).length : 0;
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
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
              Admin · New entry
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
              Create a new entry
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Keep it clean and presentable — this form is styled like a
              portfolio tool, not a “developer panel”.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-white transition"
          >
            ← Back to Admin
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <SectionCard title="Basics" subtitle="Core details for the entry.">
              <div className="space-y-4">
                {/* Kind */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Entry type
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => {
                      setKind(e.target.value as EntryKind);
                      setMedia([]);
                    }}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-300"
                  >
                    <option value="creativity">Creativity</option>
                    <option value="activity">Activity</option>
                    <option value="service">Service</option>
                    <option value="conversation">CAS Conversation</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
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
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Date of activity / entry
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-300"
                  />
                  <p className="text-xs text-slate-500">
                    Use the date the experience happened (or the CAS
                    conversation took place).
                  </p>
                </div>

                {/* Week */}
                {!isConversation && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Week (optional)
                    </label>
                    <input
                      type="number"
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
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
                    className="text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-95"
                  />
                  {uploading && (
                    <p className="text-sm text-slate-500">Uploading…</p>
                  )}
                  {media.some((m) => m.kind === "image") && (
                    <div className="rounded-2xl border border-black/5 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Uploaded
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
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
                    className="text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-95"
                  />
                  {uploading && (
                    <p className="text-sm text-slate-500">Uploading…</p>
                  )}
                  {media.some((m) => m.kind === "audio") && (
                    <div className="rounded-2xl border border-black/5 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Uploaded
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
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

          {/* Right column */}
          <div className="space-y-4">
            <SectionCard
              title={isConversation ? "Conversation notes" : "Reflection"}
              subtitle={
                isConversation
                  ? "Summarise what you discussed — keep it clear and specific."
                  : "What you did, learned, challenges, and next steps."
              }
            >
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isConversation
                      ? "Summarise what you discussed in the CAS conversation…"
                      : "What you did, what you learned, challenges, next steps…"
                  }
                  className="min-h-[220px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                />

                {/* Word count + progress */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {wordCount}/{wordLimit} words
                  </p>
                  <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100 border border-black/5">
                    <div
                      className="h-full bg-slate-900"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <div className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] hover:opacity-95 disabled:opacity-60 transition"
              >
                {saving ? "Saving…" : uploading ? "Uploading…" : "Save entry"}
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Tip: Keep your reflection concise and evidence-driven for a
                clean portfolio look.
              </p>
            </div>
          </div>
        </form>
      </div>
    </AdminAuthGuard>
  );
}
