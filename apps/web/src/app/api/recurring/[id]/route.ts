import { NextRequest, NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      await backendFetch(`/recurring/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await backendFetch(`/recurring/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
