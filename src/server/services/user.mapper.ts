import type { UserProfileRow, UserRow } from "@/types/db";

/** Shape of a user as returned to the client. Never includes password_hash. */
export type PublicUser = {
  id: number;
  email: string;
  role: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    currency: string;
    timezone: string;
  } | null;
};

export function toPublicUser(
  user: UserRow,
  roleName: string,
  profile: UserProfileRow | undefined,
): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: roleName,
    profile: profile
      ? {
          firstName: profile.first_name,
          lastName: profile.last_name,
          displayName: profile.display_name,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          currency: profile.currency,
          timezone: profile.timezone,
        }
      : null,
  };
}
