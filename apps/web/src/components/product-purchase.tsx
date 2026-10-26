'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/button';
import type { Product, ProductVariant } from '@/lib/mock-data';

interface CartItem {
  productSlug: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
}

const CART_KEY = 'ma_cart';

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;

  function selectVariant(variant: ProductVariant) {
    setSelectedVariant(variant);
    setQuantity(1);
    setAdded(false);
  }

  function addToCart() {
    if (!selectedVariant || !inStock) return;

    const cart = readCart();
    const existing = cart.find(
      (item) => item.productSlug === product.slug && item.variantId === selectedVariant.id
    );

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        selectedVariant.stockQuantity
      );
    } else {
      cart.push({
        productSlug: product.slug,
        variantId: selectedVariant.id,
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('ma_cart_updated'));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Variações */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Tamanho e cor</h3>
        <div className="grid grid-cols-3 gap-3">
          {product.variants.map((v) => {
            const available = v.active && v.stockQuantity > 0;
            const isSelected = selectedVariant?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => selectVariant(v)}
                aria-pressed={isSelected}
                className={`aspect-square border rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  !available
                    ? 'border-dashed border-rosé-200 text-rosé-300 cursor-not-allowed'
                    : isSelected
                    ? 'border-rosé-700 bg-rosé-50 text-rosé-700 font-semibold'
                    : 'border-border text-foreground hover:border-rosé-300'
                }`}
                disabled={!available}
              >
                {v.size} · {v.color}
                {!available && <span className="text-[10px] mt-0.5">Sem estoque</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantidade */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Quantidade</span>
        <div className="flex items-center border border-input rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity === 1 || !inStock}
            aria-label="Diminuir quantidade"
            className="px-3 py-1.5 text-sm hover:bg-rosé-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={!inStock || quantity >= (selectedVariant?.stockQuantity ?? 0)}
            aria-label="Aumentar quantidade"
            className="px-3 py-1.5 text-sm hover:bg-rosé-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Estoque */}
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          inStock ? 'text-rosé-700' : 'text-red-600'
        }`}
        role="status"
      >
        {inStock ? (
          <>
            <span>✓ Disponível</span>
            {selectedVariant?.stockQuantity != null && selectedVariant.stockQuantity <= 5 && (
              <span> — Apenas {selectedVariant.stockQuantity} unidade(s)</span>
            )}
          </>
        ) : (
          <span>{selectedVariant ? 'Indisponível' : 'Selecione um tamanho e cor'}</span>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          disabled={!inStock}
          className="flex-1"
          onClick={addToCart}
          type="button"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {!selectedVariant
            ? 'Selecione tamanho e cor'
            : inStock
            ? 'Adicionar ao carrinho'
            : 'Esgotado'}
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link
            href={`/checkout?produto=${product.slug}&variante=${selectedVariant?.id ?? ''}&qtd=${quantity}`}
            aria-disabled={!inStock}
            className={!inStock ? 'pointer-events-none opacity-50' : undefined}
          >
            Comprar agora
          </Link>
        </Button>
      </div>

      {added && (
        <p className="text-sm text-rosé-700" role="status">
          ✓ Adicionado ao carrinho.{' '}
          <Link href="/carrinho" className="underline font-medium">
            Ver carrinho
          </Link>
        </p>
      )}

      <button
        type="button"
        className="text-sm text-rosé-700 flex items-center gap-1 hover:underline"
      >
        <Heart className="h-4 w-4" /> Adicionar aos favoritos
      </button>
    </div>
  );
}
