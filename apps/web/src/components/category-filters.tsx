'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/button';

const SIZES = ['P', 'M', 'G', 'GG'];

type Props = {
  categoryName?: string | null;
  categorySlug?: string;
  basePath?: string;
  selectedSize: string | null;
  min: string;
  max: string;
  sort: string;
  q: string;
  hasFilters: boolean;
};

export function CategoryFilters({
  categoryName,
  categorySlug,
  basePath,
  selectedSize,
  min,
  max,
  sort,
  q,
  hasFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [size, setSize] = useState<string | null>(selectedSize);
  const [pending, startTransition] = useTransition();

  function applySize(value: string) {
    const next = size === value ? null : value;
    setSize(next);

    const params = new URLSearchParams();
    if (next) params.set('size', next);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    if (sort && sort !== 'relevance') params.set('sort', sort);
    if (q) params.set('q', q);

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  const clearPath = basePath ?? (categorySlug ? `/categoria/${categorySlug}` : '/produtos');

  return (
    <form method="get" className="space-y-6 rounded-xl border border-border bg-white p-4">
      {categoryName && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-rosé-700">Categoria</h3>
          <p className="text-sm text-muted-foreground">{categoryName}</p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-rosé-700">Tamanho</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((value) => {
            const active = size === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => applySize(value)}
                aria-pressed={active}
                disabled={pending}
                className={
                  active
                    ? 'cursor-pointer rounded-lg border border-rosé-700 bg-rosé-50 px-3 py-1.5 text-sm font-medium text-rosé-700 shadow-sm transition-colors disabled:opacity-60'
                    : 'cursor-pointer rounded-lg border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-rosé-300 hover:text-foreground disabled:opacity-60'
                }
              >
                {value}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="size" value={size ?? ''} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-rosé-700">Buscar produto</h3>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Ex.: vestido jeans"
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-rosé-700">Preço (R$)</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="min"
            inputMode="decimal"
            defaultValue={min}
            placeholder="Mín."
            className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
          />
          <span className="text-sm text-muted-foreground">a</span>
          <input
            type="text"
            name="max"
            inputMode="decimal"
            defaultValue={max}
            placeholder="Máx."
            className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-rosé-700">Ordenar por</h3>
        <select
          name="sort"
          defaultValue={sort}
          className="w-full border border-input rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          <option value="relevance">Relevância</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="newest">Data de cadastro</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Aplicar filtros
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" size="sm">
            <a href={clearPath}>Limpar</a>
          </Button>
        )}
      </div>
    </form>
  );
}
