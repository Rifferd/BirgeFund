import { useNavigate } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { useAuthStore } from "../../features/auth/model/authStore";
import { Button } from "../../shared/ui/Button";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";

export function DashboardHomePage() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data: user, isLoading, isError, error } = useCurrentUser();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Даже если backend logout вернул ошибку, локальную сессию всё равно очищаем.
    } finally {
      clearSession();
      navigate("/");
    }
  }

  return (
    <main className="min-h-screen bg-app py-8 dark:bg-slate-950">
      <div className="container-page">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Личный кабинет</p>
            <h1 className="mt-2 text-4xl font-black text-text dark:text-slate-100">Профиль пользователя</h1>
          </div>

          <Button variant="secondary" onClick={handleLogout}>
            Выйти
          </Button>
        </div>

        {isLoading && <LoadingState text="Проверяем сессию..." />}

        {isError && (
          <ErrorState message={error instanceof Error ? error.message : "Не удалось получить профиль"} />
        )}

        {user && (
          <section className="rounded-[32px] border border-border bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-text dark:text-slate-100">
              {user.full_name || user.name || "Пользователь"}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-bold text-muted">Email</p>
                <p className="mt-1 font-black text-text dark:text-slate-100">{user.email}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-bold text-muted">Статус</p>
                <p className="mt-1 font-black text-text dark:text-slate-100">
                  {user.is_active === false ? "Заблокирован" : "Активен"}
                </p>
              </div>
            </div>

            <p className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              В первой версии не показываем баланс пользователя. Поддержка проекта проходит напрямую через mock payment.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
