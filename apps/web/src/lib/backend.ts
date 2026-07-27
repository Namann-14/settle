import { auth } from "@clerk/nextjs/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8000";

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
        throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
}