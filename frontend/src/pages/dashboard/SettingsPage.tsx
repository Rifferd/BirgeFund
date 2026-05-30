import { Card, CardContent, CardHeader, CardTitle, LanguageSwitcher, StatusBadge } from "@/shared/ui";

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="slate">Настройки</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Настройки</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Язык интерфейса</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}
