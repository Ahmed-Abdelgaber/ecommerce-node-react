import { createApiClient } from "../../../services/http";

const categoriesClient = createApiClient({ feature: "categories" });
const DEFAULT_SIZE = 48;

function toTitleCase(slug) {
  if (!slug) return "";
  return slug
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function listFeaturedCategories({ size = DEFAULT_SIZE } = {}) {
  const response = await categoriesClient.get("/products", {
    params: { size },
  });
  const items = response?.data?.data?.items ?? [];

  const categoryMap = new Map();
  for (const product of items) {
    const key = product.category || "other";
    const previous = categoryMap.get(key);
    if (previous) {
      previous.count += 1;
      if (!previous.sampleImage && (product.thumbnail || product.images?.[0])) {
        previous.sampleImage = product.thumbnail ?? product.images?.[0];
      }
    } else {
      categoryMap.set(key, {
        slug: key,
        label: toTitleCase(key),
        count: 1,
        sampleImage: product.thumbnail ?? product.images?.[0] ?? null,
      });
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
}
