import { useTranslation } from "react-i18next";

export function DashboardHomePage() {
  const { t } = useTranslation();

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-black">{t("pages.dashboardTitle")}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Личный кабинет подключим после auth store и protected routes.
      </p>
    </section>
  );
}
