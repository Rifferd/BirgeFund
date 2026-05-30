export type TranslationLike = {
  language: string;
  [key: string]: any;
};

export function getTranslation<TTranslation extends TranslationLike = TranslationLike>(
  translations: TTranslation[] | null | undefined,
  language: string,
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
