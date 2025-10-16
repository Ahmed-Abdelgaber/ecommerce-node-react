import { useState, useEffect, useMemo, useCallback } from "react";
import { Input, Select, Switch, Button, Tag, Space, Tooltip } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useFeaturedCategories } from "../../../features/categories/hooks/useFeaturedCategories";
import { useSearchFilters } from "../hooks/useSearchFilters";
import { trackEvent } from "../../../services/analytics";
import "./SearchFiltersBar.css";

const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "rating_desc"];

export function SearchFiltersBar() {
  const { t } = useTranslation();
  const { filters, setFilter, setFilters, resetFilters } = useSearchFilters();
  const { data: categories } = useFeaturedCategories({ size: 120 });
  const [keyword, setKeyword] = useState(filters.q);

  useEffect(() => {
    setKeyword(filters.q);
  }, [filters.q]);

  const categoryOptions = useMemo(() => {
    const base = [{ label: t("header.allCategories"), value: "" }];
    if (!categories?.length) return base;
    return base.concat(
      categories.slice(0, 30).map((category) => ({
        label: category.label,
        value: category.slug,
      })),
    );
  }, [categories, t]);

  const handleKeywordSearch = useCallback(
    (value) => {
      setFilter("q", value.trim());
      trackEvent("search.keyword", { query: value.trim() });
    },
    [setFilter],
  );

  const sliderValue = useMemo(() => {
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 2000);
    return [min, max];
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <div className="search-filters">
      <div className="search-filters__bar">
        <Input.Search
          size="large"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onSearch={handleKeywordSearch}
          placeholder={t("header.searchPlaceholder")}
          allowClear
          enterButton
        />
        <Select
          size="large"
          className="search-filters__select"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => {
            setFilter("category", value);
            trackEvent("search.filter.category", { category: value });
          }}
          popupMatchSelectWidth={false}
        />
        <Select
          size="large"
          className="search-filters__select"
          value={filters.sort}
          onChange={(value) => {
            setFilter("sort", value);
            trackEvent("search.filter.sort", { sort: value });
          }}
          options={SORT_OPTIONS.map((option) => ({
            value: option,
            label: t(`search.sort.${option}`),
          }))}
        />
        <Tooltip title={t("search.filters.inStock")}>
          <Space>
            <Switch
              checked={filters.inStock}
              onChange={(checked) => {
                setFilter("inStock", checked);
                trackEvent("search.filter.inStock", { inStock: checked });
              }}
            />
            <span className="search-filters__switch-label">
              {t("search.filters.inStock")}
            </span>
          </Space>
        </Tooltip>
        <Tooltip title={t("search.filters.more")}>
          <Button icon={<FilterOutlined />} size="large" disabled>
            {t("search.filters.more")}
          </Button>
        </Tooltip>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              resetFilters();
              trackEvent("search.filter.reset");
            }}
          >
            {t("search.filters.reset")}
          </Button>
      </div>

      <div className="search-filters__chips">
        {filters.category ? (
          <Tag
            closable
            onClose={() => setFilter("category", "")}
            color="blue"
          >
            {categoryOptions.find((opt) => opt.value === filters.category)?.label ?? filters.category}
          </Tag>
        ) : null}
        {filters.inStock ? (
          <Tag closable onClose={() => setFilter("inStock", false)} color="green">
            {t("search.filters.inStock")}
          </Tag>
        ) : null}
        {filters.minPrice || filters.maxPrice ? (
          <Tag
            closable
            onClose={() => setFilters({ minPrice: "", maxPrice: "" })}
            color="purple"
          >
            {t("search.filters.priceRange", {
              min: filters.minPrice || "0",
              max: filters.maxPrice || t("search.filters.any"),
            })}
          </Tag>
        ) : null}
      </div>

      <div className="search-filters__range">
        <span className="search-filters__range-label">{t("search.filters.priceTitle")}</span>
        <Slider
          range
          min={0}
          max={2000}
          step={10}
          value={sliderValue}
          allowCross={false}
          onAfterChange={([min, max]) => {
            const payload = {
              minPrice: min <= 0 ? "" : min,
              maxPrice: max >= 2000 ? "" : max,
            };
            setFilters(payload);
            trackEvent("search.filter.priceRange", payload);
          }}
        />
        <div className="search-filters__range-values">
          <Input
            addonBefore="$"
            value={filters.minPrice}
            placeholder="0"
            onChange={(event) => setFilter("minPrice", event.target.value)}
            style={{ maxWidth: 160 }}
          />
          <Input
            addonBefore="$"
            value={filters.maxPrice}
            placeholder={t("search.filters.any")}
            onChange={(event) => setFilter("maxPrice", event.target.value)}
            style={{ maxWidth: 160 }}
          />
        </div>
      </div>
    </div>
  );
}
