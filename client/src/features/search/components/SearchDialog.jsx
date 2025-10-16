import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Modal, Input, List, Typography, Button, Empty, Spin } from "antd";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../providers/LocaleProvider.jsx";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue.js";
import { useProductSearch } from "../hooks/useProductSearch.js";
import { VARIANTS, VIEWPORT } from "../../../styles/motion.js";
import { trackEvent } from "../../../services/analytics";
import "./SearchDialog.css";

const PAGE_SIZE = 8;

export function SearchDialog({ open, onClose }) {
  const { t } = useTranslation();
  const { direction, locale } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 280);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useProductSearch(debouncedQuery, { pageSize: PAGE_SIZE });

  const currencyFormatter = useMemo(() => {
    const localeKey = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(localeKey, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }, [locale]);

  const results = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((page) => page.items ?? []);
  }, [data]);

  const modalWidth = useMemo(() => {
    if (typeof window === "undefined") return 720;
    return Math.min(720, window.innerWidth - 32);
  }, []);

  const hasQuery = Boolean((debouncedQuery ?? "").trim());

  const sentinelRef = useRef(null);

 const handleNavigateAll = useCallback(() => {
   const q = query || debouncedQuery;
   if (!q) return;
   onClose?.();
    trackEvent("search.dialog.viewAll", { query: q });
   navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [navigate, query, debouncedQuery, onClose]);

  const handleSelectProduct = useCallback(
    (id) => {
      onClose?.();
      trackEvent("search.dialog.select", { id });
      navigate(`/products/${id}`);
    },
    [navigate, onClose],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !open || !hasQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [open, hasQuery, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const modalTitle = (
    <div className="search-dialog__title">
      <SearchOutlined />
      <span>{t("header.searchPlaceholder")}</span>
    </div>
  );

  return (
    <Modal
      className="search-dialog"
      open={open}
      onCancel={onClose}
      title={modalTitle}
      footer={null}
      width={modalWidth}
      centered
      destroyOnClose
      wrapClassName={`search-dialog__wrap search-dialog__wrap--${direction}`}
      bodyStyle={{ padding: "1.5rem 1.5rem 2rem" }}
    >
      <Input
        autoFocus
        size="large"
        placeholder={t("header.searchPlaceholder")}
        prefix={<SearchOutlined />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        allowClear
      />

      <div className="search-dialog__results">
        {isLoading ? (
          <div className="search-dialog__loading">
            <Spin />
          </div>
        ) : null}

        {!isLoading && hasQuery && !results.length ? (
          <Empty description={t("common.noResults")} />
        ) : null}

        {!hasQuery ? (
          <Typography.Paragraph className="search-dialog__hint">
            {t(
              "common.searchHint",
              "Start typing to explore products, categories, and brands.",
            )}
          </Typography.Paragraph>
        ) : null}

        <AnimatePresence initial={false} mode="popLayout">
          {results.length ? (
            <List
              itemLayout="horizontal"
              dataSource={results}
              renderItem={(item, index) => (
                <motion.div
                  key={item.id ?? index}
                  variants={VARIANTS.fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  viewport={VIEWPORT}
                  transition={{ delay: index * 0.02 }}
                >
                  <List.Item
                    className="search-dialog__item"
                    onClick={() => handleSelectProduct(item.id)}
                  >
                    <List.Item.Meta
                      title={
                        <Typography.Link onClick={() => handleSelectProduct(item.id)}>
                          {item.title}
                        </Typography.Link>
                      }
                      description={
                        <span className="search-dialog__meta">
                          {item.brand ? `${item.brand} • ` : ""}
                          {currencyFormatter.format(item.price ?? 0)}
                        </span>
                      }
                    />
                  </List.Item>
                </motion.div>
              )}
            />
          ) : null}
        </AnimatePresence>

        <div ref={sentinelRef} />

        {hasQuery && (hasNextPage || isFetchingNextPage) ? (
          <div className="search-dialog__loadmore">
            <Spin spinning={isFetchingNextPage}>
              <Button type="link" onClick={() => fetchNextPage()}>
                {t("common.loadMore")}
              </Button>
            </Spin>
          </div>
        ) : null}

        {hasQuery && error ? (
          <Typography.Paragraph type="danger" className="search-dialog__error">
            {t("common.error")}
          </Typography.Paragraph>
        ) : null}
      </div>

      {hasQuery && results.length ? (
        <Button type="primary" size="large" block onClick={handleNavigateAll}>
          <span className={`search-dialog__cta search-dialog__cta--${direction}`}>
            {direction === "rtl" ? <ArrowRightOutlined /> : null}
            <span>{t("common.viewAll")}</span>
            {direction !== "rtl" ? <ArrowRightOutlined /> : null}
          </span>
        </Button>
      ) : null}
    </Modal>
  );
}
