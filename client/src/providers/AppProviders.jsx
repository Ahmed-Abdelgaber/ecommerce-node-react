import { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { LocaleProvider, useLocale } from "./LocaleProvider.jsx";
import { ThemeProvider, useTheme, THEMES } from "./ThemeProvider.jsx";
import { UserProvider } from "./UserProvider.jsx";
import { queryClient } from "../query";
import { store } from "../store";
import { getAntdThemeConfig } from "../styles/themeTokens";

function AntdConfigBridge({ children }) {
  const { antdLocale, direction } = useLocale();
  const { theme, definition } = useTheme();

  const algorithms = theme === THEMES.DARK ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm];

  const themeConfig = useMemo(
    () => ({
      ...getAntdThemeConfig(definition, algorithms),
      algorithm: algorithms,
    }),
    [definition, algorithms],
  );

  return (
    <ConfigProvider locale={antdLocale} direction={direction} theme={themeConfig}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}

export function AppProviders({ children }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LocaleProvider>
            <AntdConfigBridge>
              <UserProvider>{children}</UserProvider>
            </AntdConfigBridge>
          </LocaleProvider>
        </ThemeProvider>
        {import.meta.env.DEV ? (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        ) : null}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
