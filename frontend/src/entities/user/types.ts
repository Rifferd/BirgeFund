export type UserRole = {
  id: number;
  name: string;
  title?: string | null;
  description?: string | null;
  is_active?: boolean;
};

export type User = {
  id: number;
  email: string;
  full_name?: string | null;
  preferred_language?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  is_blocked?: boolean;
  created_at?: string;
  updated_at?: string | null;
  roles?: UserRole[];
  permissions?: string[];
};
