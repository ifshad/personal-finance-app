import bcrypt from "bcryptjs";

// Cost factor for bcrypt hashing. Higher is slower but more resistant to
// brute force. 12 is a reasonable default for an MVP.
const SALT_ROUNDS = 12;

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
