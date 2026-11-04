import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/button';
import { getCategoryBySlug, getProductsByCategory } from '@/lib/catalog';

export const revalidate = 60;

const SIZES = ['P', 'M', 'G', 'GG'];

function parsePriceToCents(value?: string) {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(/[^\d.,]/g, '');

  if (!normalized) return null;

  const decimal = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;

  const number = Number(decimal);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string; min?: string; max?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { size, min, max, sort } = await searchParams;

  const [category, allProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  if (!category) notFound();

  const selectedSize = size && SIZES.includes(size) ? size : null;
  const minCents = parsePriceToCents(min);
  const maxCents = parsePriceToCents(max);

  let products = allProducts;

  if (selectedSize) {
    products = products.filter((product) =>
      product.variants.some(
        (variant) =>
          variant.active && variant.size === selectedSize && variant.stockQuantity > 0
      )
    );
  }

  if (minCents !== null) {
    products = products.filter((product) => product.priceCents >= minCents);
  }

  if (maxCents !== null) {
    products = products.filter((product) => product.priceCents <= maxCents);
  }

  if (sort === 'price-asc') {
    products = [...products].sort((a, b) => a.priceCents - b.priceCents);
  } else if (sort === 'price-desc') {
    products = [...products].sort((a, b) => b.priceCents - a.priceCents);
  } else if (sort === 'newest') {
    products = [...products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const hasFilters = Boolean(
    selectedSize ||
      minCents !== null ||
      maxCents !== null ||
      (sort && sort !== 'relevance')
  );

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-1/4 space-y-6">
            <form method="get" className="space-y-6 rounded-xl border border-border bg-white p-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-rosé-700">Categoria</h3>
                <p className="text-sm text-muted-foreground">{category.name}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-rosé-700">Tamanho</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((value) => (
                    <label
                      key={value}
                      className={
                        selectedSize === value
                          ? 'cursor-pointer rounded-lg border border-rosé-700 bg-rosé-50 px-3 py-1.5 text-sm text-rosé-700'
                          : 'cursor-pointer rounded-lg border border-input px-3 py-1.5 text-sm text-muted-foreground hover:border-rosé-300'
                      }
                    >
                      <input
                        type="radio"
                        name="size"
                        value={value}
                        defaultChecked={selectedSize === value}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-rosé-700">Preço (R$)</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="min"
                    inputMode="decimal"
                    defaultValue={min ?? ''}
                    placeholder="Mín."
                    className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">a</span>
                  <input
                    type="text"
                    name="max"
                    inputMode="decimal"
                    defaultValue={max ?? ''}
                    placeholder="Máx."
                    className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-rosé-700">Ordenar por</h3>
                <select
                  name="sort"
                  defaultValue={sort ?? 'relevance'}
                  className="w-full border border-input rounded-lg px-2 py-1.5 text-sm bg-white"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="newest">Data de cadastro</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">Aplicar filtros</Button>
                {hasFilters && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/categoria/${category.slug}`}>Limpar</Link>
                  </Button>
                )}
              </div>
            </form>
          </aside>

          <section className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-serif text-rosé-700">{category.name}</h1>
              <span className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum produto encontrado com esses filtros.</p>
                {hasFilters && (
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="mt-4 inline-block text-rosé-700 hover:underline font-medium"
                  >
                    Limpar filtros →
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
