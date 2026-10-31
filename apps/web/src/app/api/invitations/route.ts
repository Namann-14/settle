import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    return NextResponse.json(await backendFetch("/invitations"));
  } catch (error) {
    return backendErrorResponse(error);
  }
}
