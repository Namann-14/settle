import { NextResponse } from "next/server";
import { aiErrorResponse, aiFetchJson } from "@/lib/ai";
import type { SettlePlan } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = await aiFetchJson<SettlePlan>("/settlements/plan", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
