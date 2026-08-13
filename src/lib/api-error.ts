/**
 * Typed application error for API routes.
 *
 * Route handlers throw `ApiError` (or a subclass) for any expected failure
 * condition. `toApiResponse` (see api-response.ts) turns it into a
 * consistent JSON shape and never leaks internal/database details to the
 * client.
 */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static validation(message: string, details?: unknown) {
    return new ApiError("VALIDATION_ERROR", message, details);
  }

  static unauthenticated(message = "Authentication required") {
    return new ApiError("AUTHENTICATION_ERROR", message);
  }

  static forbidden(message = "You do not have access to this resource") {
    return new ApiError("AUTHORIZATION_ERROR", message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError("NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new ApiError("CONFLICT", message);
  }

  static internal(message = "Something went wrong") {
    return new ApiError("INTERNAL_ERROR", message);
  }
}
