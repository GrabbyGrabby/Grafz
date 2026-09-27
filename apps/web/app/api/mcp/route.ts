import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return new NextResponse(
    "event: info\ndata: Grafz MCP SSE endpoint initialized.\n\n",
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ success: true, message: "MCP message received" });
}
