import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import kg from "./kg.json";
import ru from "./ru.json";

export const supportedLanguages = ["ru", "kg", "en"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const savedLanguage = localStorage.getItem("birgefund-language");

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kg: { translation: kg },
    en: { translation: en },
  },
  lng: supportedLanguages.includes(savedLanguage as SupportedLanguage)
    ? savedLanguage!
    : "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
