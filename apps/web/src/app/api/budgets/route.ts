import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.toString();
    return NextResponse.json(await backendFetch(`/budgets${search ? `?${search}` : ""}`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      await backendFetch("/budgets", { method: "PUT", body: JSON.stringify(body) }),
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
