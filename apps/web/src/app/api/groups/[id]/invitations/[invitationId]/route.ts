import { backendErrorResponse, backendFetch } from "@/lib/backend";

type RouteParams = { params: Promise<{ id: string; invitationId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id, invitationId } = await params;
    await backendFetch(`/groups/${id}/invitations/${invitationId}`, { method: "DELETE" });
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
