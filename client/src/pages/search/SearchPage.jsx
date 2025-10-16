import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { SearchFiltersBar } from "./components/SearchFiltersBar.jsx";
import { SearchResults } from "./components/SearchResults.jsx";
import { useSearchFilters } from "./hooks/useSearchFilters.js";
import "./search.css";

export default function SearchPage() {
  const { t } = useTranslation();
  const { filters } = useSearchFilters();

  return (
    <div className="search-page">
      <header className="search-page__header">
        <Typography.Title level={2}>
          {filters.q
            ? t("search.resultsFor", { query: filters.q })
            : t("search.discover")}
        </Typography.Title>
        <Typography.Paragraph>{t("home.products.subtitle")}</Typography.Paragraph>
      </header>
      <SearchFiltersBar />
      <SearchResults />
    </div>
  );
}
