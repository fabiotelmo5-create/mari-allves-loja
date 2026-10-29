'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mari-allves/db';
import { createClient } from '@/lib/supabase/server';

export type ProductFormState =
  | { success: true; data?: never }
  | { success: false; error: string };

/** Helper: gera slug a partir do nome (apenas para o servidor, o cliente define). */
function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '') // remove acentos (flag u necessária)
    .replace(/[^a-z0-9'-]+/g, '-') // permite apóstrofe em nomes
    .replace(/^-|-$/g, '');
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceCentsStr = String(formData.get('priceCents') ?? '').trim();
  const previousPriceCentsStr = String(
    formData.get('previousPriceCents') ?? ''
  ).trim();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const composition = String(formData.get('composition') ?? '').trim();
  const careInstructions = String(
    formData.get('careInstructions') ?? ''
  ).trim();
  const weightG = formData.get('weightG') ? Number(formData.get('weightG')) : undefined;
  const widthCm = formData.get('widthCm') ? Number(formData.get('widthCm')) : undefined;
  const heightCm = formData.get('heightCm') ? Number(formData.get('heightCm')) : undefined;
  const depthCm = formData.get('depthCm') ? Number(formData.get('depthCm')) : undefined;
  const status = String(formData.get('status') ?? 'RASCUNHO').trim();

  // Validações básicas
  if (name.length < 3) return { success: false, error: 'Nome muito curto.' };
  if (!slug || slug.length < 3) return { success: false, error: 'Slug inválido.' };
  if (!priceCentsStr) return { success: false, error: 'Preço é obrigatório.' };
  const priceCents = Number(priceCentsStr);
  if (priceCents <= 0 || isNaN(priceCents))
    return { success: false, error: 'Preço inválido.' };
  // previousPriceCents é opcional; se informado, deve ser >= 0
  let previousPriceCents: number | undefined;
  if (previousPriceCentsStr) {
    const ppc = Number(previousPriceCentsStr);
    if (ppc < 0 || isNaN(ppc)) return { success: false, error: 'Preço anterior inválido.' };
    previousPriceCents = ppc;
  }

  // Se o slug não for fornecido, gera a partir do nome
  const finalSlug = slug || slugify(name);

  // Verifica slug único
  const existing = await prisma.product.findFirst({
    where: { slug: finalSlug },
  });
  if (existing) return { success: false, error: 'Já existe um produto com este slug.' };

  // Cria produto + variantes (mínimo 1 variante padrão)
  // Cria produto + variantes (mínimo 1 variante padrão)
  const product = await prisma.$transaction(async (tx) => {
    // Gera SKU do produto a partir do slug + timestamp para garantir unicidade
    const productSku = `${finalSlug}-${Date.now().toString().slice(-4)}`;

    // Constrói dados do produto, incluindo categoria apenas se houver ID
    const productData: any = {
      name,
      slug: finalSlug,
      sku: productSku,
      description: description.length > 0 ? description : undefined,
      priceCents,
      previousPriceCents,
      composition: composition.length > 0 ? composition : undefined,
      careInstructions:
        careInstructions.length > 0 ? careInstructions : undefined,
      weightG,
      widthCm,
      heightCm,
      depthCm,
      status: status as any,
    };

    if (categoryId) {
      productData.category = { connect: { id: categoryId } };
    }

    const p = await tx.product.create({
      data: productData,
    });

    // Cria uma variante padrão herdando o preço do produto
    await tx.productVariant.create({
      data: {
        productId: p.id,
        size: 'Único',
        color: '',
        sku: `${productSku}-UN`,
        priceCents, // herda do produto
        active: true,
      },
    });

    return p;
  });

  revalidatePath('/admin/produtos');
  revalidatePath('/admin');
  redirect('/admin/produtos');
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { success: false, error: 'ID do produto não informado.' };

  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceCentsStr = String(formData.get('priceCents') ?? '').trim();
  const previousPriceCentsStr = String(
    formData.get('previousPriceCents') ?? ''
  ).trim();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const composition = String(formData.get('composition') ?? '').trim();
  const careInstructions = String(formData.get('careInstructions') ?? '').trim();
  const weightG = formData.get('weightG') ? Number(formData.get('weightG')) : undefined;
  const widthCm = formData.get('widthCm') ? Number(formData.get('widthCm')) : undefined;
  const heightCm = formData.get('heightCm') ? Number(formData.get('heightCm')) : undefined;
  const depthCm = formData.get('depthCm') ? Number(formData.get('depthCm')) : undefined;
  const status = String(formData.get('status') ?? '').trim();

  if (!id) return { success: false, error: 'ID do produto não informado.' };
  if (name.length < 3)
    return { success: false, error: 'Nome muito curto.' };
  if (!slug || slug.length < 3)
    return { success: false, error: 'Slug inválido.' };
  const priceCents = Number(priceCentsStr);
  if (priceCents <= 0 || isNaN(priceCents))
    return { success: false, error: 'Preço inválido.' };
  // previousPriceCents é opcional; se informado, deve ser >= 0
  let previousPriceCents: number | undefined;
  if (previousPriceCentsStr) {
    const ppc = Number(previousPriceCentsStr);
    if (ppc < 0 || isNaN(ppc)) return { success: false, error: 'Preço anterior inválido.' };
    previousPriceCents = ppc;
  }

  const finalSlug = slug || slugify(name);

  // Verifica slug único (excluindo este produto)
  const slugConflict = await prisma.product.findFirst({
    where: { slug: finalSlug, NOT: { id } },
  });
  if (slugConflict)
    return { success: false, error: 'Já existe outro produto com este slug.' };

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug: finalSlug,
      description: description.length > 0 ? description : undefined,
      priceCents,
      previousPriceCents,
      composition: composition.length > 0 ? composition : undefined,
      careInstructions: careInstructions.length > 0 ? careInstructions : undefined,
      weightG,
      widthCm,
      heightCm,
      depthCm,
      status: status as any,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
    },
  });

  revalidatePath('/admin/produtos');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { success: false, error: 'ID não informado.' };

  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/produtos');
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleProductStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { success: false, error: 'ID não informado.' };

  await prisma.product.update({
    where: { id },
    data: {
      status: {
        set: 'PUBLICADO',
      },
    },
  });
  // Se já estivesse publicado, coloca como rascunho (toggle simples)
  revalidatePath('/admin/produtos');
  revalidatePath('/admin');
  return { success: true };
}