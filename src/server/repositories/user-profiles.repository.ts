import type { Knex } from "knex";
import { db } from "@/server/db/client";
import type { UserProfileRow } from "@/types/db";

const TABLE = "user_profiles";

export type NewUserProfile = {
  user_id: number;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  currency?: string;
  timezone?: string;
};

export type UserProfileUpdate = Partial<
  Pick<
    UserProfileRow,
    "first_name" | "last_name" | "display_name" | "phone" | "currency" | "timezone"
  >
>;

export function findProfileByUserId(
  userId: number,
): Promise<UserProfileRow | undefined> {
  return db<UserProfileRow>(TABLE).where({ user_id: userId }).first();
}

export async function createProfile(
  input: NewUserProfile,
  conn: Knex = db,
): Promise<UserProfileRow> {
  await conn<UserProfileRow>(TABLE).insert(input);
  const profile = await conn<UserProfileRow>(TABLE)
    .where({ user_id: input.user_id })
    .first();
  if (!profile) {
    throw new Error("Failed to load profile immediately after creation");
  }
  return profile;
}

export async function updateProfile(
  userId: number,
  update: UserProfileUpdate,
): Promise<UserProfileRow> {
  await db<UserProfileRow>(TABLE).where({ user_id: userId }).update(update);
  const profile = await findProfileByUserId(userId);
  if (!profile) {
    throw new Error("Profile not found after update");
  }
  return profile;
}
