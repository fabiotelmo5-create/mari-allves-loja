import Link from 'next/link';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import {
  ALL_ORDER_STATUSES,
  isOrderStatus,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from '@/lib/order-status';

export const metadata = { title: 'Pedidos — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const filter = status && isOrderStatus(status) ? status : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      items: { select: { quantity: true } },
      profile: { select: { fullName: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-serif text-rosé-700">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedido(s){filter ? ` com status "${ORDER_STATUS_LABELS[filter]}"` : ''}.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !filter
              ? 'bg-rosé-700 text-white'
              : 'bg-white text-muted-foreground hover:bg-rosé-50'
          }`}
        >
          Todos
        </Link>
        {ALL_ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/pedidos?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === value
                ? 'bg-rosé-700 text-white'
                : 'bg-white text-muted-foreground hover:bg-rosé-50'
            }`}
          >
            {ORDER_STATUS_LABELS[value]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-white py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-gray-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const statusValue = order.status as OrderStatusValue;
                const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
                const customerName =
                  order.guestName ?? order.profile?.fullName ?? 'Cliente';
                const customerEmail =
                  order.guestEmail ?? order.profile?.email ?? '—';

                return (
                  <tr key={order.id} className="hover:bg-rosé-50/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.code}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{customerName}</p>
                      <p className="text-xs text-muted-foreground">{customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{itemCount}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.totalCents)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          ORDER_STATUS_BADGE_CLASSES[statusValue] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[statusValue] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rosé-700 hover:underline"
                      >
                        Ver <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
