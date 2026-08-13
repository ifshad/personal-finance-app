import type { UpdateProfileInput } from "@/lib/validation/profile";
import { updateProfile } from "@/server/repositories/user-profiles.repository";
import { findRoleById } from "@/server/repositories/roles.repository";
import { findUserById } from "@/server/repositories/users.repository";
import { ApiError } from "@/lib/api-error";
import { toPublicUser, type PublicUser } from "./user.mapper";

export async function updateCurrentUserProfile(
  userId: number,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) {
    throw ApiError.unauthenticated();
  }

  const role = await findRoleById(user.role_id);
  if (!role) {
    throw ApiError.internal("User role could not be resolved");
  }

  const profile = await updateProfile(userId, {
    first_name: input.firstName,
    last_name: input.lastName,
    display_name: input.displayName,
    phone: input.phone,
    currency: input.currency,
    timezone: input.timezone,
  });

  return toPublicUser(user, role.name, profile);
}
