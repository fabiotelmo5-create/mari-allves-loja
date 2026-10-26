/**
 * Seed do catálogo inicial.
 *
 * Importa os dados de `apps/web/src/lib/mock-data.ts` para não duplicar
 * informação enquanto o catálogo real não é cadastrado no admin.
 *
 * Uso: pnpm --filter @mari-allves/db seed
 */
import { PrismaClient } from '@prisma/client';
import { MOCK_PRODUCTS, CATEGORIES } from '../../../apps/web/src/lib/mock-data.ts';

const prisma = new PrismaClient();

async function main() {
  const categoryIds = new Map<string, string>();

  for (const [position, category] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, position, active: true },
      create: { name: category.name, slug: category.slug, position, active: true },
    });
    categoryIds.set(category.slug, row.id);
  }

  console.log(`✓ ${CATEGORIES.length} categorias`);

  for (const product of MOCK_PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Categoria não encontrada: ${product.categorySlug}`);
    }

    // Remove versão anterior deste produto (idempotência)
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.productMeasurement.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });

      const variants = await prisma.productVariant.findMany({
        where: { productId: existing.id },
        select: { id: true },
      });
      await prisma.stock.deleteMany({
        where: { variantId: { in: variants.map((v) => v.id) } },
      });
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.product.delete({ where: { id: existing.id } });
    }

    const created = await prisma.product.create({
      data: {
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description,
        categoryId,
        priceCents: product.priceCents,
        previousPriceCents: product.previousPriceCents ?? null,
        composition: product.composition ?? null,
        careInstructions: product.careInstructions ?? null,
        weightG: product.weightG ?? null,
        status: product.status,
        publishedAt: product.status === 'PUBLICADO' ? new Date(product.createdAt) : null,
        createdAt: new Date(product.createdAt),
        images: {
          create: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
            position: image.position,
          })),
        },
        ...(product.measurement
          ? {
              measurement: {
                create: {
                  bustCm: product.measurement.bustCm ?? null,
                  waistCm: product.measurement.waistCm ?? null,
                  hipsCm: product.measurement.hipsCm ?? null,
                  lengthCm: product.measurement.lengthCm ?? null,
                  sleeveCm: product.measurement.sleeveCm ?? null,
                },
              },
            }
          : {}),
      },
    });

    for (const variant of product.variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: created.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          priceCents: variant.priceCents ?? null,
          active: variant.active,
        },
      });

      await prisma.stock.create({
        data: {
          variantId: createdVariant.id,
          quantity: variant.stockQuantity,
          lowStockThreshold: 5,
        },
      });
    }

    console.log(
      `✓ ${product.name} (${product.variants.length} variações, ${product.images.length} imagens)`
    );
  }

  const [products, variants, stock] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.stock.aggregate({ _sum: { quantity: true } }),
  ]);

  console.log(
    `\nResumo: ${products} produtos, ${variants} variações, ${stock._sum.quantity ?? 0} unidades em estoque`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
