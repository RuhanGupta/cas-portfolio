// app/api/entries/[id]/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// sanity GET – just to confirm the route works
export async function GET(_req: Request, ctx: any) {
  const { id } = ctx.params;
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(_req: Request, ctx: any) {
  const { id } = ctx.params;

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
