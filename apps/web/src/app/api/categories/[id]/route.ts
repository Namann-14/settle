import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await backendFetch(`/categories/${id}`);
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await backendFetch(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await backendFetch(`/categories/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
