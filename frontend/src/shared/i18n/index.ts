import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "./ru.json";
import kg from "./kg.json";
import en from "./en.json";

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kg: { translation: kg },
    en: { translation: en },
  },
  lng: "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;