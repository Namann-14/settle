import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    return NextResponse.json(await backendFetch(`/groups/${id}/join-link`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

// Resets the link (admins only); the old one stops working.
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    return NextResponse.json(await backendFetch(`/groups/${id}/join-link`, { method: "POST" }));
  } catch (error) {
    return backendErrorResponse(error);
  }
}
