import { NextResponse } from "next/server";
import { aiErrorStatus, aiFetch } from "@/lib/ai";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await aiFetch(`/chat/threads/${encodeURIComponent(id)}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ message }, { status: aiErrorStatus(error) });
  }
}
