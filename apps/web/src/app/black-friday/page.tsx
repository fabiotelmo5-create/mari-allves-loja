import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { getBlackFridayProducts } from '@/lib/catalog';

export const metadata = { title: 'Black Friday — Mari Allves' };
export const revalidate = 60;

export default async function BlackFridayPage() {
  const products = await getBlackFridayProducts();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Black Friday</span>
        </nav>

        <div className="mb-8 overflow-hidden rounded-2xl">
          <Image
            src="/marketing/black-friday-banner-v3.jpg"
            alt="Black Friday Mari Allves"
            width={1600}
            height={600}
            className="w-full object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <h1 className="mb-8 text-3xl font-serif text-rosé-700">Black Friday</h1>

        {products.length === 0 ? (
          <p className="text-muted-foreground">
            As ofertas da Black Friday ainda serão anunciadas. Volte em breve.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
