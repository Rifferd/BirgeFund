import { Card, CardContent, CardHeader, CardTitle, StatusBadge, TestModeBanner } from "@/shared/ui";

export function CreateProjectPage() {
  return (
    <div className="space-y-5">
      <TestModeBanner compact />

      <div>
        <StatusBadge tone="amber">Создание проекта</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Новый проект</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          На следующем этапе здесь будет пошаговый wizard: основная информация,
          переводы, тип проекта, цель, дедлайн, риски, условия возврата и предпросмотр.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wizard будет здесь</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Сначала мы сделали список проектов автора и отправку на модерацию,
            чтобы было куда возвращаться после создания проекта.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
