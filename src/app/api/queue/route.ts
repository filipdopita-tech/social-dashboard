import { NextRequest, NextResponse } from "next/server";
import { getQueueItems, addQueueItem } from "@/lib/sheets";

export async function GET() {
  try {
    const items = await getQueueItems();
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/queue error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await addQueueItem({
      datum: body.datum || "",
      cas: body.cas || "",
      platforma: body.platforma || "",
      typ: body.typ || "post",
      caption: body.caption || "",
      mediaFile: body.mediaFile || "",
      status: body.status || "pending",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/queue error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
