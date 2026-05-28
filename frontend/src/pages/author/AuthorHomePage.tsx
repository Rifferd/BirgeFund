import { Card, CardContent, CardHeader, CardTitle, TestModeBanner } from "@/shared/ui";

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
            Здесь будут мои проекты, черновики, проекты на модерации, новости, отчёты,
            комментарии и пошаговое создание проекта.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
