import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/product-card';
import { getBlackFridayProducts, getNewArrivals, getPromotions, listCategories } from '@/lib/catalog';
import { getCategoryImage } from '@/lib/category-images';

// Revalida o catálogo a cada 60s (estoque/preços mudam pelo admin)
export const revalidate = 60;

export default async function Home() {
  const [newArrivals, promotions, blackFridayProducts, categories] = await Promise.all([
    getNewArrivals(),
    getPromotions(),
    getBlackFridayProducts(),
    listCategories(),
  ]);

  return (
    <main className="flex-1">
      {/* Vídeo hero — primeira tela */}
      <section className="relative overflow-hidden bg-rosé-950">
        <video
          className="h-[70vh] min-h-[420px] w-full object-cover md:h-[82vh]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Vídeo da Mari Allves com modelos usando as roupas da coleção"
        >
          <source src="/marketing/video-hero.mp4" type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-10 text-center">
          <p className="font-serif text-3xl text-white drop-shadow-lg sm:text-4xl">
            Mari Allves
          </p>
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {categories.map((cat) => {
              const image = getCategoryImage(cat.imageUrl, cat.slug);

              return (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="group relative mx-auto block aspect-square w-full max-w-[200px] overflow-hidden rounded-full border border-border bg-rosé-50 transition-colors hover:border-rosé-300"
                >
                  <Image
                    src={image}
                    alt={`Categoria ${cat.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized={image.endsWith('.svg')}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
                  <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm font-medium text-white drop-shadow">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner Black Friday — faixa retangular acima dos produtos */}
      <section className="bg-white">
        <Link href="/catalogo" className="block w-full">
          <Image
            src="/marketing/black-friday-banner-v3.jpg"
            alt="Primeira Black Friday Mari Allves — novembro, até 50% de desconto e frete grátis para Barreiras"
            width={1600}
            height={600}
            className="w-full object-cover"
            sizes="100vw"
            priority
          />
        </Link>
      </section>

      {/* Faixa Black Friday */}
      {blackFridayProducts.length > 0 && (
        <section className="py-12 bg-rosé-100/60">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-rosé-700">Black Friday</h2>
              <Link href="/black-friday" className="text-sm text-rosé-700 hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {blackFridayProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

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
    </main>
  );
}
