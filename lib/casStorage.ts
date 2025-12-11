// lib/casStorage.ts
"use client";

import { useEffect, useState } from "react";

export type EntryKind = "creativity" | "activity" | "service" | "conversation";

export type MediaKind = "image" | "audio";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  name: string;
  dataUrl: string; // base64 data URL
}

export interface CasEntry {
  id: string;
  kind: EntryKind;
  title: string;
  description: string;
  createdAt: string; // ISO string
  week?: number | null;
  media: MediaItem[];
}

const STORAGE_KEY = "casEntries";

function safeParse(json: string | null): CasEntry[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as CasEntry[];
    return [];
  } catch {
    return [];
  }
}

export function loadEntriesFromStorage(): CasEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
}

export function saveEntriesToStorage(entries: CasEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeEntryId() {
  return makeId("entry");
}

export function makeMediaId() {
  return makeId("media");
}

export function useCasEntries() {
  const [entries, setEntries] = useState<CasEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadEntriesFromStorage();
    setEntries(stored);
    setLoaded(true);
  }, []);

  const addEntry = (entry: CasEntry) => {
    setEntries((prev) => {
      const next = [...prev, entry];
      saveEntriesToStorage(next);
      return next;
    });
  };

  return { entries, loaded, addEntry };
}
