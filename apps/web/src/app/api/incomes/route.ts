import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.toString();
    return NextResponse.json(await backendFetch(`/incomes${search ? `?${search}` : ""}`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      await backendFetch("/incomes", { method: "POST", body: JSON.stringify(body) }),
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
