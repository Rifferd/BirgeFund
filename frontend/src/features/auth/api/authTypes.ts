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
};

export type CurrentUser = {
  id: number;
  email: string;
  full_name?: string | null;
  preferred_language?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  is_blocked?: boolean;

  roles?: CurrentUserRole[];
  role_names?: string[];
  permissions?: string[];
};
