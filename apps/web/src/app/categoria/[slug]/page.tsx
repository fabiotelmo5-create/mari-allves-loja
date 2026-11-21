import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { CategoryFilters } from '@/components/category-filters';
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
  searchParams: Promise<{ size?: string; min?: string; max?: string; sort?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { size, min, max, sort, q } = await searchParams;
  const term = (q ?? '').trim().toLowerCase();

  const [category, allProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  if (!category) notFound();

  const selectedSize = size && SIZES.includes(size) ? size : null;
  const minCents = parsePriceToCents(min);
  const maxCents = parsePriceToCents(max);

  let products = term
    ? allProducts.filter((p) => p.name.toLowerCase().includes(term))
    : allProducts;

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
    Boolean(term) ||
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
            <CategoryFilters
              categoryName={category.name}
              categorySlug={category.slug}
              selectedSize={selectedSize}
              min={min ?? ''}
              max={max ?? ''}
              sort={sort ?? 'relevance'}
              hasFilters={hasFilters}
              q={q ?? ''}
            />
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
