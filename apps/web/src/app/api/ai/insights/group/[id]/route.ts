import { NextRequest, NextResponse } from "next/server";
import { aiErrorResponse, aiFetchJson } from "@/lib/ai";
import type { GroupInsight } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const days = request.nextUrl.searchParams.get("days");
    const insight = await aiFetchJson<GroupInsight>(
      `/insights/group/${id}${days ? `?days=${encodeURIComponent(days)}` : ""}`,
    );
    return NextResponse.json(insight);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
