import type { LanguageCode } from "@/shared/types/api";

type TranslationLike = {
  language: string;
};

export function getTranslation<TTranslation extends TranslationLike>(
  translations: TTranslation[] | undefined,
  language: LanguageCode,
): TTranslation | undefined {
  if (!translations?.length) {
    return undefined;
  }

  return (
    translations.find((translation) => translation.language === language) ??
    translations.find((translation) => translation.language === "ru") ??
    translations[0]
  );
}
