import { Heart, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { applyTheme, getInitialTheme, type ThemeMode } from "@/app/theme";
import { routes } from "@/shared/config/routes";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";

const navItems = [
  { to: routes.home, labelKey: "navigation.home" },
  { to: routes.projects, labelKey: "navigation.projects" },
];

export function PublicLayout() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <div className="min-h-screen bg-brand-background text-brand-text transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-brand-background/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to={routes.home} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-emerald-900/20">
              <Heart fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">{t("app.name")}</p>
              <p className="hidden text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
                {t("app.tagline")}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-emerald-600"
                    : "rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={() => setTheme(nextTheme)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label={t("actions.switchTheme")}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "light" ? "Dark" : "Light"}
            </button>

            <Link
              to={routes.login}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {t("navigation.login")}
            </Link>

            <Link
              to={routes.author}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-brand-primaryDark"
            >
              {t("navigation.createProject")}
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t(item.labelKey)}
                </Link>
              ))}

              <Link
                to={routes.login}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("navigation.login")}
              </Link>

              <div className="mt-2 flex items-center justify-between gap-2">
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={() => setTheme(nextTheme)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  Theme
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <Outlet />
    </div>
  );
}
