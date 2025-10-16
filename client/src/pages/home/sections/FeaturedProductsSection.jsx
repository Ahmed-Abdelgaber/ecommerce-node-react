import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Skeleton, Empty, Spin, App as AntdApp } from "antd";
import { motion } from "framer-motion";
import { useInfiniteProducts } from "../../../features/products/hooks/useInfiniteProducts";
import { ProductCard } from "../../../features/products/components/ProductCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { useUser } from "../../../hooks/useUser";
import { useAppDispatch } from "../../../store/hooks";
import { upsertItem } from "../../../store/cart/cartSlice";
import { VARIANTS } from "../../../styles/motion";
import { trackEvent } from "../../../services/analytics";
import "./FeaturedProductsSection.css";

export default function FeaturedProductsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { isAuthenticated } = useUser();
  const dispatch = useAppDispatch();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({ pageSize: 12, sort: "newest" });

  const products = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((page) => page.items ?? []);
  }, [data]);

  const sentinelRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1 },
  );

  const handleViewProduct = useCallback(
    (product) => {
      trackEvent("product.view", { id: product.id, from: "home_featured" });
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
      trackEvent("cart.add", { id: product.id, from: "home_featured" });
    },
    [dispatch, isAuthenticated, message, navigate, t],
  );

  return (
    <section className="products-section">
      <div className="products-section__header">
        <div>
          <h2>{t("home.products.title")}</h2>
          <p>{t("home.products.subtitle")}</p>
        </div>
        <Button type="link" onClick={() => navigate("/products")}>
          {t("home.products.viewAll")}
        </Button>
      </div>

      {isLoading && !products.length ? (
        <div className="products-section__skeleton-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="product-skeleton">
              <Skeleton.Image active style={{ width: "100%", height: 180 }} />
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !products.length ? (
        <Empty description={t("common.noResults")} />
      ) : null}

      <motion.div
        className="products-grid"
        variants={VARIANTS.staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={handleViewProduct}
            onAddToCart={handleAddToCart}
            motionVariant={VARIANTS.fadeInUp}
          />
        ))}
      </motion.div>

      <div ref={sentinelRef} className="products-section__sentinel">
        {isFetchingNextPage ? <Spin /> : null}
      </div>
    </section>
  );
}
