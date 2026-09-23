import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await backendFetch(`/groups/${id}/members`, {
      method: "POST",
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
