"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { EntryKind, MediaItem } from "@/lib/casModel";
import AdminAuthGuard from "@/components/AdminAuthGuard";


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

  const res = await fetch(url, {
    method: "POST",
    body: form, 
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
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

  const [entryDate, setEntryDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD default today
    );


  const handleImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file, "image");
        return {
          kind: "image" as const,
          name: file.name,
          url,
        };
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
        const url = await uploadToCloudinary(file, "video"); // audio treated as video
        return {
          kind: "audio" as const,
          name: file.name,
          url,
        };
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

    // Redirect based on type
    if (kind === "creativity") router.push("/creativity");
    else if (kind === "activity") router.push("/activity");
    else if (kind === "service") router.push("/service");
    else router.push("/conversations");
  };

  return (
    <AdminAuthGuard>
        <div className="space-y-6 max-w-xl">
        <h2 className="text-3xl font-semibold">Create New Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Entry type */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Entry Type</label>
            <select
                value={kind}
                onChange={(e) => {
                setKind(e.target.value as EntryKind);
                setMedia([]); // reset media when switching type
                }}
                className="border rounded-lg px-3 py-2 w-full"
            >
                <option value="creativity">Creativity</option>
                <option value="activity">Activity</option>
                <option value="service">Service</option>
                <option value="conversation">CAS Conversation</option>
            </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
                className="border rounded-lg px-3 py-2 w-full"
                placeholder={
                isConversation
                    ? "e.g. Term 1 CAS Conversation"
                    : "e.g. Designing school play poster"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            </div>

            {/* Date */}
            <div className="space-y-2">
            <label className="text-sm font-medium">Date of activity / entry</label>
            <input
                type="date"
                className="border rounded-lg px-3 py-2 w-full"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
            />
            <p className="text-[0.7rem] text-gray-500">
                Use the date the CAS experience happened (or the CAS conversation took place).
            </p>
            </div>


            {/* Week (only for Creativity/Activity/Service) */}
            {!isConversation && (
            <div className="space-y-2">
                <label className="text-sm font-medium">
                Week (optional, numeric)
                </label>
                <input
                type="number"
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="e.g. 5"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                />
            </div>
            )}

            {/* Description / Notes + Word Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isConversation ? "Conversation notes" : "Reflection"}
              </label>

              <textarea
                className="border rounded-lg px-3 py-2 w-full h-40"
                placeholder={
                  isConversation
                    ? "Summarise what you discussed in the CAS conversation..."
                    : "What you did, what you learned, challenges, next steps..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Word count */}
              <p className="text-xs text-gray-500 text-right">
                {description.trim() === ""
                  ? "0/150 words"
                  : `${description.trim().split(/\s+/).length}/150 words`}
              </p>
            </div>


            {/* Images for Creativity/Activity/Service */}
            {!isConversation && (
            <div className="space-y-2">
                <label className="text-sm font-medium">
                Photos (uploaded to Cloudinary)
                </label>
                <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="text-sm"
                />
                {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading…</p>
                )}
                {media.some((m) => m.kind === "image") && (
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {media
                    .filter((m) => m.kind === "image")
                    .map((m) => (
                        <li key={m.url}>• {m.name}</li>
                    ))}
                </ul>
                )}
            </div>
            )}

            {/* Audio for CAS Conversations */}
            {isConversation && (
            <div className="space-y-2">
                <label className="text-sm font-medium">
                Conversation audio (uploaded to Cloudinary)
                </label>
                <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudio}
                className="text-sm"
                />
                {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading…</p>
                )}
                {media.some((m) => m.kind === "audio") && (
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {media
                    .filter((m) => m.kind === "audio")
                    .map((m) => (
                        <li key={m.url}>• {m.name}</li>
                    ))}
                </ul>
                )}
            </div>
            )}

            {/* Submit */}
            <button
            type="submit"
            disabled={saving || uploading}
            className="w-full text-center bg-indigo-600 text-white py-2 rounded-xl disabled:opacity-60"
            >
            {saving ? "Saving..." : "Save Entry"}
            </button>
        </form>
        </div>
    </AdminAuthGuard>
  );
}
