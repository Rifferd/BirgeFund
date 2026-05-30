export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export type CurrentUserRole = {
  id?: number;
  name: string;
  title?: string | null;
  description?: string | null;
  is_active?: boolean;
};

export type CurrentUser = {
  id: number;
  email: string;
  full_name?: string | null;
  preferred_language?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  is_blocked?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string | null;

  roles?: CurrentUserRole[];
  role_names?: string[];
  permissions?: string[];
};
