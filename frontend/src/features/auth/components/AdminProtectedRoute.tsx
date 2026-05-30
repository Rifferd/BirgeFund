import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useMe } from "@/features/auth/hooks/useMe";
import { canAccessAdmin } from "@/features/auth/model/access";
import { useAuthStore } from "@/features/auth/model/authStore";
import { routes } from "@/shared/config/routes";
import { LoadingState } from "@/shared/ui";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const meQuery = useMe();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={routes.login}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (meQuery.isLoading || !user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <LoadingState text="Проверяем права доступа..." />
      </main>
    );
  }

  if (!canAccessAdmin(user)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
