'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { deleteImageAsset, imageAssetIdFromUrl, resolveImage } from '@/lib/image-upload';

function categoryRedirect(params: string): never {
  redirect(`/admin/categorias?${params}`);
}

export async function setCategoryActiveAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  const active = formData.get('active') === 'true';

  if (!id) categoryRedirect(`erro=${encodeURIComponent('Categoria não encontrada.')}`);

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, active: true },
  });
  if (!category) categoryRedirect(`erro=${encodeURIComponent('Categoria não encontrada.')}`);

  if (!active) {
    const inUse = await prisma.product.count({
      where: { categoryId: id, status: 'PUBLICADO' },
    });
    if (inUse > 0) {
      categoryRedirect(`erro=${encodeURIComponent(`A categoria ainda tem ${inUse} produto(s) publicado(s). Mova ou remova os produtos antes de desativar.`)}`);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.category.update({ where: { id }, data: { active } });
    await tx.auditLog.create({
      data: {
        tableName: 'Category',
        recordId: id,
        action: 'UPDATE',
        changedBy: admin.userId,
        oldData: { active: category.active },
        newData: { active },
      },
    });
  });

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin/categorias');
  if (category.slug) revalidatePath(`/categoria/${category.slug}`);

  categoryRedirect(active ? 'reativada=1' : 'desativada=1');
}

export async function updateCategoryImageAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  if (!id) categoryRedirect(`erro=${encodeURIComponent('Categoria não encontrada.')}`);

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, imageUrl: true },
  });

  if (!category) categoryRedirect(`erro=${encodeURIComponent('Categoria não encontrada.')}`);

  const image = await resolveImage(formData);
  if (image.error) categoryRedirect(`erro=${encodeURIComponent(image.error)}`);

  const removeImage = formData.get('removeImage') === 'on';
  const nextImageUrl = image.value ?? (removeImage ? null : category.imageUrl);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id: category.id },
        data: { imageUrl: nextImageUrl },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'Category',
          recordId: category.id,
          action: 'UPDATE',
          changedBy: admin.userId,
          newData: { imageUrl: nextImageUrl },
        },
      });
    });
  } catch {
    await deleteImageAsset(image.assetId);
    categoryRedirect(`erro=${encodeURIComponent('Não foi possível salvar a imagem. Tente novamente.')}`);
  }

  const oldAssetId = imageAssetIdFromUrl(category.imageUrl);
  if (oldAssetId && oldAssetId !== imageAssetIdFromUrl(nextImageUrl)) {
    await deleteImageAsset(oldAssetId);
  }

  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath(`/categoria/${category.slug}`);
  revalidatePath('/admin/categorias');

  categoryRedirect('salvo=1');
}
