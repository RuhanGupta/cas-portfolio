import type { EntryKind, MediaItem } from "./casModel";

export interface CasEntryDTO {
  id: string;
  kind: EntryKind;
  title: string;
  description: string;
  week?: number | null;
  createdAt: string;
  entryDate?: string;
  media: MediaItem[];
}

export async function fetchEntries(kind?: EntryKind): Promise<CasEntryDTO[]> {
  const url = kind ? `/api/entries?kind=${encodeURIComponent(kind)}` : "/api/entries";
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `Failed to load entries (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid API response: expected an array of entries.");
  }

  return data as CasEntryDTO[];
}
