import { useTranslation } from "react-i18next";

export function ProjectsPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-4xl font-black">{t("pages.projectsTitle")}</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Здесь будет каталог проектов, подключенный к backend API.
      </p>
    </main>
  );
}
