import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("http://localhost:8000/health", {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Backend unavailable" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "Failed to connect to backend" },
            { status: 500 }
        );
    }
}