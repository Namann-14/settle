import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    return NextResponse.json(await backendFetch(`/groups/join/${encodeURIComponent(code)}`));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    return NextResponse.json(
      await backendFetch(`/groups/join/${encodeURIComponent(code)}`, { method: "POST" }),
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
