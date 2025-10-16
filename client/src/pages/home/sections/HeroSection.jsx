import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Tag, Card, List, Spin, Input } from "antd";
import { SearchOutlined, ShoppingOutlined, RocketOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useLocale } from "../../../providers/LocaleProvider.jsx";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useProductSearch } from "../../../features/search/hooks/useProductSearch";
import { VARIANTS, TRANSITIONS } from "../../../styles/motion";
import "./HeroSection.css";

const SUGGESTION_LIMIT = 4;

export default function HeroSection({ onScrollToggle }) {
  const { t } = useTranslation();
  const { direction, locale } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 260);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductSearch(debouncedQuery, { pageSize: SUGGESTION_LIMIT });

  const suggestions = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages
      .flatMap((page) => page.items ?? [])
      .slice(0, SUGGESTION_LIMIT);
  }, [data]);

  const trending = useMemo(
    () => t("home.hero.trendingTags", { returnObjects: true }),
    [t],
  );

  const currencyFormatter = useMemo(() => {
    const localeKey = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(localeKey, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }, [locale]);

  const handleViewAll = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [navigate, query]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (suggestions.length >= SUGGESTION_LIMIT) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, suggestions.length]);

  useEffect(() => {
    if (!onScrollToggle) return;
    const handler = () => {
      onScrollToggle(window.scrollY > 400);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [onScrollToggle]);

  return (
    <section className="hero-section">
      <motion.div
        className="hero-section__content"
        initial="initial"
        animate="animate"
        variants={VARIANTS.fadeInUp}
        transition={TRANSITIONS.entrance}
      >
        <div className="hero-section__copy">
          <motion.div variants={VARIANTS.fadeInUp}>
            <Tag icon={<RocketOutlined />} color="blue" className="hero-section__tagline">
              {t("home.hero.tagline")}
            </Tag>
          </motion.div>
          <motion.div variants={VARIANTS.fadeInUp}>
            <Typography.Title level={1}>{t("home.hero.title")}</Typography.Title>
          </motion.div>
          <motion.div variants={VARIANTS.fadeInUp}>
            <Typography.Paragraph className="hero-section__subtitle">
              {t("home.hero.subtitle")}
            </Typography.Paragraph>
          </motion.div>

          <motion.div variants={VARIANTS.fadeInUp} className="hero-section__search">
            <InputWithSuggestions
              query={query}
              setQuery={setQuery}
              suggestions={suggestions}
              isLoading={isLoading}
              currencyFormatter={currencyFormatter}
              handleViewAll={handleViewAll}
              handleSelect={(id) => navigate(`/products/${id}`)}
            />
          </motion.div>

          <motion.div variants={VARIANTS.fadeInUp} className="hero-section__actions">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/products")}
            >
              {t("home.hero.ctaBrowse")}
            </Button>
            <div className="hero-section__info">
              <Typography.Text strong>{t("home.hero.deliveryTitle")}</Typography.Text>
              <Typography.Text type="secondary">
                {t("home.hero.deliverySubtitle")}
              </Typography.Text>
            </div>
          </motion.div>

          <motion.div variants={VARIANTS.fadeInUp} className="hero-section__trending">
            <span>{t("home.hero.trendingLabel")}</span>
            <div className="hero-section__trending-tags">
              {Array.isArray(trending)
                ? trending.map((tag) => (
                    <Tag
                      key={tag}
                      onClick={() => {
                        setQuery(tag);
                        navigate(`/search?q=${encodeURIComponent(tag)}`);
                      }}
                    >
                      #{tag}
                    </Tag>
                  ))
                : null}
            </div>
          </motion.div>
        </div>

        <motion.div className="hero-section__visual" variants={VARIANTS.scaleIn} initial="initial" animate="animate">
          <div className={`hero-visual hero-visual--${direction}`}>
            <div className="hero-visual__glow" />
            <div className="hero-visual__card">
              <div className="hero-visual__badge">{t("home.hero.badgeNew")}</div>
              <Typography.Title level={3}>{t("home.hero.featuredTitle")}</Typography.Title>
              <Typography.Paragraph>{t("home.hero.featuredSubtitle")}</Typography.Paragraph>
              <Button type="link" icon={<ArrowIcon direction={direction} />} onClick={() => navigate("/products")}>
                {t("home.hero.featuredCTA")}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function InputWithSuggestions({
  query,
  setQuery,
  suggestions,
  isLoading,
  currencyFormatter,
  handleViewAll,
  handleSelect,
}) {
  return (
    <>
      <Input.Search
        size="large"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for gadgets, fashion, decor..."
        enterButton={<Button type="primary" size="large">Search</Button>}
        prefix={<SearchOutlined />}
        onSearch={handleViewAll}
      />
      {query.length ? (
        <Card className="hero-section__suggestions" size="small">
          {isLoading ? (
            <Spin />
          ) : suggestions.length ? (
            <List
              dataSource={suggestions}
              renderItem={(item) => (
                <List.Item className="hero-section__suggestions-item" onClick={() => handleSelect(item.id)}>
                  <List.Item.Meta title={item.title} description={item.brand} />
                  <div className="hero-section__price">
                    {currencyFormatter.format(item.price ?? 0)}
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Typography.Text type="secondary">No results</Typography.Text>
          )}
        </Card>
      ) : null}
    </>
  );
}

function ArrowIcon({ direction }) {
  return direction === "rtl" ? <span className="hero-section__arrow">←</span> : <span className="hero-section__arrow">→</span>;
}
