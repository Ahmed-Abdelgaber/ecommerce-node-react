import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { SearchFiltersBar } from "../search/components/SearchFiltersBar.jsx";
import { SearchResults } from "../search/components/SearchResults.jsx";
import "./products.css";

export default function ProductsPage() {
  const { t } = useTranslation();

  return (
    <div className="products-page">
      <header className="products-page__header">
        <Typography.Title level={2}>{t("catalog.title")}</Typography.Title>
        <Typography.Paragraph>{t("catalog.subtitle")}</Typography.Paragraph>
      </header>
      <SearchFiltersBar />
      <SearchResults />
    </div>
  );
}
