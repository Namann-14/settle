import { NextResponse } from "next/server";
import { aiErrorStatus, aiFetch } from "@/lib/ai";

// Restore a chat to an earlier reply: the ai service deletes the expenses the
// assistant added after it and drops the later turns from the history.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { checkpointId } = (await request.json()) as { checkpointId?: string };
  if (!checkpointId) {
    return NextResponse.json({ message: "checkpointId is required" }, { status: 400 });
  }
  try {
    const res = await aiFetch(`/chat/threads/${encodeURIComponent(id)}/restore`, {
      method: "POST",
      body: JSON.stringify({ checkpoint_id: checkpointId }),
    });
    return NextResponse.json(await res.json());
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ message }, { status: aiErrorStatus(error) });
  }
}
