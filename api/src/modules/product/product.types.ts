import { Prisma } from "@prisma/client";

export type ApiProductDTO = {
  id: string; // DB id (string). Example showed a number; ours is string.
  title: string;
  description: string | null;
  category: string; // category slug
  price: number;
  discountPercentage: number | null;
  rating: number | null;
  stock: number;
  tags: string[];
  brand: string | null;
  sku: string;
  weight: number | null;
  dimensions: {
    width: number | null;
    height: number | null;
    depth: number | null;
  };
  warrantyInformation: string | null;
  shippingInformation: string | null;
  availabilityStatus: string; // human label derived from enum
  reviews: Array<{
    rating: number;
    comment: string | null;
    date: string; // ISO
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy: string | null;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string | null;
    qrCode: string | null;
  };
  images: string[];
  thumbnail: string | null;
};

export const productFullSelect = {
  id: true,
  name: true,
  description: true,
  sku: true,
  slug: true,
  price: true,
  discountPercentage: true,
  rating: true,
  stock: true,
  weight: true,
  width: true,
  height: true,
  depth: true,
  warrantyInformation: true,
  shippingInformation: true,
  availability: true,
  returnPolicy: true,
  minimumOrderQuantity: true,
  barcode: true,
  qrCodeUrl: true,
  meta: true,
  thumbnailUrl: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { slug: true } },
  brand: { select: { name: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const } },
  tags: { select: { tag: { select: { name: true } } } },
  reviews: {
    select: {
      rating: true,
      comment: true,
      date: true,
      reviewerName: true,
      reviewerEmail: true,
    },
    orderBy: { date: "desc" as const },
  },
} satisfies Prisma.ProductSelect;

function availabilityToLabel(av?: string | null): string {
  switch (av) {
    case "IN_STOCK":
      return "In Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
    case "PREORDER":
      return "Preorder";
    case "DISCONTINUED":
      return "Discontinued";
    default:
      return "In Stock";
  }
}

function d(v: unknown): number | null {
  if (v == null) return null;
  const n =
    typeof v === "object" && "toString" in (v as any)
      ? Number((v as any).toString())
      : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function toApiProduct(
  p: Prisma.ProductGetPayload<{ select: typeof productFullSelect }>
): ApiProductDTO {
  return {
    id: p.id,
    title: p.name,
    description: p.description ?? null,
    category: p.category.slug,
    price: Number(p.price),
    discountPercentage: d(p.discountPercentage),
    rating: d(p.rating),
    stock: p.stock,
    tags: p.tags.map((t) => t.tag.name),
    brand: p.brand?.name ?? null,
    sku: p.sku,
    weight: d(p.weight),
    dimensions: { width: d(p.width), height: d(p.height), depth: d(p.depth) },
    warrantyInformation: p.warrantyInformation ?? null,
    shippingInformation: p.shippingInformation ?? null,
    availabilityStatus: availabilityToLabel(
      p.availability as unknown as string
    ),
    reviews: p.reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment ?? null,
      date: new Date(r.date).toISOString(),
      reviewerName: r.reviewerName,
      reviewerEmail: r.reviewerEmail,
    })),
    returnPolicy: p.returnPolicy ?? null,
    minimumOrderQuantity: p.minimumOrderQuantity,
    meta: {
      createdAt: new Date(p.createdAt).toISOString(),
      updatedAt: new Date(p.updatedAt).toISOString(),
      barcode: p.barcode ?? null,
      qrCode: p.qrCodeUrl ?? null,
    },
    images: p.images.map((img) => img.url),
    thumbnail: p.thumbnailUrl ?? null,
  };
}

export type ListFilters = {
  q?: string;
  category?: string; // id or slug
  brand?: string; // id or slug
  tagSlugs?: string[];
  tagIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  size?: number; // max 48
  sort?: "newest" | "price_asc" | "price_desc" | "rating_desc";
};

export type ListResponse = {
  items: ApiProductDTO[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
};
