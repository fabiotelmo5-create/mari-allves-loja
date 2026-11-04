import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { getCurrentProfile, requireUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from '@/lib/order-status';

export const metadata = { title: 'Meus pedidos — Mari Allves' };
export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}

export default async function MeusPedidosPage() {
  await requireUser('/meus-pedidos');
  const profile = await getCurrentProfile();

  const orders = profile
    ? await prisma.order.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { quantity: true } } },
      })
    : [];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <Link href="/conta" className="hover:text-rosé-700">
            Minha conta
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Meus pedidos</span>
        </nav>

        <h1 className="mb-8 text-3xl font-serif text-rosé-700">Meus pedidos</h1>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-white py-20 text-center text-muted-foreground">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p>Você ainda não tem pedidos cadastrados.</p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block font-medium text-rosé-700 hover:underline"
            >
              Começar a comprar →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = order.status as OrderStatusValue;
              const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

              return (
                <Link
                  key={order.id}
                  href={`/pedido/${order.code}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-5 transition-colors hover:border-rosé-300"
                >
                  <div className="min-w-0">
                    <p className="font-medium">Pedido {order.code}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {itemCount} item(ns) ·{' '}
                      {formatPrice(order.totalCents)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        ORDER_STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status] ?? order.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
