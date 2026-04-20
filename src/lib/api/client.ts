/**
 * NestJS API client.
 *
 * Set VITE_API_URL in your env to point to your NestJS server (e.g. https://api.mca-clone.com).
 * If unset, falls back to mock data from src/lib/mock-data.ts.
 *
 * Replace USE_MOCK = false once your NestJS endpoints are live.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const USE_MOCK = false; // Forced to false to ensure backend is used

console.log("Frontend connecting to API:", API_BASE_URL);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

/** Simulate network latency for mock mode */
export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
