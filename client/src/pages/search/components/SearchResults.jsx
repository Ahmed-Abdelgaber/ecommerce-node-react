import { useMemo, useCallback } from "react";
import { Empty, Spin, Skeleton, Result, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSearchFilters } from "../hooks/useSearchFilters";
import { useInfiniteProducts } from "../../../features/products/hooks/useInfiniteProducts";
import { ProductCard } from "../../../features/products/components/ProductCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { VARIANTS } from "../../../styles/motion";
import { useUser } from "../../../hooks/useUser";
import { useAppDispatch } from "../../../store/hooks";
import { upsertItem } from "../../../store/cart/cartSlice";
import { trackEvent } from "../../../services/analytics";
import "./SearchResults.css";

export function SearchResults() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { filters } = useSearchFilters();
  const { isAuthenticated } = useUser();
  const dispatch = useAppDispatch();
  const { message } = AntdApp.useApp();

  const productQuery = useInfiniteProducts({
    sort: filters.sort,
    filters: {
      q: filters.q,
      category: filters.category,
      inStock: filters.inStock || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
    },
    pageSize: 12,
    enabled: true,
  });

  const products = useMemo(() => {
    if (!productQuery.data?.pages?.length) return [];
    return productQuery.data.pages.flatMap((page) => page.items ?? []);
  }, [productQuery.data]);

  const sentinelRef = useIntersectionObserver(
    () => {
      if (productQuery.hasNextPage && !productQuery.isFetchingNextPage) {
        productQuery.fetchNextPage();
      }
    },
    { threshold: 1 },
  );

  const handleView = useCallback(
    (product) => {
      trackEvent("product.view", { id: product.id, from: "search" });
      navigate(`/products/${product.id}`);
    },
    [navigate],
  );

  const handleAddToCart = useCallback(
    (product) => {
      if (!isAuthenticated) {
        navigate(`/auth/signin?redirect=/products/${product.id}`);
        return;
      }
      dispatch(
        upsertItem({
          id: product.id,
          title: product.title,
          quantity: 1,
          price: product.price,
          thumbnail: product.thumbnail ?? product.images?.[0],
        }),
      );
      message.success(t("home.products.added"));
      trackEvent("cart.add", { id: product.id, from: "search" });
    },
    [dispatch, isAuthenticated, message, navigate, t],
  );

  if (productQuery.isError) {
    return (
      <Result
        status="error"
        title={t("common.error")}
        subTitle={productQuery.error?.message ?? t("search.placeholder")}
      />
    );
  }

  return (
    <div className="search-results">
      {productQuery.isLoading && !products.length ? (
        <div className="search-results__skeleton">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="product-skeleton">
              <Skeleton.Image active style={{ width: "100%", height: 180 }} />
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          ))}
        </div>
      ) : null}

      {!productQuery.isLoading && !products.length ? (
        <Empty description={t("common.noResults")} />
      ) : null}

      <motion.div
        className="search-results__grid"
        variants={VARIANTS.staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={handleView}
            onAddToCart={handleAddToCart}
            motionVariant={VARIANTS.fadeInUp}
          />
        ))}
      </motion.div>

      <div ref={sentinelRef} className="search-results__sentinel">
        {productQuery.isFetchingNextPage ? <Spin /> : null}
      </div>
    </div>
  );
}
