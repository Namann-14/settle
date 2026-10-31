import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string; action: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id, action } = await params;
    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    const data = await backendFetch(`/invitations/${id}/${action}`, { method: "POST" });
    // decline is a 204 from the api
    return data === undefined || data === null
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
