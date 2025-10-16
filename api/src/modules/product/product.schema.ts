import { z } from "zod";

/** Allowed sort values. Extend here if you add more. */
export const SortEnum = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "rating_desc",
]);

/** Converts query param into string[]:
 * - accepts: array, comma-separated string, or undefined/null.
 */
const toStringArray = (v: unknown) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
};

/** Filters for the products list endpoint.
 * - All fields optional; paging defaults are here.
 * - min/maxPrice: coerced numbers (nonnegative).
 * - inStock: coerced boolean (accepts "true"/"false").
 * - tagSlugs/tagIds: array or comma-separated string.
 */
export const ListFiltersSchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),

    tagSlugs: z.preprocess(
      toStringArray,
      z.array(z.string().trim().min(1)).optional()
    ),
    tagIds: z.preprocess(
      toStringArray,
      z.array(z.string().trim().min(1)).optional()
    ),

    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),

    inStock: z.coerce.boolean().optional(),

    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),

    sort: SortEnum.optional(),
  })
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    { path: ["maxPrice"], message: "maxPrice must be >= minPrice" }
  );

/** Route params for product id (coerced to string). */
export const ProductIdParamSchema = z.object({
  id: z.coerce.string().min(1),
});

/** External API DTO shape for a product.
 * NOTE:
 * - If your IDs are always strings, switch to z.coerce.string().
 * - If image fields are not always absolute URLs, relax to z.string().
 */
export const ApiProductDTOSchema = z.object({
  id: z.union([z.string(), z.number().int()]),
  title: z.string().trim().min(1),
  description: z.string().trim().default(""),
  category: z.string().trim().min(1),
  brand: z.string().trim().optional(),

  price: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().int().nonnegative().optional(),

  thumbnail: z.url().optional(),
  images: z.array(z.url()).default([]),
});

/** Types */
export type ListFiltersInput = z.input<typeof ListFiltersSchema>;
export type ListFilters = z.output<typeof ListFiltersSchema>;
export type ApiProductDTO = z.infer<typeof ApiProductDTOSchema>;

/** Helpers */
export const parseListFilters = (q: unknown) => ListFiltersSchema.parse(q);
export const parseProductId = (p: unknown) => ProductIdParamSchema.parse(p);

export const CategoryParamSchema = z.object({
  category: z.string().trim().min(1),
});
export const BrandParamSchema = z.object({ brand: z.string().trim().min(1) });
export const TagParamSchema = z.object({ tag: z.string().trim().min(1) });

// Reusable subset for paging/sorting on category/brand/tag list endpoints
export const PaginationQuerySchema = ListFiltersSchema.pick({
  page: true,
  size: true,
  sort: true,
});
