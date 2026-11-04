'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/mock-data';

export function ProductGallery({ images, name }: { images: Product['images']; name: string }) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-rosé-50">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.2em] text-rosé-400">
            Mari Allves
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, index) => (
            <button
              key={`${img.position}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={
                index === active
                  ? 'relative aspect-square overflow-hidden rounded-lg border-2 border-rosé-700'
                  : 'relative aspect-square overflow-hidden rounded-lg border-2 border-transparent transition-colors hover:border-rosé-300'
              }
              aria-label={`Ver imagem ${index + 1} de ${name}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
