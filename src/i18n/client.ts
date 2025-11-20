import i18next from "i18next";
import { useState, useEffect } from "react";
import en from "./en.json";
import id from "./id.json";

const resources: Record<string, any> = {
  en: { translation: en },
  id: { translation: id }
};

function syncTranslate(lang: string, key: string, options?: any) {
  const keys = key.split('.');
  let value = resources[lang]?.translation;
  
  for (const k of keys) {
    if (!value) break;
    value = value[k];
  }
  
  let result = value || key;

  // Perform simple replacement if options exist
  if (options && typeof result === 'string') {
    Object.keys(options).forEach(optKey => {
      result = result.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
    });
  }

  return result;
}

export async function initI18n(locale?: string) {
  if (typeof document !== "undefined") {
     if (!locale) locale = document.documentElement.lang || "en";
     
     if (!i18next.isInitialized) {
       await i18next.init({
         lng: locale,
         fallbackLng: "en",
         resources,
         interpolation: { escapeValue: false }
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
    interpolation: { escapeValue: false }
  });
  
  return instance.t.bind(instance);
}

export function useTranslation(initialLang?: string) {
  const [t, setT] = useState(() => {
    if (i18next.isInitialized) return i18next.t.bind(i18next);
    // Updated to accept options
    if (initialLang) return (key: string, options?: any) => syncTranslate(initialLang, key, options);
    return (key: string) => key;
  });

  const [loaded, setLoaded] = useState(i18next.isInitialized || !!initialLang);

  useEffect(() => {
    const initClient = async () => {
      const translate = await initI18n(initialLang);
      setT(() => translate);
      setLoaded(true);
    };
    initClient();
  }, [initialLang]);

  return { t, loaded };
}