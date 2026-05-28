import { Link, Outlet } from "react-router-dom";

import { routes } from "@/shared/config/routes";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <Link to={routes.home} className="mb-5 block px-3 text-xl font-black">
            BirgeFund
          </Link>
          <nav className="space-y-1">
            <Link className="block rounded-2xl px-4 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800" to={routes.dashboard}>
              Личный кабинет
            </Link>
            <Link className="block rounded-2xl px-4 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800" to={routes.author}>
              Кабинет автора
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
