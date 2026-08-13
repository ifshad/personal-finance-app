import type { ApiErrorBody, ApiSuccessBody } from "./api-response";

/** Thrown by `apiRequest` so callers can show `error.message` directly. */
export class ApiRequestError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiRequestError";
    this.code = body.code;
    this.details = body.details;
  }
}

/**
 * Shared client-side fetch helper for calling our own JSON API routes.
 * Every route returns the `{ success, data }` / `{ success, error }` shape
 * from api-response.ts, so this is the one place that unwraps it.
 */
export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "same-origin",
  });

  const body = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;

  if (!body.success) {
    throw new ApiRequestError(body.error);
  }

  return body.data;
}

export function apiPost<T>(url: string, payload: unknown): Promise<T> {
  return apiRequest<T>(url, { method: "POST", body: JSON.stringify(payload) });
}

export function apiPatch<T>(url: string, payload: unknown): Promise<T> {
  return apiRequest<T>(url, { method: "PATCH", body: JSON.stringify(payload) });
}
