import i18next from "i18next";
import en from "./en.json";
import id from "./id.json";

const resources: Record<string, any> = {
  en: { translation: en },
  id: { translation: id },
};

export async function initI18n(locale?: string) {
  if (typeof document !== "undefined") {
    if (!locale) locale = document.documentElement.lang || "en";

    if (!i18next.isInitialized) {
      await i18next.init({
        lng: locale,
        fallbackLng: "en",
        resources,
        interpolation: { escapeValue: false },
      });
    } else if (i18next.language !== locale) {
      await i18next.changeLanguage(locale);
    }
    return i18next.t.bind(i18next);
  }

  const instance = i18next.createInstance();
  await instance.init({
    lng: locale || "en",
    fallbackLng: "en",
    resources,
    interpolation: { escapeValue: false },
  });

  return instance.t.bind(instance);
}
