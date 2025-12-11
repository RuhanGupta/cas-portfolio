export type EntryType = "creativity" | "activity" | "service" | "conversation";

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  week?: number;
  snippet: string;
}

export const entries: Entry[] = [
  {
    id: "1",
    type: "creativity",
    title: "Poster Design",
    week: 5,
    snippet: "Worked on colour palettes and typography...",
  },
  {
    id: "2",
    type: "activity",
    title: "Netball Training",
    week: 5,
    snippet: "Practiced footwork drills and endurance...",
  },
  {
    id: "3",
    type: "service",
    title: "Volunteering",
    week: 5,
    snippet: "Helped pack exam care packages...",
  },
  {
    id: "4",
    type: "conversation",
    title: "Term 1 CAS Conversation",
    snippet: "Talked about my progress in all strands...",
  },
];
