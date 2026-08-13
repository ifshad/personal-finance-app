import type { Knex } from "knex";
import { db } from "@/server/db/client";
import type { UserRow } from "@/types/db";

const TABLE = "users";

export type NewUser = {
  email: string;
  password_hash: string;
  role_id: number;
};

export function findUserByEmail(email: string): Promise<UserRow | undefined> {
  return db<UserRow>(TABLE).where({ email }).first();
}

export function findUserById(id: number): Promise<UserRow | undefined> {
  return db<UserRow>(TABLE).where({ id }).first();
}

export async function createUser(input: NewUser, conn: Knex = db): Promise<UserRow> {
  const [id] = await conn<UserRow>(TABLE).insert(input);
  const user = await conn<UserRow>(TABLE).where({ id }).first();
  if (!user) {
    throw new Error("Failed to load user immediately after creation");
  }
  return user;
}
