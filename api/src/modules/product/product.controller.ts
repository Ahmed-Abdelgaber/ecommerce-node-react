import * as service from "@modules/product/product.service";
import { ok } from "@app/http/response";
import handle from "@app/http/handle";

export const listProductsController = handle(async (req, res) => {
  const result = await service.listProducts(req.query as any);
  ok(res, result);
});

export const getProductController = handle(async (req, res) => {
  const id = req.params.id!;
  const product = await service.getProduct(id);
  ok(res, product);
});

export const listProductsByCategoryController = handle(async (req, res) => {
  const category = req.params.category!;
  const { page, size, sort } = req.query as any;
  const result = await service.listProductsByCategory(category, {
    page,
    size,
    sort,
  });
  ok(res, result);
});

export const listProductsByBrandController = handle(async (req, res) => {
  const brand = req.params.brand!;
  const { page, size, sort } = req.query as any;
  const result = await service.listProductsByBrand(brand, { page, size, sort });
  ok(res, result);
});

export const listProductsByTagController = handle(async (req, res) => {
  const tag = req.params.tag!;
  const { page, size, sort } = req.query as any;
  const result = await service.listProductsByTag(tag, { page, size, sort });
  ok(res, result);
});
