'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, type ProductStatus } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { deleteImageAsset, imageAssetIdFromUrl, resolveImage } from '@/lib/image-upload';

export type ProductFormState = { error?: string } | null;

type VariantInput = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  initialStock: number;
};

const PRODUCT_STATUSES: ProductStatus[] = [
  'RASCUNHO',
  'PUBLICADO',
  'INATIVO',
  'ARQUIVADO',
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateProductSku(name: string) {
  const base = slugify(name).replace(/-/g, '').slice(0, 12).toUpperCase() || 'PROD';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MA-${base}-${suffix}`;
}

function buildVariantSku(productSku: string, index: number) {
  return `${productSku.slice(0, 50)}-${String(index + 1).padStart(3, '0')}`;
}

function assignVariantSkus(
  variants: VariantInput[],
  productSku: string,
  usedSkus: Set<string>
) {
  return variants.map((variant, index) => {
    if (variant.sku) {
      usedSkus.add(variant.sku);
      return variant;
    }

    const base = buildVariantSku(productSku, index);
    let candidate = base;
    let counter = 2;
    while (usedSkus.has(candidate)) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }
    usedSkus.add(candidate);
    return { ...variant, sku: candidate };
  });
}

function parseMoneyToCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;
  const number = Number(normalized);

  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 100);
}

function parseOptionalMoneyToCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;
  return parseMoneyToCents(raw);
}

function parseOptionalPositiveInteger(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function parseVariants(value: FormDataEntryValue | null): VariantInput[] | null {
  try {
    const parsed = JSON.parse(String(value ?? '[]')) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 50) return null;

    const variants = parsed.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: typeof row.id === 'string' && row.id.length > 0 ? row.id : undefined,
        size: String(row.size ?? '').trim(),
        color: String(row.color ?? '').trim(),
        sku: String(row.sku ?? '').trim().toUpperCase(),
        initialStock: Number(row.initialStock),
      };
    });

    const skus = new Set<string>();
    for (const variant of variants) {
      if (!variant.size) return null;
      if (!Number.isInteger(variant.initialStock) || variant.initialStock < 0) return null;
      if (variant.sku) {
        if (skus.has(variant.sku)) return null;
        skus.add(variant.sku);
      }
    }

    return variants;
  } catch {
    return null;
  }
}

function parseStatus(value: FormDataEntryValue | null): ProductStatus | null {
  const status = String(value ?? 'RASCUNHO');
  return PRODUCT_STATUSES.includes(status as ProductStatus)
    ? (status as ProductStatus)
    : null;
}

async function revalidateProducts() {
  revalidatePath('/admin');
  revalidatePath('/admin/produtos');
  revalidatePath('/catalogo');
  revalidatePath('/');
}

export async function createProductAction(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { admin } = await requireAdmin();

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const slug = slugify(slugInput || name);
  const providedSku = String(formData.get('sku') ?? '').trim().toUpperCase();
  const sku = providedSku || generateProductSku(name);
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const priceCents = parseMoneyToCents(formData.get('price'));
  const previousPriceCents = parseOptionalMoneyToCents(formData.get('previousPrice'));
  const status = parseStatus(formData.get('status'));
  const parsedVariants = parseVariants(formData.get('variants'));

  if (name.length < 3) return { error: 'Informe o nome do produto.' };
  if (slug.length < 3) return { error: 'O endereço da página precisa ter pelo menos 3 caracteres.' };
  if (!categoryId) return { error: 'Selecione uma categoria.' };
  if (priceCents === null) return { error: 'Informe o preço de venda.' };
  if (previousPriceCents === null) return { error: 'Preço anterior inválido.' };
  if (previousPriceCents !== undefined && previousPriceCents <= priceCents) {
    return { error: 'O preço anterior precisa ser maior que o preço atual.' };
  }
  if (!status) return { error: 'Visibilidade inválida.' };
  if (!parsedVariants) return { error: 'Inclua pelo menos um tamanho com estoque válido.' };

  const variants = assignVariantSkus(parsedVariants, sku, new Set());

  const [category, duplicate] = await Promise.all([
    prisma.category.findFirst({ where: { id: categoryId, active: true }, select: { id: true } }),
    prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }, { variants: { some: { sku: { in: variants.map((v) => v.sku) } } } }] },
      select: { id: true },
    }),
  ]);

  if (!category) return { error: 'Categoria inválida ou inativa.' };
  if (duplicate) return { error: 'Já existe um produto com esse endereço ou código. Ajuste o nome ou o código.' };

  const description = String(formData.get('description') ?? '').trim();
  const composition = String(formData.get('composition') ?? '').trim();
  const careInstructions = String(formData.get('careInstructions') ?? '').trim();
  const weightG = parseOptionalPositiveInteger(formData.get('weightG'));
  const widthCm = parseOptionalPositiveInteger(formData.get('widthCm'));
  const heightCm = parseOptionalPositiveInteger(formData.get('heightCm'));
  const depthCm = parseOptionalPositiveInteger(formData.get('depthCm'));

  if ([weightG, widthCm, heightCm, depthCm].some((value) => value === null)) {
    return { error: 'Peso e medidas devem ser números inteiros iguais ou maiores que zero.' };
  }

  const image = await resolveImage(formData);
  if (image.error) return { error: image.error };
  if (status === 'PUBLICADO' && !image.value) {
    return { error: 'Envie uma foto para publicar o produto.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          sku,
          categoryId,
          priceCents,
          previousPriceCents,
          description: description || null,
          composition: composition || null,
          careInstructions: careInstructions || null,
          weightG: weightG ?? null,
          widthCm: widthCm ?? null,
          heightCm: heightCm ?? null,
          depthCm: depthCm ?? null,
          status,
          publishedAt: status === 'PUBLICADO' ? new Date() : null,
        },
      });

      if (image.value) {
        await tx.productImage.create({
          data: { productId: product.id, url: image.value, alt: name, position: 0 },
        });
      }

      for (const variantInput of variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            size: variantInput.size,
            color: variantInput.color,
            sku: variantInput.sku,
            active: true,
          },
        });

        const stock = await tx.stock.create({
          data: { variantId: variant.id, quantity: variantInput.initialStock },
        });

        if (variantInput.initialStock > 0) {
          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              type: 'ENTRADA',
              quantity: variantInput.initialStock,
              reason: 'Estoque inicial no cadastro do produto',
              changedBy: admin.userId,
              adminUserId: admin.id,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          tableName: 'Product',
          recordId: product.id,
          action: 'CREATE',
          changedBy: admin.userId,
          newData: { name, sku, slug, status },
        },
      });
    });
  } catch {
    await deleteImageAsset(image.assetId);
    return { error: 'Não foi possível criar o produto. Verifique os dados e tente novamente.' };
  }

  await revalidateProducts();
  redirect('/admin/produtos');
}

export async function updateProductAction(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { admin } = await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const slug = slugify(slugInput || name);
  const providedSku = String(formData.get('sku') ?? '').trim().toUpperCase();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const priceCents = parseMoneyToCents(formData.get('price'));
  const previousPriceCents = parseOptionalMoneyToCents(formData.get('previousPrice'));
  const status = parseStatus(formData.get('status'));
  const parsedVariants = parseVariants(formData.get('variants'));

  if (!id) return { error: 'Produto não encontrado.' };
  if (name.length < 3 || slug.length < 3) {
    return { error: 'Informe o nome do produto.' };
  }
  if (!categoryId) return { error: 'Selecione uma categoria.' };
  if (priceCents === null) return { error: 'Informe o preço de venda.' };
  if (previousPriceCents === null) return { error: 'Preço anterior inválido.' };
  if (previousPriceCents !== undefined && previousPriceCents <= priceCents) {
    return { error: 'O preço anterior precisa ser maior que o preço atual.' };
  }
  if (!status) return { error: 'Visibilidade inválida.' };
  if (!parsedVariants) return { error: 'Inclua pelo menos um tamanho com estoque válido.' };

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, status: true, publishedAt: true, sku: true },
  });
  if (!existing) return { error: 'Produto não encontrado.' };

  const sku = providedSku || existing.sku || generateProductSku(name);

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId: id },
    include: {
      stock: { include: { _count: { select: { movements: true } } } },
      _count: { select: { orderItems: true, cartItems: true } },
    },
  });

  const variants = assignVariantSkus(
    parsedVariants,
    sku,
    new Set(existingVariants.map((variant) => variant.sku))
  );

  const [category, duplicate, variantSkuConflict] = await Promise.all([
    prisma.category.findFirst({ where: { id: categoryId, active: true }, select: { id: true } }),
    prisma.product.findFirst({
      where: { id: { not: id }, OR: [{ slug }, { sku }] },
      select: { id: true },
    }),
    prisma.productVariant.findFirst({
      where: {
        sku: { in: variants.map((variant) => variant.sku) },
        productId: { not: id },
      },
      select: { sku: true },
    }),
  ]);

  if (!category) return { error: 'Categoria inválida ou inativa.' };
  if (duplicate) return { error: 'Já existe outro produto com esse endereço ou código.' };
  if (variantSkuConflict) {
    return { error: `O código ${variantSkuConflict.sku} já pertence a outro produto.` };
  }

  const incomingIds = new Set(
    variants
      .map((variant) => variant.id)
      .filter((variantId): variantId is string => Boolean(variantId))
  );
  const removedVariants = existingVariants.filter((variant) => !incomingIds.has(variant.id));

  const description = String(formData.get('description') ?? '').trim();
  const composition = String(formData.get('composition') ?? '').trim();
  const careInstructions = String(formData.get('careInstructions') ?? '').trim();
  const weightG = parseOptionalPositiveInteger(formData.get('weightG'));
  const widthCm = parseOptionalPositiveInteger(formData.get('widthCm'));
  const heightCm = parseOptionalPositiveInteger(formData.get('heightCm'));
  const depthCm = parseOptionalPositiveInteger(formData.get('depthCm'));

  if ([weightG, widthCm, heightCm, depthCm].some((value) => value === null)) {
    return { error: 'Peso e medidas devem ser números inteiros iguais ou maiores que zero.' };
  }

  const image = await resolveImage(formData);
  if (image.error) return { error: image.error };

  const removeImage = formData.get('removeImage') === 'on';
  const currentImage = await prisma.productImage.findFirst({
    where: { productId: id },
    orderBy: { position: 'asc' },
  });
  const finalImageUrl = image.value ?? (removeImage ? undefined : currentImage?.url);

  if (status === 'PUBLICADO' && !finalImageUrl) {
    return { error: 'Envie uma foto para publicar o produto.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          sku,
          categoryId,
          priceCents,
          previousPriceCents,
          description: description || null,
          composition: composition || null,
          careInstructions: careInstructions || null,
          weightG: weightG ?? null,
          widthCm: widthCm ?? null,
          heightCm: heightCm ?? null,
          depthCm: depthCm ?? null,
          status,
          publishedAt: status === 'PUBLICADO' ? existing.publishedAt ?? new Date() : null,
        },
      });

      if (image.value && currentImage) {
        await tx.productImage.update({
          where: { id: currentImage.id },
          data: { url: image.value, alt: name },
        });
      } else if (image.value) {
        await tx.productImage.create({
          data: { productId: id, url: image.value, alt: name, position: 0 },
        });
      } else if (removeImage && currentImage) {
        await tx.productImage.delete({ where: { id: currentImage.id } });
      }

      for (const input of variants) {
        const existingVariant = input.id
          ? existingVariants.find((variant) => variant.id === input.id)
          : undefined;

        if (existingVariant) {
          await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              size: input.size,
              color: input.color,
              sku: input.sku,
              active: true,
            },
          });

          const currentQuantity = existingVariant.stock?.quantity ?? 0;
          if (input.initialStock !== currentQuantity) {
            const delta = input.initialStock - currentQuantity;
            const stock = existingVariant.stock
              ? await tx.stock.update({
                  where: { id: existingVariant.stock.id },
                  data: { quantity: input.initialStock },
                })
              : await tx.stock.create({
                  data: { variantId: existingVariant.id, quantity: input.initialStock },
                });

            await tx.stockMovement.create({
              data: {
                stockId: stock.id,
                type: 'AJUSTE',
                quantity: Math.abs(delta),
                reason: `Ajuste no painel (${delta > 0 ? '+' : '-'}${Math.abs(delta)})`,
                changedBy: admin.userId,
                adminUserId: admin.id,
              },
            });
          }
        } else {
          const variant = await tx.productVariant.create({
            data: {
              productId: id,
              size: input.size,
              color: input.color,
              sku: input.sku,
              active: true,
            },
          });

          const stock = await tx.stock.create({
            data: { variantId: variant.id, quantity: input.initialStock },
          });

          if (input.initialStock > 0) {
            await tx.stockMovement.create({
              data: {
                stockId: stock.id,
                type: 'ENTRADA',
                quantity: input.initialStock,
                reason: 'Nova variação cadastrada no painel',
                changedBy: admin.userId,
                adminUserId: admin.id,
              },
            });
          }
        }
      }

      for (const variant of removedVariants) {
        const hasHistory =
          variant._count.orderItems > 0 ||
          variant._count.cartItems > 0 ||
          (variant.stock?._count.movements ?? 0) > 0;

        if (hasHistory) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { active: false },
          });
        } else {
          await tx.productVariant.delete({ where: { id: variant.id } });
        }
      }

      await tx.auditLog.create({
        data: {
          tableName: 'Product',
          recordId: product.id,
          action: 'UPDATE',
          changedBy: admin.userId,
          newData: {
            name,
            sku,
            slug,
            status,
            variants: variants.map((variant) => variant.sku),
          },
        },
      });
    });
  } catch {
    await deleteImageAsset(image.assetId);
    return {
      error: 'Não foi possível salvar as alterações. Verifique os dados e tente novamente.',
    };
  }

  const oldAssetId = imageAssetIdFromUrl(currentImage?.url);
  if (oldAssetId && (removeImage || (image.value && image.value !== currentImage?.url))) {
    await deleteImageAsset(oldAssetId);
  }

  await revalidateProducts();
  redirect('/admin/produtos');
}

export async function archiveProductAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { status: 'ARQUIVADO', publishedAt: null },
    });
    await tx.auditLog.create({
      data: {
        tableName: 'Product',
        recordId: id,
        action: 'UPDATE',
        changedBy: admin.userId,
        newData: { status: 'ARQUIVADO' },
      },
    });
  });

  await revalidateProducts();
}
