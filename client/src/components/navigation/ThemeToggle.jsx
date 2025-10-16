import { Switch, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useTheme, THEMES } from "../../providers/ThemeProvider.jsx";

export function ThemeToggle({ size = "default" }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const tooltipTitle = useMemo(
    () =>
      theme === THEMES.DARK
        ? t("theme.switchToLight")
        : t("theme.switchToDark"),
    [theme, t],
  );

  return (
    <Tooltip title={tooltipTitle}>
      <Switch
        size={size === "small" ? "small" : "default"}
        checked={theme === THEMES.DARK}
        checkedChildren="🌙"
        unCheckedChildren="☀️"
        onChange={toggleTheme}
      />
    </Tooltip>
  );
}
