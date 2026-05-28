import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { RegisterForm } from "../../features/auth/components/RegisterForm";

export function RegisterPage() {
  return (
    <main className="min-h-screen bg-app px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-emerald-900/20">
            <Heart size={22} fill="currentColor" />
          </span>
          <span className="text-2xl font-black text-text dark:text-slate-100">BirgeFund</span>
        </Link>

        <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h1 className="text-3xl font-black text-text dark:text-slate-100">Регистрация</h1>
          <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">
            Создайте аккаунт, чтобы поддерживать проекты и пользоваться личным кабинетом.
          </p>

          <div className="mt-7">
            <RegisterForm />
          </div>
        </section>
      </div>
    </main>
  );
}
