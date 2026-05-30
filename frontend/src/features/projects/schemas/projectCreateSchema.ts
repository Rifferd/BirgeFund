import { z } from "zod";

export const projectCreateSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug должен быть минимум 2 символа")
    .max(150, "Slug слишком длинный")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латиницу, цифры и дефисы"),
  city: z.string().min(2, "Укажите город"),
  project_type: z.string().min(1, "Выберите тип проекта"),
  funding_type: z.string().min(1, "Выберите тип сбора"),
  goal_amount: z.coerce.number().min(1000, "Минимальная цель — 1000 сом"),
  currency: z.literal("KGS"),
  deadline: z.string().min(1, "Укажите дедлайн"),
  category_ids: z.array(z.number()).min(1, "Выберите категорию"),
  translations: z
    .array(
      z.object({
        language: z.enum(["ru", "kg", "en"]),
        title: z.string().min(2, "Укажите название"),
        short_description: z.string().min(5, "Краткое описание слишком короткое"),
        description: z.string().min(20, "Описание слишком короткое"),
        risks: z.string().optional(),
        refund_policy: z.string().optional(),
        reward_description: z.string().optional(),
        report_text: z.string().optional(),
      }),
    )
    .min(1),
});

export type ProjectCreateFormValues = z.infer<typeof projectCreateSchema>;
