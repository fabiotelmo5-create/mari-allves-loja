'use client';

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Lock, MapPin, ShieldCheck, Truck, User } from 'lucide-react';
import { Button } from '@/components/button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';
import { createOrderAction } from './actions';

type CartItem = {
  productSlug: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
};

type ProfilePrefill = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
} | null;

type ShippingQuote = {
  available: true;
  address: {
    street: string;
    district: string;
    city: string;
    state: string;
  } | null;
  zone: {
    id: string;
    name: string;
    priceCents: number;
    shippingDays: number;
    freeShippingMinSubtotalCents: number | null;
  };
};

type ShippingResponse =
  | ShippingQuote
  | {
      available: false;
      message: string;
      address?: ShippingQuote['address'];
    };

const CART_KEY = 'ma_cart';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function CheckoutForm({ profile }: { profile: ProfilePrefill }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const idempotencyRef = useRef<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const stored = readCart();
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
      })
      .catch(() => {
        /* o resumo mostra o aviso de indisponibilidade */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolved = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = products[item.productSlug];
        const variant = product?.variants.find((v) => v.id === item.variantId);
        if (!product || !variant) return [];

        const unitPriceCents = variant.priceCents ?? product.priceCents;

        return [
          {
            cart: item,
            product,
            variant,
            unitPriceCents,
            totalCents: unitPriceCents * item.quantity,
            available: variant.stockQuantity,
          },
        ];
      }),
    [cart, products]
  );

  const subtotalCents = resolved.reduce((total, item) => total + item.totalCents, 0);
  const shippingCents =
    quote &&
    quote.zone.freeShippingMinSubtotalCents !== null &&
    subtotalCents >= quote.zone.freeShippingMinSubtotalCents
      ? 0
      : quote?.zone.priceCents ?? 0;
  const totalCents = subtotalCents + shippingCents;

  const missingItems = cart.length - resolved.length;
  const stockIssue = resolved.some(
    (item) => !item.variant.active || item.available < item.cart.quantity
  );
  const canSubmit =
    !loading &&
    cart.length > 0 &&
    missingItems === 0 &&
    !stockIssue &&
    quote !== null &&
    !pending;

  function fillAddress(address: ShippingQuote['address']) {
    if (!address || !formRef.current) return;

    const fields: Array<[string, string]> = [
      ['street', address.street],
      ['district', address.district],
      ['city', address.city],
      ['state', address.state],
    ];

    for (const [name, value] of fields) {
      const field = formRef.current.elements.namedItem(name);
      if (field instanceof HTMLInputElement && !field.value && value) {
        field.value = value;
      }
    }
  }

  async function calculateShipping() {
    const cep = onlyDigits(cepRef.current?.value ?? '');
    setQuote(null);
    setQuoteError(null);

    if (cep.length !== 8) {
      setQuoteError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setQuotePending(true);

    try {
      const response = await fetch(`/api/frete?cep=${cep}`);
      const data = (await response.json()) as ShippingResponse;

      if (!data.available) {
        setQuoteError(data.message);
        return;
      }

      setQuote(data);
      fillAddress(data.address);
    } catch {
      setQuoteError('Não foi possível calcular o frete agora. Tente novamente.');
    } finally {
      setQuotePending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!quote) {
      setError('Calcule o frete antes de finalizar o pedido.');
      return;
    }
    if (missingItems > 0) {
      setError('Um dos itens não está mais disponível. Volte ao carrinho e atualize.');
      return;
    }
    if (stockIssue) {
      setError('A quantidade de um item ultrapassou o estoque. Ajuste no carrinho.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set(
      'items',
      JSON.stringify(cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })))
    );
    formData.set('shippingZoneId', quote.zone.id);
    formData.set('expectedSubtotalCents', String(subtotalCents));
    formData.set('expectedShippingCents', String(shippingCents));
    formData.set('idempotencyKey', (idempotencyRef.current ??= crypto.randomUUID()));

    startTransition(async () => {
      const result = await createOrderAction(null, formData);

      if (result?.orderCode) {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new Event('ma_cart_updated'));
        router.push(`/pedido/${result.orderCode}`);
        return;
      }

      setError(result?.error ?? 'Não foi possível finalizar o pedido. Tente novamente.');
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-20 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando seu carrinho…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white py-20 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Button asChild className="mt-6">
          <Link href="/catalogo">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-rosé-700" />
            <h2 className="text-sm font-semibold text-rosé-700">Seus dados</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Nome completo <span className="text-rosé-600">*</span>
              <input
                name="customerName"
                defaultValue={profile?.fullName ?? ''}
                required
                minLength={3}
                autoComplete="name"
                className="input"
              />
            </label>
            <label className="text-sm">
              E-mail <span className="text-rosé-600">*</span>
              <input
                name="customerEmail"
                type="email"
                defaultValue={profile?.email ?? ''}
                required
                autoComplete="email"
                className="input"
              />
            </label>
            <label className="text-sm">
              Telefone / WhatsApp <span className="text-rosé-600">*</span>
              <input
                name="customerPhone"
                type="tel"
                defaultValue={profile?.phone ?? ''}
                required
                autoComplete="tel"
                placeholder="(77) 99999-9999"
                className="input"
              />
            </label>
          </div>
          {profile?.email && (
            <p className="mt-3 text-xs text-muted-foreground">
              Você está comprando com a conta {profile.email}.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rosé-700" />
            <h2 className="text-sm font-semibold text-rosé-700">Entrega</h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex-1 text-sm">
              CEP <span className="text-rosé-600">*</span>
              <input
                ref={cepRef}
                name="zip"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="47800-000"
                maxLength={9}
                onChange={() => {
                  setQuote(null);
                  setQuoteError(null);
                }}
                className="input"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={calculateShipping}
              disabled={quotePending}
              className="mt-1 self-end"
            >
              {quotePending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular frete'}
            </Button>
          </div>

          {quoteError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {quoteError}
            </p>
          )}

          {quote && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-rosé-200 bg-rosé-50/60 p-4">
              <Truck className="mt-0.5 h-4 w-4 text-rosé-700" />
              <div className="text-sm">
                <p className="font-medium text-rosé-700">{quote.zone.name}</p>
                <p className="text-muted-foreground">
                  {shippingCents === 0 ? 'Frete grátis' : formatPrice(shippingCents)} · até{' '}
                  {quote.zone.shippingDays} dia(s) útil(eis)
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Rua / avenida <span className="text-rosé-600">*</span>
              <input name="street" required minLength={3} autoComplete="address-line1" className="input" />
            </label>
            <label className="text-sm">
              Número <span className="text-rosé-600">*</span>
              <input name="number" required autoComplete="address-line2" className="input" />
            </label>
            <label className="text-sm">
              Complemento
              <input name="complement" autoComplete="address-line3" className="input" />
            </label>
            <label className="text-sm">
              Bairro <span className="text-rosé-600">*</span>
              <input name="district" required minLength={2} className="input" />
            </label>
            <label className="text-sm">
              Cidade <span className="text-rosé-600">*</span>
              <input name="city" required minLength={2} autoComplete="address-level2" className="input" />
            </label>
            <label className="text-sm">
              Estado (UF) <span className="text-rosé-600">*</span>
              <input
                name="state"
                required
                minLength={2}
                maxLength={2}
                autoComplete="address-level1"
                className="input uppercase"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rosé-700" />
            <h2 className="text-sm font-semibold text-rosé-700">Pagamento</h2>
          </div>
          <div className="rounded-lg border border-rosé-200 bg-rosé-50/60 p-4">
            <p className="text-sm font-medium text-rosé-700">Pagamento a combinar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Após o pedido, a loja entra em contato pelo e-mail ou telefone informado para
              combinar a forma de pagamento e confirmar a entrega.
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            O estoque dos itens é separado assim que você finaliza o pedido. Se o pagamento não
            for combinado, o pedido pode ser cancelado e os itens voltam ao estoque.
          </p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-rosé-700">Resumo do pedido</h2>

          <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {resolved.map((item) => (
              <div key={item.cart.variantId} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-rosé-50">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant.size} / {item.variant.color} · {item.cart.quantity} un.
                  </p>
                  <p className="mt-1 font-medium">{formatPrice(item.totalCents)}</p>
                </div>
              </div>
            ))}
          </div>

          {missingItems > 0 && (
            <p className="mt-4 text-xs text-red-600">
              Um item do carrinho não está mais disponível.{' '}
              <Link href="/carrinho" className="underline">
                Revisar carrinho
              </Link>
            </p>
          )}
          {stockIssue && (
            <p className="mt-4 text-xs text-red-600">
              A quantidade de um item ultrapassou o estoque.{' '}
              <Link href="/carrinho" className="underline">
                Revisar carrinho
              </Link>
            </p>
          )}

          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{quote ? (shippingCents === 0 ? 'Grátis' : formatPrice(shippingCents)) : 'A calcular'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-rosé-700">{formatPrice(totalCents)}</span>
            </div>
          </div>

          <label className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="terms" required className="mt-0.5" />
            <span>
              Li e aceito os{' '}
              <Link href="/termos" className="underline hover:text-rosé-700">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacidade" className="underline hover:text-rosé-700">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={!canSubmit} className="mt-5 w-full">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizando…
              </>
            ) : (
              'Finalizar pedido'
            )}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Seus dados são usados apenas para este pedido.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 text-xs text-muted-foreground">
          <p>
            Você pode desistir da compra em até 7 dias após o recebimento, conforme o art. 49 do
            Código de Defesa do Consumidor.
          </p>
        </div>

        <Button variant="ghost" asChild className="w-full">
          <Link href="/carrinho">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar ao carrinho
          </Link>
        </Button>
      </aside>
    </form>
  );
}
