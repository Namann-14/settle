import { NextResponse } from "next/server";
import { aiErrorResponse, aiFetchJson } from "@/lib/ai";
import type { ExpenseDraft } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = await aiFetchJson<ExpenseDraft>("/expenses/from-text", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(draft);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
