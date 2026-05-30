import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getMe, login } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/model/authStore";
import { getApiErrorMessage } from "@/shared/api";
import { routes } from "@/shared/config/routes";
import { Button, Input, TestModeBanner } from "@/shared/ui";

type LocationState = {
  from?: string;
};

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const from = (location.state as LocationState | null)?.from ?? routes.dashboard;

  const [email, setEmail] = useState("backer@birgefund.kg");
  const [password, setPassword] = useState("BackerPass123!");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      clearSession();
      queryClient.clear();

      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      const user = await getMe();
      setUser(user);

      navigate(from, {
        replace: true,
      });
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        loginMutation.mutate({
          email,
          password,
        });
      }}
    >
      <TestModeBanner compact />

      <Input
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
      />

      <Input
        label="Пароль"
        type="password"
        value={password}
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
      />

      {loginMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {getApiErrorMessage(loginMutation.error)}
        </div>
      ) : null}

      <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending}>
        Войти
      </Button>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <p className="font-black text-slate-900 dark:text-slate-100">Demo аккаунты:</p>
        <p>Backer: backer@birgefund.kg / BackerPass123!</p>
        <p>Author: author@birgefund.kg / AuthorPass123!</p>
        <p>Admin: admin@birgefund.kg / AdminPass123!</p>
        <p>Moderator: moderator@birgefund.kg / ModeratorPass123!</p>
        <p>Finance: finance@birgefund.kg / FinancePass123!</p>
        <p>Content: content@birgefund.kg / ContentPass123!</p>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Нет аккаунта?{" "}
        <Link className="font-black text-emerald-600" to={routes.register}>
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
