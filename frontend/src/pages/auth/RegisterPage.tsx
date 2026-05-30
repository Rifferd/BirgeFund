import { useTranslation } from "react-i18next";

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-12">
      <section className="w-full rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black">{t("pages.registerTitle")}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Форму регистрации подключим на этапе Auth UI.
        </p>
      </section>
    </main>
  );
}
