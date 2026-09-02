"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EntryKind, MediaItem } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { PageHero, StatTile } from "@/components/portfolio";

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

  const response = await fetch(url, { method: "POST", body: form });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();
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
    <section className="site-panel p-5 sm:p-6">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
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
  const [entryDate, setEntryDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  const isConversation = kind === "conversation";

  const wordCount = useMemo(() => {
    const text = description.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [description]);

  const wordLimit = 150;
  const progress = Math.min(100, Math.round((wordCount / wordLimit) * 100));

  const handleImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file, "image");
        return { kind: "image" as const, name: file.name, url };
      });

      const results = await Promise.all(uploads);
      setMedia((current) => [...current, ...results]);
    } finally {
      setUploading(false);
    }
  };

  const handleAudio = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file, "video");
        return { kind: "audio" as const, name: file.name, url };
      });

      const results = await Promise.all(uploads);
      setMedia((current) => [...current, ...results]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSaving(true);

    const response = await fetch("/api/entries", {
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

    if (!response.ok) {
      console.error("Failed to save entry", await response.text());
      return;
    }

    if (kind === "creativity") router.push("/creativity");
    else if (kind === "activity") router.push("/activity");
    else if (kind === "service") router.push("/service");
    else if (kind === "project") router.push("/project");
    else router.push("/conversations");
  };

  const uploadedCount = media.length;

  return (
    <AdminAuthGuard>
      <div className="space-y-8">
        <PageHero
          eyebrow="Admin · New entry"
          title="Compose a new portfolio entry with the same editorial feel."
          description="This editor keeps the content workflow practical while pushing the final result toward concise reflections, strong evidence, and cleaner presentation."
          actions={
            <Link href="/admin" className="action-button-secondary">
              Back to admin
            </Link>
          }
          aside={
            <div className="grid gap-3">
              <StatTile label="Words" value={`${wordCount}/${wordLimit}`} />
              <StatTile label="Uploads" value={uploadedCount} />
              <StatTile label="Type" value={isConversation ? "Conversation" : kind} />
            </div>
          }
        />

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <SectionCard
              title="Basics"
              subtitle="Set the strand, title, date, and other structural details first."
            >
              <div className="grid gap-4">
                <div>
                  <label className="field-label" htmlFor="entry-kind">
                    Entry type
                  </label>
                  <select
                    id="entry-kind"
                    value={kind}
                    onChange={(event) => {
                      setKind(event.target.value as EntryKind);
                      setMedia([]);
                    }}
                    className="form-field mt-2"
                  >
                    <option value="creativity">Creativity</option>
                    <option value="activity">Activity</option>
                    <option value="service">Service</option>
                    <option value="project">Project Week</option>
                    <option value="conversation">CAS Conversation</option>
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="entry-title">
                    Title
                  </label>
                  <input
                    id="entry-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={
                      isConversation
                        ? "e.g. Term 1 CAS Conversation"
                        : "e.g. Designing a school play poster"
                    }
                    className="form-field mt-2"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="entry-date">
                    Date of activity
                  </label>
                  <input
                    id="entry-date"
                    type="date"
                    value={entryDate}
                    onChange={(event) => setEntryDate(event.target.value)}
                    className="form-field mt-2"
                  />
                </div>

                {!isConversation ? (
                  <div>
                    <label className="field-label" htmlFor="entry-week">
                      Week
                    </label>
                    <input
                      id="entry-week"
                      type="number"
                      value={week}
                      onChange={(event) => setWeek(event.target.value)}
                      placeholder="Optional"
                      className="form-field mt-2"
                    />
                  </div>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title={isConversation ? "Conversation audio" : "Evidence uploads"}
              subtitle={
                isConversation
                  ? "Upload one or more audio recordings."
                  : "Upload photo evidence to support the reflection."
              }
            >
              <div className="space-y-4">
                <input
                  type="file"
                  accept={isConversation ? "audio/*" : "image/*"}
                  multiple
                  onChange={isConversation ? handleAudio : handleImages}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-popover file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground"
                />

                {uploading ? (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                ) : null}

                {media.length > 0 ? (
                  <div className="soft-panel p-4">
                    <p className="field-label">Uploaded files</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {media.map((item) => (
                        <li key={item.url} className="truncate">
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard
              title={isConversation ? "Conversation summary" : "Reflection"}
              subtitle={
                isConversation
                  ? "Capture what was discussed and what changed next."
                  : "Describe the work, what you learned, and what you would improve."
              }
            >
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={
                  isConversation
                    ? "Summarise what was discussed in the CAS conversation..."
                    : "Describe the experience, learning points, challenges, and next steps..."
                }
                className="form-field min-h-[20rem] resize-y"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Aim for concise, specific reflections.
                </p>
                <div className="w-full max-w-xs">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <section className="site-panel p-5 sm:p-6">
              <button
                type="submit"
                disabled={saving || uploading}
                className="action-button w-full disabled:opacity-60"
              >
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save entry"}
              </button>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The entry will appear automatically in the relevant strand page
                after it is saved.
              </p>
            </section>
          </div>
        </form>
      </div>
    </AdminAuthGuard>
  );
}
