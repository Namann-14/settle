import { NextResponse } from "next/server";
import { backendErrorResponse, backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const user = await backendFetch("/users/me");
    return NextResponse.json(user);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const user = await backendFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(user);
  } catch (error) {
    return backendErrorResponse(error);
  }
}