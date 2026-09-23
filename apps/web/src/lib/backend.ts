import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// On Vercel this is injected by the service binding and may end with "/"
const BACKEND_URL = (
    process.env.BACKEND_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class BackendError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message);
    }
}

export async function backendFetch<T>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
    const { getToken } = await auth();

    const token = await getToken();

    if (!token) {
        throw new Error("Unauthorized");
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new BackendError(response.status, await response.text());
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

// Route-handler error mapping that keeps the api's status and its FastAPI
// `detail` string, so the client can show "Settle this member's balance
// first" instead of a generic 500.
export function backendErrorResponse(error: unknown) {
    console.error(error);
    if (error instanceof BackendError) {
        let message = error.message;
        try {
            const body = JSON.parse(error.message);
            if (typeof body?.detail === "string") message = body.detail;
        } catch {}
        return NextResponse.json({ message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
}
