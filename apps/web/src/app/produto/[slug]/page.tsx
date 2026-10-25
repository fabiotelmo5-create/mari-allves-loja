import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Heart, Mail, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/button';
import { getProductBySlug } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasPromo = Boolean(product.previousPriceCents && product.previousPriceCents > product.priceCents);
  const [selectedVariant, setSelectedVariant] = React.useState<
    (typeof product.variants)[number] | null
  >(null);
  const [quantity, setQuantity] = React.useState(1);

  const inStock = selectedVariant?.stockQuantity ?? 0 > 0;

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <Link href={`/categoria/${product.categorySlug}`} className="hover:text-rosé-700">
            {product.category}
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Galeria de imagens */}
          <div className="space-y-4">
            <div className="aspect-square bg-rosé-50 border border-border rounded-xl relative overflow-hidden">
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img) => (
                <img
                  key={img.position}
                  src={img.url}
                  alt={img.alt}
                  className="aspect-square object-cover rounded-lg border border-transparent hover:border-rosé-300 cursor-pointer transition-colors"
                />
              ))}
            </div>
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-medium text-rosé-700 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-3xl font-serif text-rosé-700 mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>

            {/* Preço */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rosé-700">
                {formatPrice(product.priceCents)}
              </span>
              {hasPromo && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.previousPriceCents)}
                </span>
              )}
            </div>

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
                      onClick={() => setSelectedVariant(v)}
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
              <label className="text-sm text-muted-foreground">Quantidade</label>
              <div className="flex items-center border border-input rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity === 1 || !inStock}
                  className="px-3 py-1.5 text-sm hover:bg-rosé-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!inStock || quantity >= (selectedVariant?.stockQuantity ?? 0)}
                  className="px-3 py-1.5 text-sm hover:bg-rosé-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Estoque */}
            <div className={`flex items-center gap-2 text-sm font-medium ${
              inStock ? 'text-rosé-700' : 'text-red-600'
            }`}>
              {inStock ? (
                <>
                  <span>✓ Disponível</span>
                  {selectedVariant?.stockQuantity != null && selectedVariant.stockQuantity <= 5 && (
                    <span> — Apenas {selectedVariant.stockQuantity} unidade(s)</span>
                  )}
                </>
              ) : (
                <span>Indisponível</span>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                disabled={!inStock || !selectedVariant}
                className="flex-1"
                onClick={() => {
                  if (selectedVariant) {
                    // Adicionar ao carrinho (mock)
                    alert(
                      `Adicionado ao carrinho: ${product.name} (${selectedVariant.size} / ${selectedVariant.color}) x${quantity}`
                    );
                  }
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {inStock ? 'Adicionar ao carrinho' : 'Esgotado'}
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/checkout?produto=${product.slug}&variante=${selectedVariant?.id ?? ''}&qtd=${quantity}`}>
                  Comprar agora
                </Link>
              </Button>
            </div>

            <button className="text-sm text-rosé-700 flex items-center gap-1 hover:underline">
              <Heart className="h-4 w-4" /> Adicionar aos favoritos
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border rounded-xl p-6 bg-white">
              <h3 className="text-sm font-semibold text-rosé-700 mb-4">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Composição</span>
                <span className="text-foreground font-medium">{product.composition ?? 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Lavagem</span>
                <span className="text-foreground font-medium">{product.careInstructions ?? 'Consulte a etiqueta'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Peso</span>
                <span className="text-foreground font-medium">
                  {product.weightG ? `${product.weightG}g` : 'Não informado'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Dimensões</span>
                <span className="text-foreground font-medium">
                  {product.widthCm && product.heightCm && product.depthCm
                    ? `${product.widthCm} × ${product.heightCm} × ${product.depthCm} cm`
                    : 'Não informado'}
                </span>
              </div>
            </div>

            {product.measurement && (
              <div className="border border-border rounded-xl p-6 bg-white">
                <h3 className="text-sm font-semibold text-rosé-700 mb-4">Guia de medidas (cm)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.measurement.bustCm && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Busto</span>
                      <span className="text-foreground">{product.measurement.bustCm} cm</span>
                    </div>
                  )}
                  {product.measurement.waistCm && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Cintura</span>
                      <span className="text-foreground">{product.measurement.waistCm} cm</span>
                    </div>
                  )}
                  {product.measurement.hipsCm && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Quadril</span>
                      <span className="text-foreground">{product.measurement.hipsCm} cm</span>
                    </div>
                  )}
                  {product.measurement.lengthCm && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Comprimento</span>
                      <span className="text-foreground">{product.measurement.lengthCm} cm</span>
                    </div>
                  )}
                  {product.measurement.sleeveCm && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Manga</span>
                      <span className="text-foreground">{product.measurement.sleeveCm} cm</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

import React from 'react';
