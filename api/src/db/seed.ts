import { PrismaClient, ProductAvailability } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function mapAvailability(status?: string, stock?: number): ProductAvailability {
  const s = (status || "").toLowerCase();
  if (s.includes("discontinued")) return ProductAvailability.DISCONTINUED;
  if (s.includes("preorder")) return ProductAvailability.PREORDER;
  if (s.includes("out") && s.includes("stock"))
    return ProductAvailability.OUT_OF_STOCK;
  // "in stock" / "low stock" / unknown → fallback by stock
  if (typeof stock === "number" && stock <= 0)
    return ProductAvailability.OUT_OF_STOCK;
  return ProductAvailability.IN_STOCK;
}

async function readJson<T = any>(rel: string): Promise<T> {
  const p = path.join(process.cwd(), rel);
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as T;
}

async function main() {
  // 1) Load data
  const categoriesFile = await readJson<any[]>("src/db/categories.json");
  const productsFile = await readJson<any | any[]>("src/db/products.json");
  const products: any[] = Array.isArray(productsFile)
    ? productsFile
    : (productsFile.products ?? []);

  // 2) Seed Categories
  console.log(`Seeding categories: ${categoriesFile.length}`);
  for (const c of categoriesFile) {
    const name = c.name ?? c.slug;
    const slug = c.slug ?? slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: { name, slug, isActive: true },
    });
  }

  // 3) Collect & seed Brands
  const brandSet = new Map<string, { name: string; slug: string }>();
  for (const p of products) {
    if (p.brand && typeof p.brand === "string") {
      const name = p.brand.trim();
      const slug = slugify(name);
      brandSet.set(slug, { name, slug });
    }
  }
  console.log(`Seeding brands: ${brandSet.size}`);
  for (const { name, slug } of brandSet.values()) {
    await prisma.brand.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: { name, slug, isActive: true },
    });
  }

  // 4) Collect & seed Tags
  const tagSet = new Map<string, { name: string; slug: string }>();
  for (const p of products) {
    const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
    for (const t of tags) {
      const name = String(t).trim();
      const slug = slugify(name);
      tagSet.set(slug, { name, slug });
    }
  }
  console.log(`Seeding tags: ${tagSet.size}`);
  for (const { name, slug } of tagSet.values()) {
    await prisma.tag.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: { name, slug, isActive: true },
    });
  }

  // 5) Build in-memory lookups
  const [allCategories, allBrands, allTags] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.brand.findMany({ select: { id: true, slug: true } }),
    prisma.tag.findMany({ select: { id: true, slug: true } }),
  ]);
  const catBySlug = new Map(allCategories.map((c) => [c.slug, c.id] as const));
  const brandBySlug = new Map(allBrands.map((b) => [b.slug, b.id] as const));
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t.id] as const));

  // 6) Seed Products
  console.log(`Seeding products: ${products.length}`);
  for (const p of products) {
    const title: string = p.title ?? p.name ?? "Unnamed Product";
    const productSlug =
      `${slugify(title)}-${p.sku ? slugify(p.sku) : (p.id ?? "")}`.replace(
        /-+/g,
        "-"
      );
    const categorySlug: string = p.category
      ? slugify(p.category)
      : "uncategorized";
    const categoryId = catBySlug.get(categorySlug);
    if (!categoryId) {
      console.warn(
        `⚠️  Skipping product '${title}' — unknown category '${categorySlug}'`
      );
      continue;
    }

    const brandSlug = p.brand ? slugify(p.brand) : undefined;
    const brandId = brandSlug ? brandBySlug.get(brandSlug) : undefined;

    const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
    const tagConnections = tags
      .map((t) => tagBySlug.get(slugify(String(t))))
      .filter(Boolean)
      .map((id) => ({ tagId: id as string }));

    const images: string[] = Array.isArray(p.images) ? p.images : [];
    const thumbnail: string | undefined = p.thumbnail;

    const availability = mapAvailability(p.availabilityStatus, p.stock);

    // Upsert by unique sku (assumed unique)
    const product = await prisma.product.upsert({
      where: { sku: String(p.sku) },
      update: {
        name: title,
        slug: productSlug,
        description: p.description ?? null,
        price: p.price,
        discountPercentage: p.discountPercentage ?? null,
        rating: p.rating ?? null,
        stock: p.stock ?? 0,
        currency: "USD",
        weight: p.weight ?? null,
        width: p.dimensions?.width ?? null,
        height: p.dimensions?.height ?? null,
        depth: p.dimensions?.depth ?? null,
        availability,
        warrantyInformation: p.warrantyInformation ?? null,
        shippingInformation: p.shippingInformation ?? null,
        returnPolicy: p.returnPolicy ?? null,
        minimumOrderQuantity: p.minimumOrderQuantity ?? 1,
        thumbnailUrl: thumbnail ?? null,
        barcode: p.meta?.barcode ?? null,
        qrCodeUrl: p.meta?.qrCode ?? null,
        meta: p.meta ?? null,
        categoryId,
        brandId: brandId ?? null,
        isActive: true,
      },
      create: {
        sku: String(p.sku),
        name: title,
        slug: productSlug,
        description: p.description ?? null,
        price: p.price,
        discountPercentage: p.discountPercentage ?? null,
        rating: p.rating ?? null,
        stock: p.stock ?? 0,
        currency: "USD",
        weight: p.weight ?? null,
        width: p.dimensions?.width ?? null,
        height: p.dimensions?.height ?? null,
        depth: p.dimensions?.depth ?? null,
        availability,
        warrantyInformation: p.warrantyInformation ?? null,
        shippingInformation: p.shippingInformation ?? null,
        returnPolicy: p.returnPolicy ?? null,
        minimumOrderQuantity: p.minimumOrderQuantity ?? 1,
        thumbnailUrl: thumbnail ?? null,
        barcode: p.meta?.barcode ?? null,
        qrCodeUrl: p.meta?.qrCode ?? null,
        meta: p.meta ?? null,
        categoryId,
        brandId: brandId ?? null,
        isActive: true,
      },
      select: { id: true },
    });

    // Images (reset & insert). We keep it simple for seed.
    if (images.length) {
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
      const primaryIdx = thumbnail
        ? images.findIndex((u) => u === thumbnail)
        : 0;
      await prisma.productImage.createMany({
        data: images.map((url: string, i: number) => ({
          productId: product.id,
          url,
          isPrimary: i === (primaryIdx >= 0 ? primaryIdx : 0),
          sortOrder: i,
        })),
        skipDuplicates: true,
      });
    }

    // Tags (ensure join rows)
    if (tagConnections.length) {
      // delete existing links then recreate (seed simplicity)
      await prisma.productTag.deleteMany({ where: { productId: product.id } });
      await prisma.productTag.createMany({
        data: tagConnections.map((t) => ({
          productId: product.id,
          tagId: t.tagId,
        })),
      });
    }

    // Reviews
    const reviews: any[] = Array.isArray(p.reviews) ? p.reviews : [];
    if (reviews.length) {
      await prisma.review.deleteMany({ where: { productId: product.id } });
      await prisma.review.createMany({
        data: reviews.map((r) => ({
          productId: product.id,
          rating: Math.max(1, Math.min(5, Number(r.rating) || 0)),
          comment: r.comment ?? null,
          reviewerName: r.reviewerName ?? "Anonymous",
          reviewerEmail: r.reviewerEmail ?? "anonymous@example.com",
          date: r.date ? new Date(r.date) : new Date(),
        })),
        skipDuplicates: true,
      });
    }
  }

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
