import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/model/authStore";
import { routes } from "@/shared/config/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

export function LoginPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("pages.loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
