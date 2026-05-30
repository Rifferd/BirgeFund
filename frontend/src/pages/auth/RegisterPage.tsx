import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "@/shared/api/config";

type RegisterErrors = {
  email?: string;
  password?: string;
  full_name?: string;
  form?: string;
};

type RegisterResponse = {
  id: number;
  email: string;
  full_name: string | null;
  preferred_language: string;
};

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Не удалось создать аккаунт. Попробуйте ещё раз.";
}

export function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("ru");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      fullName.trim().length > 0 &&
      password.length >= 8 &&
      password === passwordRepeat &&
      !isSubmitting
    );
  }, [email, fullName, password, passwordRepeat, isSubmitting]);

  function validate(): RegisterErrors {
    const nextErrors: RegisterErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Укажи email.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Email выглядит некорректно.";
    }

    if (!fullName.trim()) {
      nextErrors.full_name = "Укажи имя.";
    }

    if (password.length < 8) {
      nextErrors.password = "Пароль должен быть минимум 8 символов.";
    } else if (password !== passwordRepeat) {
      nextErrors.password = "Пароли не совпадают.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          preferred_language: preferredLanguage,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          "Не удалось зарегистрироваться.";

        throw new Error(typeof message === "string" ? message : "Проверь данные формы.");
      }

      const user = data as RegisterResponse;

      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: user.email,
          message: "Аккаунт создан. Теперь можно войти.",
        },
      });
    } catch (error) {
      setErrors({
        form: getApiErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="hidden rounded-[32px] bg-gradient-to-br from-emerald-600 to-slate-900 p-10 text-white shadow-2xl lg:block">
          <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
            BirgeFund
          </p>

          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Создай аккаунт и начни поддерживать проекты Кыргызстана
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
            После регистрации можно поддерживать проекты, создавать свои кампании,
            оставлять комментарии и отслеживать историю операций.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <h2 className="font-semibold">Для авторов</h2>
              <p className="mt-2 text-sm text-white/75">
                Создавай черновики проектов и отправляй их на модерацию.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <h2 className="font-semibold">Для участников</h2>
              <p className="mt-2 text-sm text-white/75">
                Поддерживай инициативы в безопасном тестовом режиме.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Регистрация
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Создать аккаунт
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Заполни данные ниже. После регистрации ты сможешь войти в личный кабинет.
            </p>
          </div>

          {errors.form ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              {errors.form}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              {errors.email ? (
                <span className="mt-2 block text-sm text-red-600">{errors.email}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Имя</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Например: Мунарбек"
              />
              {errors.full_name ? (
                <span className="mt-2 block text-sm text-red-600">{errors.full_name}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Язык интерфейса</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950"
                value={preferredLanguage}
                onChange={(event) => setPreferredLanguage(event.target.value)}
              >
                <option value="ru">Русский</option>
                <option value="kg">Кыргызский</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Пароль</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Минимум 8 символов"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Повтори пароль</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950"
                type="password"
                autoComplete="new-password"
                value={passwordRepeat}
                onChange={(event) => setPasswordRepeat(event.target.value)}
                placeholder="Ещё раз пароль"
              />
              {errors.password ? (
                <span className="mt-2 block text-sm text-red-600">{errors.password}</span>
              ) : null}
            </label>

            <button
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Уже есть аккаунт?{" "}
            <Link className="font-semibold text-emerald-600 hover:underline" to="/login">
              Войти
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
