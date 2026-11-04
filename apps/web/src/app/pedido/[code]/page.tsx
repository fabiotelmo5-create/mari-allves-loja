import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { getCurrentProfile } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando pagamento',
    className: 'bg-amber-50 text-amber-700',
    icon: Clock,
  },
  PAGAMENTO_CONFIRMADO: {
    label: 'Pagamento confirmado',
    className: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  EM_PREPARACAO: {
    label: 'Em preparação',
    className: 'bg-blue-50 text-blue-700',
    icon: Package,
  },
  ENVIADO: {
    label: 'Enviado',
    className: 'bg-indigo-50 text-indigo-700',
    icon: Truck,
  },
  ENTREGUE: {
    label: 'Entregue',
    className: 'bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  CANCELADO: {
    label: 'Cancelado',
    className: 'bg-red-50 text-red-700',
    icon: XCircle,
  },
  REEMBOLSADO: {
    label: 'Reembolsado',
    className: 'bg-gray-100 text-gray-600',
    icon: XCircle,
  },
};

type AddressSnapshot = {
  recipient?: string;
  email?: string;
  phone?: string;
  zip?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  district?: string;
  city?: string;
  state?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}

function maskName(name: string | null | undefined) {
  if (!name) return 'Cliente';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

function maskEmail(email: string | null | undefined) {
  if (!email) return '—';
  const [name, domain] = email.split('@');
  if (!domain) return '—';
  return `${name.slice(0, 1)}***@${domain}`;
}

function maskPhone(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 4) return '—';
  return `(**) *****-${digits.slice(-4)}`;
}

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      items: true,
      statusHistory: { orderBy: { changedAt: 'asc' } },
      shipment: true,
      profile: { select: { id: true, fullName: true, email: true, phone: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!order) notFound();

  const profile = await getCurrentProfile();
  const isOwner = Boolean(profile && order.profileId === profile.id);
  const address = (order.addressSnapshot ?? {}) as unknown as AddressSnapshot;
  const status = STATUS[order.status] ?? STATUS.AGUARDANDO_PAGAMENTO;
  const StatusIcon = status.icon;
  const payment = order.payments[0];
  const paymentStatus = payment?.status ?? 'PENDENTE';

  const paymentTitle =
    paymentStatus === 'APROVADO'
      ? 'Pagamento confirmado.'
      : paymentStatus === 'CANCELADO'
        ? 'Pagamento cancelado.'
        : paymentStatus === 'REEMBOLSADO'
          ? 'Pagamento reembolsado.'
          : paymentStatus === 'RECUSADO'
            ? 'Pagamento recusado.'
            : paymentStatus === 'EXPIRADO'
              ? 'Pagamento expirado.'
              : 'Pagamento a combinar com a loja.';

  const paymentDetail =
    paymentStatus === 'APROVADO' && payment
      ? `Confirmado em ${formatDate(payment.updatedAt)}.`
      : paymentStatus === 'CANCELADO'
        ? 'Este pedido foi cancelado.'
        : paymentStatus === 'REEMBOLSADO'
          ? 'O valor foi devolvido conforme combinado com a loja.'
          : paymentStatus === 'RECUSADO'
            ? 'A loja entrará em contato para orientar uma nova tentativa.'
            : paymentStatus === 'EXPIRADO'
              ? 'A loja entrará em contato para combinar uma nova forma de pagamento.'
              : 'A loja entra em contato pelo e-mail ou telefone informado para combinar a forma de pagamento.';

  const displayName = order.guestName ?? order.profile?.fullName ?? address.recipient;
  const displayEmail = order.guestEmail ?? order.profile?.email ?? address.email;
  const displayPhone = order.guestPhone ?? order.profile?.phone ?? address.phone;

  const customerName = isOwner ? displayName ?? 'Cliente' : maskName(displayName);
  const customerEmail = isOwner ? displayEmail ?? '—' : maskEmail(displayEmail);
  const customerPhone = isOwner ? displayPhone ?? '—' : maskPhone(displayPhone);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Pedido {order.code}</span>
        </nav>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif text-rosé-700">Pedido {order.code}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Realizado em {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.className}`}
          >
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </span>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Itens do pedido</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.size, item.color].filter(Boolean).join(' / ') || '—'} ·{' '}
                      {item.quantity} un.
                      {item.sku ? ` · SKU ${item.sku}` : ''}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatPrice(item.totalCents)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.unitPriceCents)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>
                  {order.shippingCents === 0 ? 'Grátis' : formatPrice(order.shippingCents)}
                </span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto</span>
                  <span>- {formatPrice(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-rosé-700">{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-rosé-700">
              <MapPin className="h-4 w-4" /> Entrega
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{customerName}</p>
              <p className="text-muted-foreground">{customerEmail}</p>
              <p className="text-muted-foreground">{customerPhone}</p>
              {isOwner ? (
                <p className="pt-2 text-muted-foreground">
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ''}
                  <br />
                  {address.district} · {address.city}/{address.state}
                  <br />
                  CEP {address.zip}
                </p>
              ) : (
                <p className="pt-2 text-muted-foreground">
                  {address.city}/{address.state} · CEP {address.zip?.slice(0, 5)}-***
                </p>
              )}
              <p className="pt-2 text-muted-foreground">
                {order.shippingMethod ?? 'Entrega a combinar'}
                {order.shippingDays ? ` · até ${order.shippingDays} dia(s) útil(eis)` : ''}
              </p>
              {order.shipment?.trackingCode && (
                <p className="pt-2">
                  <span className="text-muted-foreground">Rastreio:</span>{' '}
                  <span className="font-medium">{order.shipment.trackingCode}</span>
                  {order.shipment.carrier ? ` (${order.shipment.carrier})` : ''}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Pagamento</h2>
            <p className="text-sm">{paymentTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{paymentDetail}</p>
          </section>

          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Histórico do pedido</h2>
            <ol className="space-y-4">
              {order.statusHistory.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rosé-400" />
                  <div>
                    <p className="text-sm font-medium">
                      {STATUS[entry.toStatus]?.label ?? entry.toStatus}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.changedAt)}</p>
                    {entry.note && (
                      <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {!isOwner && (
            <p className="rounded-xl border border-rosé-200 bg-rosé-50/60 p-4 text-sm text-muted-foreground">
              Para ver os dados completos deste pedido,{' '}
              <Link
                href={`/conta/login?next=${encodeURIComponent(`/pedido/${order.code}`)}`}
                className="font-medium text-rosé-700 underline"
              >
                entre na conta usada na compra
              </Link>
              .
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="text-sm font-medium text-rosé-700 hover:underline"
            >
              ← Continuar comprando
            </Link>
            {isOwner && (
              <Link
                href="/meus-pedidos"
                className="text-sm font-medium text-rosé-700 hover:underline"
              >
                Ver todos os meus pedidos
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
