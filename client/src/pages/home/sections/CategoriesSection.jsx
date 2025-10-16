import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Tag, Spin } from "antd";
import {
  AppstoreOutlined,
  MobileOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  CoffeeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFeaturedCategories } from "../../../features/categories/hooks/useFeaturedCategories";
import { VARIANTS } from "../../../styles/motion";
import "./CategoriesSection.css";

const ICON_MAP = {
  smartphones: <MobileOutlined />,
  laptops: <LaptopOutlined />,
  accessories: <ShoppingOutlined />,
  furniture: <HomeOutlined />,
  skincare: <SkinOutlined />,
  beverages: <CoffeeOutlined />,
};

export default function CategoriesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useFeaturedCategories({ size: 80 });

  const categories = useMemo(() => data ?? [], [data]);

  return (
    <section className="categories-section">
      <div className="categories-section__header">
        <div>
          <h2>{t("home.categories.title")}</h2>
          <p>{t("home.categories.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="categories-section__loading">
          <Spin />
        </div>
      ) : (
        <motion.div
          className="categories-section__grid"
          variants={VARIANTS.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categories.slice(0, 12).map((category) => (
            <motion.button
              key={category.slug}
              className="category-card"
              variants={VARIANTS.fadeInUp}
              type="button"
              onClick={() => navigate(`/products?category=${category.slug}`)}
            >
              <Card bordered={false}>
                <div className="category-card__icon">
                  {ICON_MAP[category.slug] ?? <AppstoreOutlined />}
                </div>
                <div className="category-card__content">
                  <h3>{category.label}</h3>
                  <Tag bordered={false} color="blue">
                    {category.count} {t("home.categories.itemsLabel")}
                  </Tag>
                </div>
                {category.sampleImage ? (
                  <div className="category-card__image">
                    <img src={category.sampleImage} alt={category.label} />
                  </div>
                ) : null}
              </Card>
            </motion.button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
