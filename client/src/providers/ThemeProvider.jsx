import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { applyThemeVariables, getThemeDefinition } from "../styles/themeTokens";

const STORAGE_KEY = "ecommerce.theme";
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && Object.values(THEMES).includes(stored)) {
      return stored;
    }
  } catch (err) {}
  return null;
}

function inferPreferredTheme() {
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}

function applyThemeClasses(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("theme-dark", theme === THEMES.DARK);
  root.classList.toggle("theme-light", theme === THEMES.LIGHT);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme() ?? inferPreferredTheme());
  const definition = useMemo(() => getThemeDefinition(theme), [theme]);

  useEffect(() => {
    applyThemeClasses(theme);
    applyThemeVariables(definition);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {}
  }, [theme, definition]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media?.addEventListener) return undefined;

    const handler = (event) => {
      const stored = readStoredTheme();
      if (stored) return;
      setThemeState(event.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (Object.values(THEMES).includes(nextTheme)) {
      setThemeState(nextTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      setTheme,
      toggleTheme,
      definition,
    }),
    [theme, setTheme, toggleTheme, definition],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
