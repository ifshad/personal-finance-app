import { db } from "@/server/db/client";
import type { RoleRow } from "@/types/db";

const TABLE = "roles";

export const DEFAULT_ROLE_NAME = "USER";

export function findRoleByName(name: string): Promise<RoleRow | undefined> {
  return db<RoleRow>(TABLE).where({ name }).first();
}

export function findRoleById(id: number): Promise<RoleRow | undefined> {
  return db<RoleRow>(TABLE).where({ id }).first();
}
