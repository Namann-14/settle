import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const data = await backendFetch("/categories");
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await backendFetch("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
