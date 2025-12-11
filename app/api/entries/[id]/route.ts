// app/api/entries/[id]/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * DELETE /api/entries/:id
 * Used by the Admin page to delete an entry by its app-level `id` field.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const collection = db.collection("entries");

    // You store your own string `id`, so delete by that, NOT by _id/ObjectId
    const result = await collection.deleteOne({ id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/entries/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
