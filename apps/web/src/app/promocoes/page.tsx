import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { getPromotions } from '@/lib/mock-data';

export default function PromocoesPage() {
  const products = getPromotions();
  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Promoções</span>
        </nav>
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Promoções</h1>
        {products.length === 0 ? (
          <p className="text-muted-foreground">Não há promoções no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
