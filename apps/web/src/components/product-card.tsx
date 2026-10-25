'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const hasPromo = Boolean(product.previousPriceCents && product.previousPriceCents > product.priceCents);
  const hasStock = product.variants.some((v) => v.active && v.stockQuantity > 0);

  return (
    <article className="group border border-border rounded-xl p-4 hover:border-rosé-300 transition-colors bg-white">
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-rosé-50">
        <Image
          src={firstImage.url}
          alt={firstImage.alt}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          priority
        />
        {hasPromo && (
          <span className="absolute top-2 left-2 bg-rosé-700 text-white text-xs font-bold px-2 py-1 rounded">
            Promoção
          </span>
        )}
        <button className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-4 w-4 text-rosé-700" />
        </button>
      </div>

      <Link href={`/produto/${product.slug}`} className="block">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

        <div className="flex items-baseline gap-2">
          <span className="font-bold text-rosé-700">{formatPrice(product.priceCents)}</span>
          {hasPromo && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.previousPriceCents)}
            </span>
          )}
        </div>

        {!hasStock ? (
          <span className="text-xs text-red-600 mt-1 block font-medium">Esgotado</span>
        ) : (
          <button className="mt-2 w-full py-2 text-xs font-medium text-rosé-700 bg-rosé-50 hover:bg-rosé-100 rounded-lg transition-colors flex items-center justify-center gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        )}
      </Link>
    </article>
  );
}
