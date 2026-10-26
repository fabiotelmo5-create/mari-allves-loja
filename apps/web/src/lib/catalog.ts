import { Prisma, prisma } from '@mari-allves/db';
import {
  MOCK_PRODUCTS,
  CATEGORIES as MOCK_CATEGORIES,
  type Product,
} from './mock-data';

/**
 * Camada de acesso ao catálogo.
 *
 * Lê do PostgreSQL (Supabase) via Prisma. Enquanto a variável DATABASE_URL não
 * estiver configurada (ex.: build sem banco), cai nos dados de demonstração
 * para que o site não quebre.
 */

const hasDatabase = Boolean(process.env.DATABASE_URL);

const productInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  variants: {
    include: { stock: { select: { quantity: true } } },
    orderBy: [{ size: 'asc' }, { color: 'asc' }],
  },
  measurement: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(row: ProductWithRelations): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    category: row.category.name,
    categorySlug: row.category.slug,
    priceCents: row.priceCents,
    previousPriceCents: row.previousPriceCents ?? undefined,
    composition: row.composition ?? undefined,
    careInstructions: row.careInstructions ?? undefined,
    weightG: row.weightG ?? undefined,
    widthCm: row.widthCm ?? undefined,
    heightCm: row.heightCm ?? undefined,
    depthCm: row.depthCm ?? undefined,
    variants: row.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      priceCents: variant.priceCents ?? undefined,
      active: variant.active,
      stockQuantity: variant.stock?.quantity ?? 0,
    })),
    images: row.images.map((image) => ({
      url: image.url,
      alt: image.alt,
      position: image.position,
    })),
    measurement: row.measurement
      ? {
          bustCm: row.measurement.bustCm ?? undefined,
          waistCm: row.measurement.waistCm ?? undefined,
          hipsCm: row.measurement.hipsCm ?? undefined,
          lengthCm: row.measurement.lengthCm ?? undefined,
          sleeveCm: row.measurement.sleeveCm ?? undefined,
        }
      : undefined,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface CategorySummary {
  name: string;
  slug: string;
}

/* -------------------------------------------------------------------------- */
/* Categorias                                                                 */
/* -------------------------------------------------------------------------- */

export async function listCategories(): Promise<CategorySummary[]> {
  if (!hasDatabase) return MOCK_CATEGORIES;

  return prisma.category.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
    select: { name: true, slug: true },
  });
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  if (!hasDatabase) return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;

  return prisma.category.findFirst({
    where: { slug, active: true },
    select: { name: true, slug: true },
  });
}

/* -------------------------------------------------------------------------- */
/* Produtos                                                                   */
/* -------------------------------------------------------------------------- */

export async function listProducts(): Promise<Product[]> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter((p) => p.status === 'PUBLICADO');
  }

  const rows = await prisma.product.findMany({
    where: { status: 'PUBLICADO' },
    include: productInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug && p.status === 'PUBLICADO') ?? null;
  }

  const row = await prisma.product.findFirst({
    where: { slug, status: 'PUBLICADO' },
    include: productInclude,
  });

  return row ? toProduct(row) : null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];

  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter((p) => slugs.includes(p.slug));
  }

  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    include: productInclude,
  });

  return rows.map(toProduct);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter(
      (p) => p.categorySlug === categorySlug && p.status === 'PUBLICADO'
    );
  }

  const rows = await prisma.product.findMany({
    where: { status: 'PUBLICADO', category: { slug: categorySlug } },
    include: productInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(toProduct);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter((p) => p.status === 'PUBLICADO').slice(0, limit);
  }

  const rows = await prisma.product.findMany({
    where: { status: 'PUBLICADO' },
    include: productInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return rows.map(toProduct);
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  if (!hasDatabase) {
    return [...MOCK_PRODUCTS]
      .filter((p) => p.status === 'PUBLICADO')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  const rows = await prisma.product.findMany({
    where: { status: 'PUBLICADO' },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map(toProduct);
}

export async function getPromotions(): Promise<Product[]> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.status === 'PUBLICADO' &&
        p.previousPriceCents != null &&
        p.previousPriceCents > p.priceCents
    );
  }

  // Prisma não compara duas colunas em `where`; filtramos em memória.
  // O catálogo é pequeno e a consulta já vem limitada a produtos publicados.
  const rows = await prisma.product.findMany({
    where: { status: 'PUBLICADO', previousPriceCents: { not: null } },
    include: productInclude,
    orderBy: { publishedAt: 'desc' },
  });

  return rows
    .filter((row) => row.previousPriceCents != null && row.previousPriceCents > row.priceCents)
    .map(toProduct);
}
