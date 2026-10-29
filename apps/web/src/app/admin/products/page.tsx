'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import {
  Package,
  User,
  Mail,
  Palette,
  CheckCircle,
  Loader2,
  Trash,
  Image,
  Layout,
  LogOut,
} from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await prisma.product.findMany({
          include: {
            category: { select: { name: true, slug: true } },
            _count: {
              select: {
                variants: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="py-6 text-center">Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif text-rosé-700">Produtos</h1>
      <a
        href="/admin/produtos/novo"
        className="flex items-center gap-1 rounded-lg bg-rosé-50 px-4 py-2 text-sm font-medium text-rosé-700 hover:bg-rosé-100 transition-colors"
      >
        <Package className="h-4 w-4" /> Novo produto
      </a>

      <p className="mt-4 text-sm text-muted-foreground">
        {products.length} produto(s) cadastrado(s).
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white p-4">
        <table className="w-full rounded-md border-border caption-bottom">
          <thead>
            <tr className="text-xs text-foreground capitalize">
              <th className="text-left">Nome</th>
              <th className="text-left">Slug</th>
              <th className="text-center">Preço</th>
              <th className="text-center">Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="align-middle">
                <td className="font-medium text-foreground">
                  <Link href={`/admin/produtos/${product.slug}`} className="underline underline-offset-2 hover:text-rosé-700">
                    {product.name}
                  </Link>
                </td>
                <td className="text-xs text-muted-foreground">{product.slug}</td>
                <td className="text-right text-rosé-700 font-medium">
                  {formatPrice(product.priceCents)}
                </td>
                <td>
                  <span className={`
                    inline-flex items-center gap-1 px-2 rounded text-[10px] uppercase 
                    ${product.status === 'PUBLICADO' ? 'bg-rosé-100 text-rosé-700' : 'bg-rosé-50 text-rosé-400'}
                  `}>
                    {product.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px]"
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}