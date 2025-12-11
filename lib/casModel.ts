// lib/casModel.ts
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export type EntryKind = "creativity" | "activity" | "service" | "conversation";

export interface MediaItem {
  kind: "image" | "audio";
  name: string;
  url: string;
}

export interface CasEntryDB {
  _id: ObjectId;       // Mongo's internal id (we don't use this on the frontend)
  id: string;          // our app id (string)
  kind: EntryKind;
  title: string;
  description: string;
  week?: number | null;
  createdAt: Date;
  entryDate?: Date | null; // 👈 NEW: explicit date of activity / conversation
  media: MediaItem[];
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export async function createEntry(data: {
  kind: EntryKind;
  title: string;
  description: string;
  week?: number | null;
  media: MediaItem[];
  entryDate?: string | null; // 👈 NEW: comes in as string (e.g. "2025-01-02")
}): Promise<CasEntryDB> {
  const db = await getDb();
  const collection = db.collection<CasEntryDB>("entries");

  const baseDoc = {
    id: makeId(),
    kind: data.kind,
    title: data.title,
    description: data.description,
    week: data.week ?? null,
    createdAt: new Date(),
    entryDate: data.entryDate ? new Date(data.entryDate) : null, // 👈 NEW
    media: data.media ?? [],
  };

  const res = await collection.insertOne(baseDoc as any);

  return {
    _id: res.insertedId,
    ...baseDoc,
  };
}

export async function listEntries(kind?: EntryKind): Promise<CasEntryDB[]> {
  const db = await getDb();
  const collection = db.collection<CasEntryDB>("entries");
  const query = kind ? { kind } : {};
  const docs = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  return docs;
}
