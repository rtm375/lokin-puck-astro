import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import id from "./id.json";

const resources: Record<string, any> = {
  en: { translation: en },
  id: { translation: id },
};

// Initialize i18next for React client
i18next.use(initReactI18next).init({
  lng:
    typeof document !== "undefined"
      ? document.documentElement.lang || "en"
      : "en",
  fallbackLng: "en",
  resources,
  interpolation: { escapeValue: false },
});

export default i18next;
