import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./api-error";

export type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  const body: ApiSuccessBody<T> = { success: true, data };
  return NextResponse.json(body, init);
}

/**
 * Converts any error thrown inside a route handler into a safe, consistent
 * JSON error response. Never leaks stack traces or raw database errors.
 */
export function toApiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    const body: ApiErrorBody = {
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    };
    return NextResponse.json(body, { status: error.status });
  }

  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.flatten(),
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  // Unknown/unexpected error: log server-side, return a generic message.
  console.error("[api] unhandled error:", error);
  const body: ApiErrorBody = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  };
  return NextResponse.json(body, { status: 500 });
}

/**
 * Wraps a Next.js route handler so any thrown error (ApiError, ZodError, or
 * unexpected) is converted into a consistent JSON response, keeping
 * try/catch boilerplate out of every route.
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return toApiErrorResponse(error);
    }
  };
}
