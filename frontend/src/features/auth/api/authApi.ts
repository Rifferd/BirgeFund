import { apiClient, endpoints } from "@/shared/api";
import type { ApiMessageResponse } from "@/shared/types/api";

import type { AuthTokenResponse, CurrentUser, LoginRequest } from "./authTypes";

export function login(payload: LoginRequest) {
  return apiClient.post<AuthTokenResponse, LoginRequest>(endpoints.auth.login, payload, {
    auth: false,
  });
}

export function logout() {
  return apiClient.post<ApiMessageResponse>(endpoints.auth.logout);
}

export function getMe() {
  return apiClient.get<CurrentUser>(endpoints.auth.me);
}
