import { NextResponse } from "next/server";
import { aiErrorStatus, aiFetchJson } from "@/lib/ai";
import type { ChatThreadSummary } from "@/lib/chat-types";

export async function GET() {
  try {
    const { threads } = await aiFetchJson<{ threads: ChatThreadSummary[] }>("/chat/threads");
    return NextResponse.json(threads);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ message }, { status: aiErrorStatus(error) });
  }
}
