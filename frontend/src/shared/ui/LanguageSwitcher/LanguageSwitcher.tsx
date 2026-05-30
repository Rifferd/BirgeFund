import { Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { supportedLanguages, type SupportedLanguage } from "@/shared/i18n";

const labels: Record<SupportedLanguage, string> = {
  ru: "RU",
  kg: "KG",
  en: "EN",
};

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  function changeLanguage(language: SupportedLanguage) {
    localStorage.setItem("birgefund-language", language);
    void i18n.changeLanguage(language);
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
      aria-label={t("actions.switchLanguage")}
    >
      <Globe2 className="ml-2 text-slate-500 dark:text-slate-400" size={16} />

      {supportedLanguages.map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => changeLanguage(language)}
          className={
            language === currentLanguage
              ? "rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-emerald-600"
              : "rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }
        >
          {labels[language]}
        </button>
      ))}
    </div>
  );
}
