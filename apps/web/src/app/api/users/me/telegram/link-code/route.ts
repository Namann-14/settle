import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function POST() {
  try {
    const code = await backendFetch("/users/me/telegram/link-code", { method: "POST" });
    return NextResponse.json(code);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
