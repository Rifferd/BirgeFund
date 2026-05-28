import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(2, "Введите имя").max(120, "Слишком длинное имя"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
