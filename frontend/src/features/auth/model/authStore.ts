import { create } from "zustand";

import { tokenStorage } from "@/shared/api";

import type { CurrentUser } from "@/features/auth/api/authTypes";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  setTokens: (payload: { accessToken: string; refreshToken?: string | null }) => void;
  setUser: (user: CurrentUser | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => {
  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();

  return {
    accessToken,
    refreshToken,
    user: null,
    isAuthenticated: Boolean(accessToken),

    setTokens: ({ accessToken, refreshToken }) => {
      tokenStorage.setAccessToken(accessToken);

      if (refreshToken) {
        tokenStorage.setRefreshToken(refreshToken);
      }

      set({
        accessToken,
        refreshToken: refreshToken ?? null,
        isAuthenticated: true,
      });
    },

    setUser: (user) => set({ user }),

    clearSession: () => {
      tokenStorage.clear();

      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    },
  };
});
