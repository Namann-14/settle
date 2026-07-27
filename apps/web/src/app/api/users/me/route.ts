import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const user = await backendFetch("/users/me");
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
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
    console.error(error);
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}