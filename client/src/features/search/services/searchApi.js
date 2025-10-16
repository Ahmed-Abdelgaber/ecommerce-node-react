import { createApiClient } from "../../../services/http";

const searchClient = createApiClient({ feature: "products-search" });

export async function searchProducts({ q, page = 1, size = 10, signal }) {
  const response = await searchClient.get("/products", {
    params: { q, page, size },
    signal,
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
