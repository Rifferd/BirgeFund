import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { routes } from "@/shared/config/routes";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-center">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldCheck size={16} />
          {t("testMode.title")}: {t("testMode.description")}
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
          {t("pages.homeTitle")}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          {t("pages.homeDescription")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={routes.projects}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-brand-primaryDark"
          >
            {t("actions.openProjects")}
          </Link>

          <Link
            to={routes.author}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("navigation.createProject")}
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Frontend status
        </p>

        <div className="mt-5 space-y-3">
          {["Providers", "Router", "i18n ru/kg/en", "Responsive public layout"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold dark:bg-slate-800"
            >
              <span>{item}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                OK
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
