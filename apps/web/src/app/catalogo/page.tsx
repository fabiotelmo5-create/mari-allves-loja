import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { CATEGORIES, getFeaturedProducts } from '@/lib/mock-data';

export default function CatalogoPage() {
  const featured = getFeaturedProducts();
  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Catálogo</span>
        </nav>
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Catálogo</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group block aspect-square border border-border rounded-xl bg-white hover:bg-rosé-50 hover:border-rosé-200 transition-colors flex flex-col items-center justify-center py-4"
            >
              <div className="w-12 h-12 rounded-full bg-rosé-100 flex items-center justify-center mb-2 group-hover:bg-rosé-200 transition-colors">
                <span className="text-2xl">
                  {cat.slug === 'saias' ? '👗' : cat.slug === 'blusas' ? '👚' : cat.slug === 'vestidos' ? '👰' : '👜'}
                </span>
              </div>
              <span className="text-sm font-medium text-rosé-700 group-hover:text-rosé-600">{cat.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-serif text-rosé-700 mb-6">Destaques</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
