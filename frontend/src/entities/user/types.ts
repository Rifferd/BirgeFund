export type UserRole = {
  id?: number | string;
  name: string;
};

export type User = {
  id: number | string;
  email: string;
  full_name?: string | null;
  name?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  roles?: string[] | UserRole[];
  permissions?: string[];
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export type AuthResponse = AuthTokens & {
  user?: User;
};
