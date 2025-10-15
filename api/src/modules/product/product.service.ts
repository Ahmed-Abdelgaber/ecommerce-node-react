import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import type {
  ListFilters,
  ListResponse,
  ApiProductDTO,
} from "@modules/product/product.types";
import {
  list,
  findProductById,
  listByBrand,
  listByTag,
  listByCategory,
} from "@modules/product/product.repo";

export async function getProduct(id: string): Promise<ApiProductDTO> {
  const rec = await findProductById(id);
  if (!rec)
    throw new AppError(ErrorCodes.NOT_FOUND, "Product not found", { id });
  return rec;
}

export async function listProducts(
  filters: ListFilters
): Promise<ListResponse> {
  return await list(filters);
}

export async function listProductsByCategory(
  category: string,
  opts: Partial<Pick<ListFilters, "page" | "size" | "sort">> = {}
): Promise<ListResponse> {
  return await listByCategory(category, opts);
}

export async function listProductsByBrand(
  brand: string,
  opts: Partial<Pick<ListFilters, "page" | "size" | "sort">> = {}
): Promise<ListResponse> {
  return await listByBrand(brand, opts);
}

export async function listProductsByTag(
  tag: string,
  opts: Partial<Pick<ListFilters, "page" | "size" | "sort">> = {}
): Promise<ListResponse> {
  return await listByTag(tag, opts);
}
