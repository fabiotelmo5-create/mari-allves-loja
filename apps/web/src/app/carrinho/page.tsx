'use client';

import Link from 'next/link';
import { Button } from '@/components/button';
import { ShoppingBag, Trash2, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getProductBySlug } from '@/lib/mock-data';
import Image from 'next/image';

interface CartItem {
  productSlug: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
}

function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('ma_cart') ?? '[]');
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [cart, setCart] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = cart.reduce((acc, item) => {
    const p = getProductBySlug(item.productSlug);
    const v = p?.variants.find((x) => x.id === item.variantId);
    return acc + (v?.priceCents ?? p?.priceCents ?? 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 1200 : 0;
  const total = subtotal + shipping;

  const cartItems = cart.map((item) => {
    const p = getProductBySlug(item.productSlug);
    const v = p?.variants.find((x) => x.id === item.variantId);
    const price = v?.priceCents ?? p?.priceCents ?? 0;

    return (
      <div key={item.variantId} className="flex gap-4 items-center border-b border-border pb-4">
        <div className="relative aspect-square w-24 h-24 bg-rosé-50 rounded-lg overflow-hidden flex-shrink-0">
          {p?.images[0] && (
            <Image
              src={p.images[0].url}
              alt={p.images[0].alt}
              fill
              className="object-cover"
              sizes="64px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/produto/${p?.slug}`}
            className="text-sm font-medium text-foreground line-clamp-1 hover:text-rosé-700"
          >
            {p?.name} ({item.size} / {item.color})
          </Link>
          <p className="text-xs text-muted-foreground mt-1">SKU: {v?.sku ?? p?.sku}</p>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-medium">{formatPrice(price)}</span>
          <div className="flex items-center border border-input rounded-lg overflow-hidden">
            <button
              onClick={() => {
                const next = cart.map((c) =>
                  c.variantId === item.variantId
                    ? { ...c, quantity: Math.max(1, c.quantity - 1) }
                    : c
                );
                setCart(next);
                localStorage.setItem('ma_cart', JSON.stringify(next));
              }}
              disabled={item.quantity === 1}
              className="px-3 py-1 text-sm hover:bg-rosé-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm">{item.quantity}</span>
            <button
              onClick={() => {
                const next = cart.map((c) =>
                  c.variantId === item.variantId
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
                );
                setCart(next);
                localStorage.setItem('ma_cart', JSON.stringify(next));
              }}
              className="px-3 py-1 text-sm hover:bg-rosé-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              const next = cart.filter((c) => c.variantId !== item.variantId);
              setCart(next);
              localStorage.setItem('ma_cart', JSON.stringify(next));
            }}
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
            {cart.length === 0 ? (
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

import React from 'react';
