import {
  Bell,
  FileText,
  Flag,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { isRouteActive } from "@/shared/lib/navigation";
import { Button,
  LoadingState, StatusBadge } from "@/shared/ui";

const adminNavItems = [
  { to: routes.admin, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: UsersRound },
  { to: "/admin/projects", label: "Projects", icon: FileText },
  { to: "/admin/payments", label: "Payments", icon: WalletCards },
  { to: "/admin/ledger", label: "Ledger", icon: ReceiptText },
  { to: "/admin/refunds", label: "Refunds", icon: ReceiptText },
  { to: "/admin/reports", label: "Reports", icon: ShieldCheck },
  { to: "/admin/complaints", label: "Complaints", icon: Flag },
  { to: "/admin/cms", label: "CMS pages", icon: FileText },
  { to: "/admin/translations", label: "Translations", icon: Globe2 },
  { to: "/admin/banners", label: "Banners", icon: Bell },
  { to: "/admin/audit-logs", label: "Audit Log", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
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
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const logoutMutation = useLogout();

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-100/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link to={routes.admin} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-lg font-black">Admin</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                BirgeFund control panel
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Открыть admin меню"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[300px_1fr] lg:py-6">
        <aside className="sticky top-6 hidden max-h-[calc(100vh-48px)] overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:block">
          <Link to={routes.home} className="mb-5 flex items-center gap-3 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-emerald-600">
              <Home size={20} />
            </div>
            <div>
              <p className="text-xl font-black">BirgeFund</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Admin panel
              </p>
            </div>
          </Link>

          <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
            <StatusBadge tone="amber">TEST MODE</StatusBadge>
            <p className="mt-2 text-xs font-semibold leading-5 text-amber-800 dark:text-amber-100">
              Админка управляет только демонстрационными операциями.
            </p>
          </div>

          <AdminNav />

          <div className="mt-5">
            <Button type="button" variant="ghost" className="w-full justify-start" leftIcon={<LogOut size={18} />} isLoading={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
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
          <div className="flex h-full w-[min(410px,94vw)] flex-col overflow-y-auto rounded-r-[32px] border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <Link to={routes.admin} className="flex items-center gap-3" onClick={closeDrawer}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-lg font-black">Admin menu</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Управление платформой
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

            <AdminNav onNavigate={closeDrawer} />

            <div className="mt-auto pt-6">
              <Button type="button" variant="ghost" className="w-full justify-start" leftIcon={<LogOut size={18} />} isLoading={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
