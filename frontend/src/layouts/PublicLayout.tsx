import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { routes } from "../shared/config/routes";
import { Button } from "../shared/ui/Button";
import { TestModeBanner } from "../shared/ui/TestModeBanner";

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app text-text dark:bg-slate-950 dark:text-slate-100">
      <TestModeBanner />

      <header className="sticky top-0 z-40 border-b border-border bg-app/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container-page flex items-center justify-between py-4">
          <Link to={routes.home} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-emerald-900/20">
              <Heart size={20} fill="currentColor" />
            </span>
            <span>
              <span className="block text-xl font-black">BirgeFund</span>
              <span className="hidden text-xs font-semibold text-muted sm:block">
                Краудфандинг для Кыргызстана
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link className="rounded-2xl px-4 py-2 text-sm font-bold hover:bg-white dark:hover:bg-slate-900" to={routes.home}>
              Главная
            </Link>
            <Link className="rounded-2xl px-4 py-2 text-sm font-bold hover:bg-white dark:hover:bg-slate-900" to={routes.projects}>
              Каталог
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login">
              <Button variant="secondary">Войти</Button>
            </Link>
            <Button>Создать проект</Button>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white lg:hidden dark:border-slate-800 dark:bg-slate-900"
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden">
          <div className="ml-auto h-full w-[86%] max-w-sm bg-white p-5 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <b className="text-xl">Меню</b>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Закрыть меню"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-2">
              <Link onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-bold hover:bg-slate-100 dark:hover:bg-slate-800" to={routes.home}>
                Главная
              </Link>
              <Link onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-bold hover:bg-slate-100 dark:hover:bg-slate-800" to={routes.projects}>
                Каталог проектов
              </Link>
              <Link onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-left font-bold hover:bg-slate-100 dark:hover:bg-slate-800" to="/login">
                Войти
              </Link>
              <button className="rounded-2xl bg-primary px-4 py-3 text-left font-bold text-white">
                Создать проект
              </button>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
}
