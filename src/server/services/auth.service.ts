import { ApiError } from "@/lib/api-error";
import type { LoginInput, RegisterInput } from "@/lib/validation/auth";
import { db } from "@/server/db/client";
import { signAuthToken } from "@/server/auth/jwt";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  createProfile,
  findProfileByUserId,
} from "@/server/repositories/user-profiles.repository";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "@/server/repositories/users.repository";
import {
  DEFAULT_ROLE_NAME,
  findRoleById,
  findRoleByName,
} from "@/server/repositories/roles.repository";
import { seedDefaultCategoriesForUser } from "./default-categories";
import { toPublicUser, type PublicUser } from "./user.mapper";

export type AuthResult = {
  user: PublicUser;
  token: string;
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const role = await findRoleByName(DEFAULT_ROLE_NAME);
  if (!role) {
    // Configuration error, not a user error — the seed migration must have
    // failed to run.
    throw ApiError.internal("Default role is not configured");
  }

  const passwordHash = await hashPassword(input.password);

  // User creation, profile creation, and default category seeding must
  // succeed or fail together — a partially-created user (e.g. with no
  // categories to record transactions against) is worse than a failed
  // registration the user can just retry.
  const { user, profile } = await db.transaction(async (trx) => {
    const createdUser = await createUser(
      { email: input.email, password_hash: passwordHash, role_id: role.id },
      trx,
    );

    const createdProfile = await createProfile(
      {
        user_id: createdUser.id,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        display_name: input.firstName ?? null,
      },
      trx,
    );

    await seedDefaultCategoriesForUser(trx, createdUser.id);

    return { user: createdUser, profile: createdProfile };
  });

  const token = await signAuthToken({
    sub: String(user.id),
    email: user.email,
    role: role.name,
  });

  return { user: toPublicUser(user, role.name, profile), token };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  const invalidCredentials = () =>
    ApiError.unauthenticated("Invalid email or password");

  // Compare against a dummy hash when the user doesn't exist so login takes
  // a similar amount of time either way, avoiding a timing side-channel
  // that would reveal whether an email is registered.
  const passwordHash = user?.password_hash ?? "$2a$12$" + "0".repeat(53);
  const passwordMatches = await verifyPassword(input.password, passwordHash);

  if (!user || !passwordMatches) {
    throw invalidCredentials();
  }
  if (!user.is_active) {
    throw ApiError.unauthenticated("This account has been deactivated");
  }

  const role = await findRoleById(user.role_id);
  if (!role) {
    throw ApiError.internal("User role could not be resolved");
  }

  const profile = await findProfileByUserId(user.id);

  const token = await signAuthToken({
    sub: String(user.id),
    email: user.email,
    role: role.name,
  });

  return { user: toPublicUser(user, role.name, profile), token };
}

export async function getCurrentUser(userId: number): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user || !user.is_active) {
    throw ApiError.unauthenticated();
  }

  const role = await findRoleById(user.role_id);
  if (!role) {
    throw ApiError.internal("User role could not be resolved");
  }

  const profile = await findProfileByUserId(user.id);
  return toPublicUser(user, role.name, profile);
}
