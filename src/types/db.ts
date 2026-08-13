/** Row shapes as stored in MySQL, matching the migrations in db/migrations. */

export type RoleRow = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UserProfileRow = {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  currency: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
};
