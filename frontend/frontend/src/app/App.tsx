import { Heart, Moon, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function App() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <main className="min-h-screen bg-brand-background text-brand-text transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-brand-background/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-emerald-900/20">
              <Heart fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">BirgeFund</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Краудфандинг для Кыргызстана · тестовый режим
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "light" ? "Тёмная" : "Светлая"}
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <ShieldCheck size={16} />
            TEST MODE: реальные деньги не списываются
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Frontend BirgeFund готов к разработке
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Стартовая основа подключена: React, TypeScript, Vite, TailwindCSS и светлая/тёмная тема. Дальше будем добавлять providers, router, i18n, layouts и подключение к backend API.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-brand-primaryDark"
            >
              Начать разработку
            </a>
            <a
              href="http://localhost:8000/docs"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Swagger backend
            </a>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Foundation status
          </p>

          <div className="mt-5 space-y-3">
            {[
              "React + TypeScript",
              "Vite dev server",
              "TailwindCSS",
              "Dark theme class strategy",
              "Mobile-first base styles"
            ].map((item) => (
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
        </div>
      </section>
    </main>
  );
}
