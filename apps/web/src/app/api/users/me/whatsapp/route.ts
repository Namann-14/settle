import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function DELETE() {
  try {
    await backendFetch("/users/me/whatsapp", { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
