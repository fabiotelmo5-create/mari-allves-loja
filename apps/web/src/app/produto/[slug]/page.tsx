import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { ProductPurchase } from '@/components/product-purchase';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasPromo = Boolean(
    product.previousPriceCents && product.previousPriceCents > product.priceCents
  );

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

            {/* Seleção de variação, quantidade e ações */}
            <ProductPurchase product={product} />
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
