import { prisma } from '@mari-allves/db';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asset = await prisma.imageAsset.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });

  if (!asset) {
    return new Response('Imagem não encontrada.', { status: 404 });
  }

  return new Response(new Uint8Array(asset.data), {
    headers: {
      'Content-Type': asset.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
