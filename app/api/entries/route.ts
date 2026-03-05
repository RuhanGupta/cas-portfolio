// app/api/entries/route.ts
import { NextResponse } from "next/server";
import {
  createEntry,
  listEntries,
  EntryKind,
  MediaItem,
  CasEntryDB,
} from "@/lib/casModel";

export interface CasEntryDTO {
  id: string;          // string ID for frontend
  kind: EntryKind;
  title: string;
  description: string;
  week?: number | null;
  createdAt: string;   // ISO string over the wire
  entryDate?: string;  // 👈 NEW: explicit date of activity, if set
  media: MediaItem[];
}

function toDTO(doc: CasEntryDB): CasEntryDTO {
  return {
    id: doc.id,
    kind: doc.kind,
    title: doc.title,
    description: doc.description,
    week: doc.week ?? null,
    createdAt: doc.createdAt.toISOString(),
    entryDate: doc.entryDate ? doc.entryDate.toISOString() : undefined, // 👈 NEW
    media: doc.media ?? [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind") as EntryKind | null;

    const docs = await listEntries(kind ?? undefined);
    const entries = docs.map(toDTO);
    return NextResponse.json(entries);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list entries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kind, title, description, week, media, entryDate } = body; // 👈 NEW: entryDate

    if (!kind || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const saved = await createEntry({
      kind,
      title,
      description,
      week: week ?? null,
      media: media ?? [],
      entryDate: entryDate || null, // 👈 pass through (can be null)
    });

    return NextResponse.json(toDTO(saved), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create entry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
