import { Button, Dropdown } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useLocale } from "../../providers/LocaleProvider.jsx";
import { SUPPORTED_LOCALES } from "../../i18n";

const LABELS = {
  en: "English",
  ar: "العربية",
};

export function LocaleToggle({ size = "middle" }) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      SUPPORTED_LOCALES.map((code) => ({
        key: code,
        label: LABELS[code] ?? code,
        onClick: () => setLocale(code),
      })),
    [setLocale],
  );

  return (
    <Dropdown trigger={["click"]} menu={{ items }}>
      <Button
        size={size}
        icon={<GlobalOutlined />}
        aria-label={
          locale === "ar"
            ? t("language.switchToEnglish")
            : t("language.switchToArabic")
        }
      >
        {LABELS[locale] ?? locale.toUpperCase()}
      </Button>
    </Dropdown>
  );
}
