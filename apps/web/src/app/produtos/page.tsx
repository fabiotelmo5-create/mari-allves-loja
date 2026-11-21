import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { CategoryFilters } from '@/components/category-filters';
import { listProducts } from '@/lib/catalog';

export const metadata = { title: 'Todos os produtos — Mari Allves' };
export const revalidate = 60;

const SIZES = ['P', 'M', 'G', 'GG'];

function parsePriceToCents(value?: string) {
  if (!value) return null;
  const normalized = value.trim().replace(/[^\d.,]/g, '');
  if (!normalized) return null;
  const decimal = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;
  const number = Number(decimal);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string; min?: string; max?: string; sort?: string; q?: string }>;
}) {
  const { size, min, max, sort, q } = await searchParams;
  const term = (q ?? '').trim().toLowerCase();
  const allProducts = await listProducts();

  const selectedSize = size && SIZES.includes(size) ? size : null;
  const minCents = parsePriceToCents(min);
  const maxCents = parsePriceToCents(max);

  let products = term
    ? allProducts.filter((p) => p.name.toLowerCase().includes(term))
    : allProducts;

  if (selectedSize) {
    products = products.filter((p) =>
      p.variants.some(
        (v) => v.active && v.size === selectedSize && v.stockQuantity > 0
      )
    );
  }
  if (minCents !== null) products = products.filter((p) => p.priceCents >= minCents);
  if (maxCents !== null) products = products.filter((p) => p.priceCents <= maxCents);

  if (sort === 'price-asc') products = [...products].sort((a, b) => a.priceCents - b.priceCents);
  else if (sort === 'price-desc') products = [...products].sort((a, b) => b.priceCents - a.priceCents);
  else if (sort === 'newest') products = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasFilters = Boolean(
    Boolean(term) || selectedSize || minCents !== null || maxCents !== null || (sort && sort !== 'relevance')
  );

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Todos os produtos</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-1/4">
            <CategoryFilters
              basePath="/produtos"
              selectedSize={selectedSize}
              min={min ?? ''}
              max={max ?? ''}
              sort={sort ?? 'relevance'}
              q={q ?? ''}
              hasFilters={hasFilters}
            />
          </aside>

          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-serif text-rosé-700">Todos os produtos</h1>
              <span className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Nenhum produto encontrado com esses filtros.</p>
                {hasFilters && (
                  <Link href="/produtos" className="mt-4 inline-block font-medium text-rosé-700 hover:underline">
                    Limpar filtros →
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
