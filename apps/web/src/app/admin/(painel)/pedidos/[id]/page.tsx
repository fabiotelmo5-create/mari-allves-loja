import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import {
  nextStatuses,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from '@/lib/order-status';
import { OrderStatusForm, ShipmentForm } from '../order-forms';

export const metadata = { title: 'Detalhe do pedido — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      profile: { select: { fullName: true, email: true, phone: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      shipment: true,
    },
  });

  if (!order) notFound();

  const address = (order.addressSnapshot ?? {}) as unknown as AddressSnapshot;
  const status = order.status as OrderStatusValue;
  const allowed = nextStatuses(order.status);
  const customerName = order.guestName ?? order.profile?.fullName ?? address.recipient ?? 'Cliente';
  const customerEmail = order.guestEmail ?? order.profile?.email ?? address.email ?? '—';
  const customerPhone = order.guestPhone ?? order.profile?.phone ?? address.phone ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-rosé-700"
        >
          <ArrowLeft className="h-4 w-4" /> Pedidos
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-serif text-rosé-700">Pedido {order.code}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)} · {customerName}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              ORDER_STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {ORDER_STATUS_LABELS[status] ?? order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Itens</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
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
                <span>{formatPrice(order.shippingCents)}</span>
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

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-rosé-700">
              <MapPin className="h-4 w-4" /> Entrega
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{customerName}</p>
              <p className="text-muted-foreground">{customerEmail}</p>
              <p className="text-muted-foreground">{customerPhone}</p>
              <p className="pt-2 text-muted-foreground">
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ''}
                <br />
                {address.district} · {address.city}/{address.state}
                <br />
                CEP {address.zip}
              </p>
              <p className="pt-2 text-muted-foreground">
                {order.shippingMethod ?? 'Entrega a combinar'}
                {order.shippingDays ? ` · até ${order.shippingDays} dia(s) útil(eis)` : ''}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Pagamento</h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">
                        {payment.provider === 'manual' ? 'Manual' : payment.provider} ·{' '}
                        {payment.method === 'a_combinar'
                          ? 'A combinar'
                          : payment.method ?? '—'}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPrice(payment.amountCents)} · criado em {formatDate(payment.createdAt)}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Pagamento manual: confirme o recebimento antes de marcar o pedido como pago.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Histórico</h2>
            <ol className="space-y-4">
              {order.statusHistory.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rosé-400" />
                  <div>
                    <p className="text-sm font-medium">
                      {entry.fromStatus
                        ? `${ORDER_STATUS_LABELS[entry.fromStatus]} → `
                        : ''}
                      {ORDER_STATUS_LABELS[entry.toStatus] ?? entry.toStatus}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.changedAt)} ·{' '}
                      {entry.changedBy === 'system' ? 'Sistema' : 'Equipe'}
                    </p>
                    {entry.note && (
                      <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-rosé-700">Atualizar status</h2>
            <OrderStatusForm key={order.status} orderId={order.id} allowed={allowed} />
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-rosé-700">
              <Truck className="h-4 w-4" /> Envio
            </h2>
            <ShipmentForm
              orderId={order.id}
              carrier={order.shipment?.carrier ?? null}
              trackingCode={order.shipment?.trackingCode ?? null}
            />
            {order.shipment?.shippedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Enviado em {formatDate(order.shipment.shippedAt)}.
              </p>
            )}
            {order.shipment?.deliveredAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Entregue em {formatDate(order.shipment.deliveredAt)}.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-rosé-700">Cliente</h2>
            <p className="text-sm">{customerName}</p>
            <p className="text-xs text-muted-foreground">{customerEmail}</p>
            <p className="text-xs text-muted-foreground">{customerPhone}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {order.profileId ? 'Conta vinculada ao pedido.' : 'Compra como visitante.'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
