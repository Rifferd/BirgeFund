import { create } from "zustand";
import type { User } from "../../../entities/user/types";

const ACCESS_TOKEN_KEY = "birgefund_access_token";
const REFRESH_TOKEN_KEY = "birgefund_refresh_token";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setSession: (data: {
    accessToken: string;
    refreshToken?: string | null;
    user?: User | null;
  }) => void;

  setUser: (user: User | null) => void;
  clearSession: () => void;
};

function getInitialAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getInitialRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set) => {
  const accessToken = getInitialAccessToken();
  const refreshToken = getInitialRefreshToken();

  return {
    user: null,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),

    setSession: ({ accessToken, refreshToken, user }) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      set({
        accessToken,
        refreshToken: refreshToken ?? null,
        user: user ?? null,
        isAuthenticated: true,
      });
    },

    setUser: (user) => {
      set({ user });
    },

    clearSession: () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },
  };
});
