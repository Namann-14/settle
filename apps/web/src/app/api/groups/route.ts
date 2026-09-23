import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const data = await backendFetch("/groups");
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await backendFetch("/groups", {
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
