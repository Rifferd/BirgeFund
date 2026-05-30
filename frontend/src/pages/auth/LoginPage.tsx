import { useTranslation } from "react-i18next";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

export function LoginPage() {
  const { t } = useTranslation();

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
