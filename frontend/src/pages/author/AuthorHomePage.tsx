import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, Button, TestModeBanner } from "@/shared/ui";

export function AuthorHomePage() {
  return (
    <div className="space-y-5">
      <TestModeBanner compact />

      <Card>
        <CardHeader>
          <CardTitle>Кабинет автора</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Управляйте своими проектами, черновиками, модерацией, новостями и отчётами.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link to="/author/projects">
              <Button>Мои проекты</Button>
            </Link>
            <Link to="/author/projects/create">
              <Button variant="secondary">Создать проект</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
