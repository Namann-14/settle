import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await backendFetch(`/budgets/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
