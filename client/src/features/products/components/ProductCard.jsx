import { Card, Button, Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./ProductCard.css";

export function ProductCard({ product, onView, onAddToCart, motionVariant }) {
  const { t } = useTranslation();

  return (
    <motion.div variants={motionVariant}>
      <Card
        className="product-card"
        hoverable
        cover={
          product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} loading="lazy" />
          ) : null
        }
      >
        {product.category ? <Tag color="geekblue">{product.category}</Tag> : null}
        <h3>{product.title}</h3>
        <div className="product-card__pricing">
          <span className="product-card__price">
            ${product.price?.toFixed?.(2) ?? product.price}
          </span>
          {product.discountPercentage ? (
            <span className="product-card__discount">-{product.discountPercentage}%</span>
          ) : null}
        </div>
        <div className="product-card__meta">
          {product.brand ? <span>{product.brand}</span> : <span />}
          {product.rating ? (
            <span className="product-card__rating">★ {product.rating?.toFixed?.(1)}</span>
          ) : null}
        </div>
        <div className="product-card__actions">
          <Button type="text" onClick={() => onView?.(product)}>
            {t("home.products.viewDetails")}
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart?.(product)}
          >
            {t("home.products.addToCart")}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
