import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    return NextResponse.json(await backendFetch(`/groups/${id}/balances`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}
