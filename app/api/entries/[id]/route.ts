// app/api/entries/[id]/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const db = await getDb();
    const collection = db.collection("entries");

    // delete by our own string id, not _id
    const result = await collection.deleteOne({ id });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
