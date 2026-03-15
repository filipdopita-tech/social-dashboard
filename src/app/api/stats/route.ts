import { NextResponse } from "next/server";
import { getStats } from "@/lib/sheets";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/stats error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
