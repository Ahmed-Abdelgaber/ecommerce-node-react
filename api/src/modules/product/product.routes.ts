import { Router } from "express";
import validate from "@app/http/validator";
import {
  ListFiltersSchema,
  ProductIdParamSchema,
  CategoryParamSchema,
  BrandParamSchema,
  TagParamSchema,
  PaginationQuerySchema,
} from "@modules/product/product.schema";
import {
  listProductsController,
  getProductController,
  listProductsByCategoryController,
  listProductsByBrandController,
  listProductsByTagController,
} from "@modules/product/product.controller";

const router = Router();

// /api/products
router.get("/", validate(ListFiltersSchema, "query"), listProductsController);

// /api/products/category/:category
router.get(
  "/category/:category",
  validate(CategoryParamSchema, "params"),
  validate(PaginationQuerySchema, "query"),
  listProductsByCategoryController
);

// /api/products/brand/:brand
router.get(
  "/brand/:brand",
  validate(BrandParamSchema, "params"),
  validate(PaginationQuerySchema, "query"),
  listProductsByBrandController
);

// /api/products/tag/:tag
router.get(
  "/tag/:tag",
  validate(TagParamSchema, "params"),
  validate(PaginationQuerySchema, "query"),
  listProductsByTagController
);

// keep last
router.get(
  "/:id",
  validate(ProductIdParamSchema, "params"),
  getProductController
);

export default router;
