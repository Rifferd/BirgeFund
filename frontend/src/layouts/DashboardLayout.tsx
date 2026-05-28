import {
  Bell,
  FolderKanban,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { isRouteActive } from "@/shared/lib/navigation";
import { Button, LanguageSwitcher, TestModeBanner } from "@/shared/ui";

const navItems = [
  { to: routes.dashboard, label: "Обзор", icon: LayoutDashboard },
  { to: "/dashboard/profile", label: "Профиль", icon: UserRound },
  { to: "/dashboard/supports", label: "Мои поддержки", icon: Heart },
  { to: "/dashboard/transactions", label: "История операций", icon: ReceiptText },
  { to: "/dashboard/notifications", label: "Уведомления", icon: Bell },
  { to: "/dashboard/settings", label: "Настройки", icon: Settings },
];

const authorItems = [
  { to: routes.author, label: "Кабинет автора", icon: FolderKanban },
];

function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isRouteActive(location.pathname, item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
              isActive
                ? "bg-slate-950 text-white dark:bg-emerald-600"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}

      <div className="my-3 border-t border-slate-200 dark:border-slate-800" />

      {authorItems.map((item) => {
        const Icon = item.icon;
        const isActive = isRouteActive(location.pathname, item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition",
              isActive
                ? "bg-slate-950 text-white dark:bg-emerald-600"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-brand-background/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link to={routes.home} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <Heart fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-lg font-black">BirgeFund</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Личный кабинет
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Открыть разделы"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[280px_1fr] lg:py-6">
        <aside className="sticky top-6 hidden max-h-[calc(100vh-48px)] rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:block">
          <Link to={routes.home} className="mb-5 flex items-center gap-3 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <Heart fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-xl font-black">BirgeFund</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Dashboard
              </p>
            </div>
          </Link>

          <DashboardNav />

          <div className="mt-5 space-y-3">
            <LanguageSwitcher />
            <TestModeBanner compact />
            <Button type="button" variant="ghost" className="w-full justify-start" leftIcon={<LogOut size={18} />}>
              Выйти
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="flex h-full w-[min(390px,92vw)] flex-col overflow-y-auto rounded-r-[32px] border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <Link to={routes.home} className="flex items-center gap-3" onClick={closeDrawer}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <Home size={20} />
                </div>
                <div>
                  <p className="text-lg font-black">Разделы</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Личный кабинет
                  </p>
                </div>
              </Link>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={closeDrawer}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <DashboardNav onNavigate={closeDrawer} />

            <div className="mt-auto space-y-3 pt-6">
              <LanguageSwitcher />
              <Button type="button" variant="ghost" className="w-full justify-start" leftIcon={<LogOut size={18} />}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
