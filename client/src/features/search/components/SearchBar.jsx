import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { memo, useCallback } from "react";
import "./SearchBar.css";

export const SearchBar = memo(function SearchBar({ onOpen }) {
  const { t } = useTranslation();

  const handleActivate = useCallback(() => {
    onOpen?.();
  }, [onOpen]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen?.();
      }
    },
    [onOpen],
  );

  return (
    <div
      className="search-bar__wrapper"
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-haspopup="dialog"
      aria-expanded={false}
    >
      <Input
        size="large"
        prefix={<SearchOutlined />}
        placeholder={t("header.searchPlaceholder")}
        readOnly
        onFocus={handleActivate}
      />
    </div>
  );
});
