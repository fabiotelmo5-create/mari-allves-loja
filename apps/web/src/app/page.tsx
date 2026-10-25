import Link from 'next/link';
import Image from 'next/image';
import { Star, Truck, Tag, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/button';
import { getFeaturedProducts, getNewArrivals, getPromotions, CATEGORIES } from '@/lib/mock-data';

export default function Home() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const promotions = getPromotions();

  return (
    <main className="flex-1">
      {/* Hero banner */}
      <section className="relative overflow-hidden">
        <div className="relative bg-rosé-50 border-y border-rosé-100">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center lg:py-24 lg:px-8 relative z-10">
            <h1 className="text-4xl font-serif text-rosé-700 tracking-tight mb-6 sm:text-5xl lg:text-6xl">
              Mari Allves — <br /> <span className="text-rosé-400">Moda Modesta</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Roupas e acessórios de moda modesta com elegância, delicadeza e
              profissionalismo. Blusas, saias, vestidos e acessórios para você
              se sentir confiante em cada ocasião.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/categoria/saias">Ver coleção</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/novidades">Novidades</Link>
              </Button>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            <div className="absolute top-1/4 left-1/10 w-64 h-64 bg-rosé-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-1/5 right-1/10 w-72 h-72 bg-rosé-200 rounded-full blur-3xl opacity-40" />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Entrega em Barreiras e região' },
              { icon: Tag, label: 'Preços justos e promoções reais' },
              { icon: ShieldCheck, label: 'Compra segura e sigilosa' },
              { icon: Star, label: 'Troca fácil dentro de 7 dias' },
            ].map((benefit) => (
              <div key={benefit.label} className="flex items-center gap-3 text-sm">
                <benefit.icon className="h-5 w-5 text-rosé-700" />
                <span className="text-muted-foreground">{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias em destaque */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-rosé-700">Categorias</h2>
            <Link href="/catalogo" className="text-sm text-rosé-700 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group block aspect-square border border-border rounded-xl bg-white hover:bg-rosé-50 hover:border-rosé-200 transition-colors flex flex-col items-center justify-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-rosé-100 flex items-center justify-center mb-2 group-hover:bg-rosé-200 transition-colors">
                  <span className="text-2xl">{cat.slug === 'saias' ? '👗' : cat.slug === 'blusas' ? '👚' : cat.slug === 'vestidos' ? '👰' : '👜'}</span>
                </div>
                <span className="text-sm font-medium text-rosé-700 group-hover:text-rosé-600">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Novidades */}
      <section className="py-12 bg-rosé-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-rosé-700">Novidades</h2>
            <Link href="/novidades" className="text-sm text-rosé-700 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-rosé-700">Produtos em destaque</h2>
            <Link href="/catalogo" className="text-sm text-rosé-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promoções */}
      {promotions.length > 0 && (
        <section className="py-12 bg-rosé-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-rosé-700">Promoções</h2>
              <Link href="/promocoes" className="text-sm text-rosé-700 hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {promotions.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
