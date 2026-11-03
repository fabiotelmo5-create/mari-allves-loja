import Link from 'next/link';
import { Archive, Package, Pencil, Plus } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { archiveProductAction } from '@/app/admin/actions';

export const metadata = { title: 'Produtos — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

const statusLabel = {
  RASCUNHO: 'Rascunho',
  PUBLICADO: 'Publicado',
  INATIVO: 'Inativo',
  ARQUIVADO: 'Arquivado',
} as const;

const statusClass = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  PUBLICADO: 'bg-emerald-50 text-emerald-700',
  INATIVO: 'bg-amber-50 text-amber-700',
  ARQUIVADO: 'bg-rosé-50 text-rosé-700',
} as const;

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { position: 'asc' } },
      _count: { select: { variants: { where: { active: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-rosé-700">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre produtos, preços, variações e estoque inicial.
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-rosé-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosé-600"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rosé-200 bg-white px-6 py-14 text-center">
          <Package className="mx-auto h-9 w-9 text-rosé-400" />
          <h2 className="mt-3 font-medium text-foreground">Nenhum produto cadastrado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre o primeiro produto real da Mari Allves.
          </p>
          <Link
            href="/admin/produtos/novo"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rosé-700 hover:underline"
          >
            <Plus className="h-4 w-4" /> Cadastrar produto
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-rosé-50/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Variações</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-rosé-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          // URL cadastrada pelo admin; Next Image não é usado para permitir host externo.
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover bg-rosé-50"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-rosé-50 text-rosé-400">
                            <Package className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <Link
                            href={`/admin/produtos/${product.id}`}
                            className="font-medium text-foreground hover:text-rosé-700"
                          >
                            {product.name}
                          </Link>
                          <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                            {product.sku} · /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category.name}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product._count.variants}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${statusClass[product.status]}`}>
                        {statusLabel[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-rosé-700 hover:bg-rosé-50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Link>
                        {product.status !== 'ARQUIVADO' && (
                          <form action={archiveProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-rosé-50 hover:text-rosé-700"
                            >
                              <Archive className="h-3.5 w-3.5" /> Arquivar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
