import { createApiClient } from "../../../services/http";

const productsClient = createApiClient({ feature: "products" });
const DEFAULT_PAGE_SIZE = 12;

export async function listProducts({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  sort = "newest",
  q,
  category,
  inStock,
  minPrice,
  maxPrice,
} = {}) {
  const response = await productsClient.get("/products", {
    params: {
      page,
      size,
      sort,
      q,
      category,
      inStock,
      minPrice,
      maxPrice,
    },
  });
  const payload = response?.data?.data ?? {};
  return {
    items: payload.items ?? [],
    page: payload.page ?? page,
    size: payload.size ?? size,
    total: payload.total ?? 0,
    hasNext: Boolean(payload.hasNext),
  };
}
