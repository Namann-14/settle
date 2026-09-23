import { NextResponse } from "next/server";
import { aiErrorResponse, aiFetchJson } from "@/lib/ai";
import type { ExpenseDraft } from "@/types";

// Multipart passthrough: forward the raw body with its original boundary
// rather than re-encoding the FormData.
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json({ message: "Expected multipart/form-data" }, { status: 400 });
    }
    const draft = await aiFetchJson<ExpenseDraft>("/expenses/from-voice", {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: await request.arrayBuffer(),
    });
    return NextResponse.json(draft);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
