import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.toString();
    return NextResponse.json(await backendFetch(`/spending/summary${search ? `?${search}` : ""}`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}
