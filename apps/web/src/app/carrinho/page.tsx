'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { Button } from '@/components/button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';

interface CartItem {
  productSlug: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
}

const CART_KEY = 'ma_cart';

function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('ma_cart_updated'));
}

export default function CartPage() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [products, setProducts] = React.useState<Record<string, Product>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = getCart();
    setCart(stored);

    const slugs = Array.from(new Set(stored.map((item) => item.productSlug)));

    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`/api/produtos?slugs=${encodeURIComponent(slugs.join(','))}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((list: Product[]) => {
        if (cancelled) return;

        const map: Record<string, Product> = {};
        for (const product of list) map[product.slug] = product;
        setProducts(map);

        // Remove do carrinho itens cujo produto não existe mais
        const valid = stored.filter((item) => map[item.productSlug]);
        if (valid.length !== stored.length) {
          setCart(valid);
          saveCart(valid);
        }
      })
      .catch(() => {
        /* mantém o carrinho; o usuário pode tentar novamente */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateQuantity(variantId: string, nextQuantity: number) {
    const next = cart.map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: Math.max(1, nextQuantity) }
        : item
    );
    setCart(next);
    saveCart(next);
  }

  function removeItem(variantId: string) {
    const next = cart.filter((item) => item.variantId !== variantId);
    setCart(next);
    saveCart(next);
  }

  const subtotal = cart.reduce((acc, item) => {
    const product = products[item.productSlug];
    const variant = product?.variants.find((v) => v.id === item.variantId);
    return acc + (variant?.priceCents ?? product?.priceCents ?? 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 1200 : 0;
  const total = subtotal + shipping;

  const cartItems = cart.map((item) => {
    const product = products[item.productSlug];
    const variant = product?.variants.find((v) => v.id === item.variantId);
    const price = variant?.priceCents ?? product?.priceCents ?? 0;

    return (
      <div key={item.variantId} className="flex gap-4 items-center border-b border-border pb-4">
        <div className="relative aspect-square w-24 h-24 bg-rosé-50 rounded-lg overflow-hidden flex-shrink-0">
          {product?.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              className="object-cover"
              sizes="96px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/produto/${product?.slug ?? item.productSlug}`}
            className="text-sm font-medium text-foreground line-clamp-1 hover:text-rosé-700"
          >
            {product?.name ?? item.productSlug} ({item.size} / {item.color})
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            SKU: {variant?.sku ?? product?.sku ?? '—'}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-medium">{formatPrice(price)}</span>
          <div className="flex items-center border border-input rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              disabled={item.quantity === 1}
              aria-label="Diminuir quantidade"
              className="px-3 py-1 text-sm hover:bg-rosé-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              aria-label="Aumentar quantidade"
              className="px-3 py-1 text-sm hover:bg-rosé-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label="Remover item"
            className="text-rosé-500 hover:text-rosé-700 text-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  });

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild size="sm">
            <Link href="/">← Continuar comprando</Link>
          </Button>
          <h1 className="text-2xl font-serif text-rosé-700">Carrinho de compras</h1>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <section className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-16 border border-border rounded-xl bg-white text-muted-foreground">
                Carregando seu carrinho…
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 border border-border rounded-xl bg-white">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Seu carrinho está vazio</h3>
                <p className="text-muted-foreground">
                  Adicione produtos para começar sua compra.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/">Ir para a loja</Link>
                </Button>
              </div>
            ) : (
              <>{cartItems}</>
            )}

            <div className="mt-8 border border-border rounded-xl p-6 bg-white">
              <h3 className="text-sm font-semibold text-rosé-700 mb-4">
                Cupom de desconto
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o cupom"
                  className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                />
                <Button variant="outline" size="sm">Aplicar</Button>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1 space-y-4">
            <div className="border border-border rounded-xl p-6 bg-white">
              <h3 className="text-sm font-semibold text-rosé-700 mb-4">
                Resumo do pedido
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} item(ns))
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Frete (motoboy)</span>
                  <span className="text-muted-foreground">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-rosé-700">{formatPrice(total)}</span>
                </div>
              </div>
              <Button
                disabled={cart.length === 0}
                className="w-full mt-6"
                asChild
              >
                <Link href="/checkout">Finalizar compra</Link>
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 text-rosé-400" />
              <span>Entrega em Barreiras e região</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
