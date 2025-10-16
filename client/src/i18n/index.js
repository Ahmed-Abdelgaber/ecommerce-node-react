import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import arCommon from "./locales/ar/common.json";

export const DEFAULT_NAMESPACE = "common";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "ar"];

const resources = {
  en: {
    [DEFAULT_NAMESPACE]: enCommon,
  },
  ar: {
    [DEFAULT_NAMESPACE]: arCommon,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [DEFAULT_NAMESPACE],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18n;
