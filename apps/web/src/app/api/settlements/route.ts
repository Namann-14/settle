import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.toString();
    const data = await backendFetch(`/settlements${search ? `?${search}` : ""}`);
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await backendFetch("/settlements", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
