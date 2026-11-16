import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const previousPriceCents = product.previousPriceCents;
  const hasPromo = Boolean(
    previousPriceCents != null && previousPriceCents > product.priceCents
  );
  const hasStock = product.variants.some((v) => v.active && v.stockQuantity > 0);
  const discountPercent =
    hasPromo && previousPriceCents
      ? Math.round((1 - product.priceCents / previousPriceCents) * 100)
      : 0;

  return (
    <article className="group border border-border rounded-xl p-4 hover:border-rosé-300 transition-colors bg-white">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-rosé-50">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={firstImage.alt}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-rosé-400">
              Mari Allves
            </div>
          )}
          {hasPromo && (
            <span className="absolute left-2 top-2 rounded-full border border-rosé-200 bg-rosé-100/95 px-1.5 py-0.5 text-[10px] font-semibold text-rosé-700 shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {hasPromo && previousPriceCents != null && (
            <span className="inline-block origin-left text-sm text-muted-foreground line-through transition-all duration-200 group-hover:scale-95 group-hover:text-muted-foreground/70">
              {formatPrice(previousPriceCents)}
            </span>
          )}
          <span
            className={`inline-block origin-left font-bold text-rosé-700 transition-all duration-200 group-hover:scale-110 group-hover:text-rosé-800 ${
              hasPromo ? 'text-xl' : 'text-base'
            }`}
          >
            {formatPrice(product.priceCents)}
          </span>
        </div>

        {!hasStock ? (
          <span className="text-xs text-red-600 mt-1 block font-medium">Esgotado</span>
        ) : (
          <span className="mt-2 w-full py-2 text-xs font-medium text-rosé-700 bg-rosé-50 group-hover:bg-rosé-100 rounded-lg transition-colors flex items-center justify-center">
            Ver produto
          </span>
        )}
      </Link>
    </article>
  );
}
