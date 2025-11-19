import i18next from "i18next";
import en from "./en.json";
import id from "./id.json";

export async function initI18n() {
    await i18next.init({
        lng: navigator.language.startsWith("id") ? "id" : "en",
        fallbackLng: "en",
        resources: {
            en: { translation: en },
            id: { translation: id }
        }
    });

    return i18next.t.bind(i18next);
}
