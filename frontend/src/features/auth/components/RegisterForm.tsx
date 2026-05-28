import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../api/authApi";
import { registerSchema, type RegisterFormValues } from "../schemas/registerSchema";
import { Button } from "../../../shared/ui/Button";

export function RegisterForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setServerError("");
      setSuccess("");

      await authApi.register(values);

      setSuccess("Аккаунт создан. Теперь можно войти.");
      setTimeout(() => navigate("/login"), 700);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось зарегистрироваться");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      )}

      {success && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Имя</span>
        <input
          type="text"
          autoComplete="name"
          className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
          {...register("full_name")}
        />
        {errors.full_name && <p className="mt-2 text-sm font-semibold text-red-600">{errors.full_name.message}</p>}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email</span>
        <input
          type="email"
          autoComplete="email"
          className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
          {...register("email")}
        />
        {errors.email && <p className="mt-2 text-sm font-semibold text-red-600">{errors.email.message}</p>}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Пароль</span>
        <input
          type="password"
          autoComplete="new-password"
          className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
          {...register("password")}
        />
        {errors.password && <p className="mt-2 text-sm font-semibold text-red-600">{errors.password.message}</p>}
      </label>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </Button>

      <p className="text-center text-sm font-semibold text-muted">
        Уже есть аккаунт?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
