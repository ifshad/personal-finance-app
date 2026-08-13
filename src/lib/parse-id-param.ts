import { ApiError } from "./api-error";

/** Parses a dynamic route segment (e.g. `[id]`) into a positive integer id. */
export function parseIdParam(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.validation("Invalid id");
  }
  return id;
}
