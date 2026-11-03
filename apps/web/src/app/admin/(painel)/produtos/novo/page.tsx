import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { createProductAction } from '@/app/admin/actions';
import { ProductForm } from '../product-form';

export const metadata = { title: 'Novo produto — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-rosé-700">
          <ArrowLeft className="h-4 w-4" /> Produtos
        </Link>
        <h1 className="mt-3 text-xl font-serif text-rosé-700">Novo produto</h1>
        <p className="text-sm text-muted-foreground">Salve como rascunho ou publique quando estiver pronto.</p>
      </div>
      <ProductForm categories={categories} action={createProductAction} />
    </div>
  );
}
