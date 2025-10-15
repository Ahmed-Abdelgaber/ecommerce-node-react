import type { Prisma } from "@prisma/client";
import { dbPublic as db } from "@db/prisma";
import {
  ApiProductDTO,
  toApiProduct,
  productFullSelect,
} from "@modules/product/product.types";
import type { ListFilters, ListResponse } from "@modules/product/product.types";

export async function findProductById(
  id: string
): Promise<ApiProductDTO | null> {
  const rec = await db.product.findFirst({
    where: { id },
    select: productFullSelect,
  });
  return rec ? toApiProduct(rec) : null;
}

export async function findProductBySlug(
  slug: string
): Promise<ApiProductDTO | null> {
  const rec = await db.product.findFirst({
    where: { slug },
    select: productFullSelect,
  });
  return rec ? toApiProduct(rec) : null;
}

// Generic list with dynamic filters (heavy payload by design to match requested shape)

function mapSort(
  sort?: ListFilters["sort"]
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "desc" }];
    case "rating_desc":
      return [{ rating: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }, { id: "desc" }];
  }
}

const toStringArray = (v?: string[] | string) =>
  Array.isArray(v)
    ? v
    : typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

function buildWhere(filters: ListFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isActive: true }];

  if (filters.q) {
    and.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { slug: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.category) {
    and.push({ category: { slug: filters.category } });
  }

  if (filters.brand) {
    and.push({ brand: { name: filters.brand } }); // change to slug if your schema uses slug
  }

  if (filters.inStock) {
    and.push({ stock: { gt: 0 } });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    and.push({
      price: {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      },
    });
  }

  // ✅ make sure these are arrays
  const tagSlugs = toStringArray(filters.tagSlugs);
  const tagIds = toStringArray(filters.tagIds);

  if (tagSlugs?.length) {
    and.push({
      tags: {
        some: {
          tag: {
            slug: {
              in: tagSlugs, // String[]
            },
          },
        },
      },
    });
  }

  if (tagIds?.length) {
    and.push({
      tags: {
        some: {
          tagId: {
            in: tagIds, // String[]
          },
        },
      },
    });
  }

  return { AND: and };
}

export async function list(filters: ListFilters = {}): Promise<ListResponse> {
  const page = Math.max(1, filters.page ?? 1);
  const size = Math.min(48, Math.max(1, filters.size ?? 12));
  const where = buildWhere(filters);
  const orderBy = mapSort(filters.sort);

  console.log(JSON.stringify(where));
  const [rows, total] = await db.$transaction([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      select: productFullSelect,
    }),
    db.product.count({ where }),
  ]);

  const items = rows.map(toApiProduct);
  const hasNext = page * size < total;
  return { items, page, size, total, hasNext };
}

export async function listByCategory(
  category: string,
  opts: { page?: number; size?: number; sort?: ListFilters["sort"] } = {}
) {
  return list({ ...opts, category });
}

export async function listByBrand(
  brand: string,
  opts: { page?: number; size?: number; sort?: ListFilters["sort"] } = {}
) {
  return list({ ...opts, brand });
}

export async function listByTag(
  tag: string,
  opts: { page?: number; size?: number; sort?: any }
) {
  const tagSlugs = toStringArray(tag);
  return list({
    page: opts.page,
    size: opts.size,
    sort: opts.sort,
    tagSlugs: tagSlugs,
  });
}
