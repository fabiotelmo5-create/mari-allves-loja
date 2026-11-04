import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { listCategories, getFeaturedProducts } from '@/lib/catalog';
import { getCategoryImage } from '@/lib/category-images';

export const revalidate = 60;

export default async function CatalogoPage() {
  const [categories, featured] = await Promise.all([
    listCategories(),
    getFeaturedProducts(8),
  ]);
  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Catálogo</span>
        </nav>
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Catálogo</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => {
            const image = getCategoryImage(cat.imageUrl, cat.slug);

            return (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-border bg-rosé-50 transition-colors hover:border-rosé-300"
              >
                <Image
                  src={image}
                  alt={`Categoria ${cat.name}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  unoptimized={image.endsWith('.svg')}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 text-base font-medium text-white drop-shadow">
                  {cat.name}
                </span>
              </Link>
            );
          })}
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
