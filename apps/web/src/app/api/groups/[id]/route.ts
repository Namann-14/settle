import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await backendFetch(`/groups/${id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await backendFetch(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await backendFetch(`/groups/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
