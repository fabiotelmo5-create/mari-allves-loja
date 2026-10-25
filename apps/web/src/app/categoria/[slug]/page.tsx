import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/button';
import {
  getProductsByCategory,
  CATEGORIES,
} from '@/lib/mock-data';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = getProductsByCategory(slug);
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category || products.length === 0) {
    notFound();
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filtros (desktop) */}
          <aside className="lg:w-1/4 hidden lg:block space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-rosé-700">Categoria</h3>
              <p className="text-sm text-muted-foreground">{category.name}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-rosé-700">Tamanho</h3>
              <div className="flex gap-2">
                {['P', 'M', 'G', 'GG'].map((size) => (
                  <Button key={size} variant="outline" size="sm">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-rosé-700">Preço</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Mín."
                    className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
                  />
                  <span>a</span>
                  <input
                    type="text"
                    placeholder="Máx."
                    className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Resultados */}
          <section className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-serif text-rosé-700">{category.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <select className="border border-input rounded-lg px-2 py-1 text-sm bg-white">
                  <option>Relevância</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                  <option>Data de cadastro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Nenhum produto encontrado nesta categoria.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
