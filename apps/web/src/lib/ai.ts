import { auth } from "@clerk/nextjs/server";

// On Vercel AI_SERVICE_URL is injected by the service binding and may end
// with "/". AI_ROUTE_PREFIX mirrors the ai service's own setting of the same
// name ("/ai" on Vercel, empty for local dev).
const AI_SERVICE_URL = (
    process.env.AI_SERVICE_URL ?? "http://localhost:8001"
).replace(/\/+$/, "");
const AI_ROUTE_PREFIX = (process.env.AI_ROUTE_PREFIX ?? "").replace(/\/+$/, "");

export class AiServiceError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message);
    }
}

// Unlike backendFetch, returns the raw Response so streaming bodies (SSE)
// can be passed through instead of being parsed as JSON.
export async function aiFetch(
    path: string,
    init: RequestInit = {}
): Promise<Response> {
    const { getToken } = await auth();

    const token = await getToken();

    if (!token) {
        throw new AiServiceError(401, "Unauthorized");
    }

    const response = await fetch(`${AI_SERVICE_URL}${AI_ROUTE_PREFIX}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new AiServiceError(response.status, await response.text());
    }

    return response;
}

export async function aiFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await aiFetch(path, init);
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

// Route-handler error mapping: keep 401/404 from the ai service, everything
// else is the ai service being unreachable or broken from the client's view.
export function aiErrorStatus(error: unknown): number {
    if (error instanceof AiServiceError && [401, 404].includes(error.status)) {
        return error.status;
    }
    return 502;
}

// Keeps 4xx statuses (a bad draft request is the caller's problem) and pulls
// FastAPI's `detail` out of the body so the UI can show a readable reason.
export function aiErrorResponse(error: unknown) {
    console.error(error);
    let message = error instanceof Error ? error.message : "AI request failed";
    try {
        const body = JSON.parse(message);
        const detail = body?.detail;
        if (typeof detail === "string") message = detail;
        else if (typeof detail?.reason === "string") message = detail.reason;
    } catch {}
    const status =
        error instanceof AiServiceError && error.status >= 400 && error.status < 500
            ? error.status
            : aiErrorStatus(error);
    return Response.json({ message }, { status });
}
