const BASE_VARS = {
  "--font-family-base": '"Inter", "Cairo", "Helvetica Neue", Arial, sans-serif',
  "--font-family-display": '"Inter", "Cairo", "Helvetica Neue", Arial, sans-serif',
  "--font-family-arabic": '"Cairo", "Inter", "Helvetica Neue", Arial, sans-serif',
  "--border-radius-xs": "6px",
  "--border-radius-sm": "10px",
  "--border-radius-md": "14px",
  "--border-radius-lg": "18px",
  "--shadow-sm": "0 6px 18px rgba(24, 39, 75, 0.08)",
  "--shadow-md": "0 12px 32px rgba(15, 23, 42, 0.16)",
  "--shadow-lg": "0 24px 64px rgba(15, 23, 42, 0.18)",
  "--transition-fast": "160ms cubic-bezier(0.4, 0, 0.2, 1)",
  "--transition-base": "220ms cubic-bezier(0.4, 0, 0.2, 1)",
  "--transition-slow": "360ms cubic-bezier(0.45, 0, 0.2, 1)",
};

const lightTheme = {
  name: "light",
  cssVars: {
    "--color-bg-body": "#FFF7DD",
    "--color-bg-surface": "#FFFFFF",
    "--color-bg-surface-muted": "#F6F8FB",
    "--color-bg-hero": "rgba(255, 247, 221, 0.94)",
    "--color-primary": "#80A1BA",
    "--color-primary-strong": "#5A7CA0",
    "--color-secondary": "#91C4C3",
    "--color-accent": "#B4DEBD",
    "--color-outline": "#E1E6EC",
    "--color-outline-strong": "#C8D3DF",
    "--color-text-primary": "#1E2A3A",
    "--color-text-secondary": "#4A5A6A",
    "--color-text-on-primary": "#FFFFFF",
  },
  antdToken: {
    colorPrimary: "#80A1BA",
    colorPrimaryHover: "#6D92AF",
    colorPrimaryActive: "#5A7CA0",
    colorBgBase: "#FFF7DD",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorText: "#1E2A3A",
    colorTextSecondary: "#4A5A6A",
    colorBorder: "#E1E6EC",
    colorBorderSecondary: "#C8D3DF",
    colorLink: "#5A7CA0",
    colorLinkHover: "#4C6D8A",
    borderRadius: 12,
  },
  antdComponents: {
    Button: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 20,
      paddingLG: 28,
    },
    Input: {
      borderRadius: 12,
    },
  },
};

const darkTheme = {
  name: "dark",
  cssVars: {
    "--color-bg-body": "#27374D",
    "--color-bg-surface": "#2F435D",
    "--color-bg-surface-muted": "#1F2D3F",
    "--color-bg-hero": "rgba(39, 55, 77, 0.94)",
    "--color-primary": "#9DB2BF",
    "--color-primary-strong": "#DDE6ED",
    "--color-secondary": "#526D82",
    "--color-accent": "#DDE6ED",
    "--color-outline": "rgba(221, 230, 237, 0.24)",
    "--color-outline-strong": "rgba(221, 230, 237, 0.42)",
    "--color-text-primary": "#F5F9FF",
    "--color-text-secondary": "#C0CFDD",
    "--color-text-on-primary": "#1E2A3A",
  },
  antdToken: {
    colorPrimary: "#9DB2BF",
    colorPrimaryHover: "#B7C5CF",
    colorPrimaryActive: "#D1DCE3",
    colorBgBase: "#27374D",
    colorBgContainer: "#2F435D",
    colorBgElevated: "#324760",
    colorText: "#F5F9FF",
    colorTextSecondary: "#C0CFDD",
    colorBorder: "rgba(221, 230, 237, 0.24)",
    colorBorderSecondary: "rgba(221, 230, 237, 0.36)",
    colorLink: "#DDE6ED",
    colorLinkHover: "#F0F4F8",
    borderRadius: 12,
  },
  antdComponents: {
    Button: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 20,
      paddingLG: 28,
      colorBgContainer: "#324760",
    },
    Input: {
      borderRadius: 12,
      colorBgContainer: "#1F2D3F",
      colorBorder: "rgba(221, 230, 237, 0.24)",
    },
  },
};

export const THEME_DEFINITIONS = {
  light: lightTheme,
  dark: darkTheme,
};

export function getThemeDefinition(theme) {
  return THEME_DEFINITIONS[theme] ?? lightTheme;
}

export function applyThemeVariables(definition) {
  const root = document.documentElement;
  const merged = { ...BASE_VARS, ...definition.cssVars };
  Object.entries(merged).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function getAntdThemeConfig(definition, algorithms) {
  return {
    algorithm: algorithms,
    token: definition.antdToken,
    components: definition.antdComponents,
  };
}
