import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../model/authStore";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { Button } from "../../../shared/ui/Button";

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setServerError("");

      const response = await authApi.login(values);

      setSession({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user ?? null,
      });

      navigate("/dashboard");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось войти");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      )}

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
          autoComplete="current-password"
          className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
          {...register("password")}
        />
        {errors.password && <p className="mt-2 text-sm font-semibold text-red-600">{errors.password.message}</p>}
      </label>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Входим..." : "Войти"}
      </Button>
    </form>
  );
}
