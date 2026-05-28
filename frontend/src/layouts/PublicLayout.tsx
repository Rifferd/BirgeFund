import { Heart, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { applyTheme, getInitialTheme, type ThemeMode } from "@/app/theme";
import { useAuthStore } from "@/features/auth/model/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { Button, LanguageSwitcher, TestModeBanner } from "@/shared/ui";

const navItems = [
  { to: routes.home, labelKey: "navigation.home" },
  { to: routes.projects, labelKey: "navigation.projects" },
];

export function PublicLayout() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logoutMutation = useLogout();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-brand-background/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <Link to={routes.home} className="flex min-w-0 items-center gap-3" onClick={closeMobileMenu}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-emerald-900/20">
              <Heart fill="currentColor" size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xl font-black tracking-tight">{t("app.name")}</p>
              <p className="hidden truncate text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
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
                  cn(
                    "rounded-xl px-4 py-2 text-sm font-bold transition",
                    isActive
                      ? "bg-slate-950 text-white dark:bg-emerald-600"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />

            <Button
              type="button"
              variant="secondary"
              onClick={() => setTheme(nextTheme)}
              aria-label={t("actions.switchTheme")}
              leftIcon={theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            >
              {theme === "light" ? "Dark" : "Light"}
            </Button>

            <Link to={routes.login}>
              <Button type="button" variant="secondary">
                {t("navigation.login")}
              </Button>
            </Link>

            <Link to={routes.author}>
              <Button type="button">{t("navigation.createProject")}</Button>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden">
          <div className="ml-auto flex h-full w-[min(390px,92vw)] flex-col overflow-y-auto rounded-l-[32px] border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link to={routes.home} className="flex items-center gap-3" onClick={closeMobileMenu}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <Heart fill="currentColor" size={20} />
                </div>
                <div>
                  <p className="text-lg font-black">{t("app.name")}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    TEST MODE
                  </p>
                </div>
              </Link>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={closeMobileMenu}
                aria-label="Закрыть меню"
              >
                <X size={20} />
              </button>
            </div>

            <TestModeBanner compact className="mb-4" />

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    cn(
                      "block min-h-11 rounded-2xl px-4 py-3 text-sm font-black transition",
                      isActive
                        ? "bg-slate-950 text-white dark:bg-emerald-600"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    )
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logoutMutation.mutate();
                    closeMobileMenu();
                  }}
                  className="block min-h-11 rounded-2xl px-4 py-3 text-left text-sm font-black text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Выйти
                </button>
              ) : (
                <Link
                  to={routes.login}
                  onClick={closeMobileMenu}
                  className="block min-h-11 rounded-2xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t("navigation.login")}
                </Link>
              )}

              <Link
                to={routes.author}
                onClick={closeMobileMenu}
                className="block min-h-11 rounded-2xl bg-brand-primary px-4 py-3 text-center text-sm font-black text-white"
              >
                {t("navigation.createProject")}
              </Link>
            </nav>

            <div className="mt-auto space-y-3 pt-6">
              <LanguageSwitcher />

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setTheme(nextTheme)}
                leftIcon={theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              >
                {theme === "light" ? "Тёмная тема" : "Светлая тема"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Outlet />
    </div>
  );
}
