import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { searchProducts } from '@/lib/catalog';

export const metadata = { title: 'Busca — Mari Allves' };

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim().slice(0, 80);
  const products = query ? await searchProducts(query) : [];

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Busca</span>
        </nav>

        <h1 className="text-3xl font-serif text-rosé-700 mb-6">Busca</h1>

        <form action="/busca" method="get" className="flex gap-2 max-w-xl mb-8">
          <input
            type="search"
            name="q"
            defaultValue={query}
            aria-label="Buscar produtos"
            placeholder="Buscar por nome, cor ou categoria..."
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-rosé-700"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-rosé-700 text-white text-sm font-medium hover:bg-rosé-800 transition-colors"
          >
            Buscar
          </button>
        </form>

        {!query ? (
          <p className="text-muted-foreground">Digite um termo para buscar.</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum produto encontrado para “{query}”.</p>
            <Link href="/catalogo" className="mt-4 inline-block text-rosé-700 hover:underline font-medium">
              Ver todos os produtos →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length} {products.length === 1 ? 'resultado' : 'resultados'} para “{query}”.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
