import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      await backendFetch("/recurring/sync", { method: "POST", body: JSON.stringify(body) }),
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
