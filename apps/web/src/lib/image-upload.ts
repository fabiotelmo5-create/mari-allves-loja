import 'server-only';

import { prisma } from '@mari-allves/db';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function parseImageUrl(value: FormDataEntryValue | null): { value?: string; error?: string } {
  const url = String(value ?? '').trim();
  if (!url) return {};

  if (url.startsWith('/api/imagens/')) {
    const id = url.slice('/api/imagens/'.length);
    if (!/^[a-z0-9]+$/i.test(id)) return { error: 'Link de imagem inválido.' };
    return { value: url };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { error: 'A imagem precisa usar um link http ou https.' };
    }
    return { value: parsed.toString() };
  } catch {
    return { error: 'Link de imagem inválido.' };
  }
}

export async function resolveImage(
  formData: FormData
): Promise<{ value?: string; error?: string; assetId?: string }> {
  const file = formData.get('imageFile');

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: 'A foto deve ter no máximo 4 MB.' };
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { error: 'Envie a foto em JPG, PNG ou WebP.' };
    }

    const asset = await prisma.imageAsset.create({
      data: {
        mimeType: file.type,
        size: file.size,
        data: Buffer.from(await file.arrayBuffer()),
      },
      select: { id: true },
    });

    return { value: `/api/imagens/${asset.id}`, assetId: asset.id };
  }

  return parseImageUrl(formData.get('imageUrl'));
}

export async function deleteImageAsset(assetId: string | undefined) {
  if (!assetId) return;
  try {
    await prisma.imageAsset.delete({ where: { id: assetId } });
  } catch {
    // A limpeza é opcional: nunca deve impedir o cadastro.
  }
}

export function imageAssetIdFromUrl(url: string | null | undefined) {
  if (!url?.startsWith('/api/imagens/')) return undefined;
  const id = url.slice('/api/imagens/'.length);
  return /^[a-z0-9]+$/i.test(id) ? id : undefined;
}
