import { apiClient } from "../../../shared/api/client";
import type { AuthResponse, User } from "../../../entities/user/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name?: string;
};

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>("/auth/login", payload);
  },

  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse | User>("/auth/register", payload);
  },

  me() {
    return apiClient.get<User>("/auth/me");
  },

  logout() {
    return apiClient.post<{ ok: boolean }>("/auth/logout");
  },

  refresh(refreshToken: string) {
    return apiClient.post<AuthResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },
};
