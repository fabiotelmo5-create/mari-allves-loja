import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { updateProductAction } from '@/app/admin/actions';
import { ProductForm } from '../product-form';

export const metadata = { title: 'Editar produto — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

function money(cents: number | null) {
  if (cents === null) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { take: 1, orderBy: { position: 'asc' } },
        variants: {
          where: { active: true },
          include: { stock: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    }),
  ]);

  if (!product) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <h1 className="font-serif text-xl text-rosé-700">Produto não encontrado</h1>
        <Link href="/admin/produtos" className="mt-3 inline-block text-sm text-rosé-700 hover:underline">Voltar aos produtos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-rosé-700">
          <ArrowLeft className="h-4 w-4" /> Produtos
        </Link>
        <h1 className="mt-3 text-xl font-serif text-rosé-700">Editar produto</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm
        categories={categories}
        action={updateProductAction}
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description ?? '',
          categoryId: product.categoryId,
          price: money(product.priceCents),
          previousPrice: money(product.previousPriceCents),
          composition: product.composition ?? '',
          careInstructions: product.careInstructions ?? '',
          weightG: product.weightG?.toString() ?? '',
          widthCm: product.widthCm?.toString() ?? '',
          heightCm: product.heightCm?.toString() ?? '',
          depthCm: product.depthCm?.toString() ?? '',
          imageUrl: product.images[0]?.url ?? '',
          status: product.status,
        }}
        initialVariants={product.variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          initialStock: variant.stock?.quantity ?? 0,
        }))}
      />
    </div>
  );
}
