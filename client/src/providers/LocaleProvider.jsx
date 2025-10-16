import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import enUS from "antd/locale/en_US";
import arEG from "antd/locale/ar_EG";
import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n";

const STORAGE_KEY = "ecommerce.locale";
const DIRECTION_MAP = {
  en: "ltr",
  ar: "rtl",
};
const ANT_LOCALE_MAP = {
  en: enUS,
  ar: arEG,
};

const LocaleContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored;
    }
  } catch (err) {}
  return null;
}

function inferNavigatorLocale() {
  const navLang =
    window.navigator?.languages?.[0] ||
    window.navigator?.language ||
    window.navigator?.userLanguage;
  if (!navLang) return DEFAULT_LOCALE;
  const normalized = navLang.toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function applyDocumentAttributes(locale) {
  const dir = DIRECTION_MAP[locale] ?? "ltr";
  document.documentElement.setAttribute("lang", locale);
  document.documentElement.setAttribute("dir", dir);
  document.body?.setAttribute("dir", dir);
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale() ?? inferNavigatorLocale());

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch(() => {});
    }
    applyDocumentAttributes(locale);
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch (err) {}
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    if (SUPPORTED_LOCALES.includes(nextLocale)) {
      setLocaleState(nextLocale);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const direction = DIRECTION_MAP[locale] ?? "ltr";

  const value = useMemo(
    () => ({
      locale,
      direction,
      isRTL: direction === "rtl",
      antdLocale: ANT_LOCALE_MAP[locale] ?? enUS,
      setLocale,
      toggleLocale,
    }),
    [locale, direction, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
