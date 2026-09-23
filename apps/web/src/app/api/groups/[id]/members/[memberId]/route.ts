import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id, memberId } = await params;
    await backendFetch(`/groups/${id}/members/${memberId}`, { method: "DELETE" });
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
