import { Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

export default async function AdminDashboardPage() {
  // Guard também na página (não só no layout): evita consultas durante o
  // prerender do build e garante a checagem em cada navegação.
  await requireAdmin();

  const [products, published, orders, pendingOrders, customers, stocks, recentOrders, revenue] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLICADO' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'AGUARDANDO_PAGAMENTO' } }),
      prisma.profile.count(),
      prisma.stock.findMany({ select: { quantity: true, lowStockThreshold: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          code: true,
          status: true,
          totalCents: true,
          createdAt: true,
          guestName: true,
          profile: { select: { fullName: true } },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalCents: true },
        where: { status: { in: ['PAGAMENTO_CONFIRMADO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE'] } },
      }),
    ]);

  const lowStock = stocks.filter((s) => s.quantity <= s.lowStockThreshold).length;

  const cards = [
    {
      label: 'Produtos',
      value: products,
      hint: `${published} publicado(s)`,
      icon: Package,
    },
    {
      label: 'Pedidos',
      value: orders,
      hint: `${pendingOrders} aguardando pagamento`,
      icon: ShoppingCart,
    },
    {
      label: 'Clientes',
      value: customers,
      hint: 'contas cadastradas',
      icon: Users,
    },
    {
      label: 'Estoque baixo',
      value: lowStock,
      hint: 'variações no limite',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-serif text-rosé-700">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Resumo da loja em tempo real.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-rosé-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Últimos pedidos</h2>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum pedido ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{order.code}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.profile?.fullName ?? order.guestName ?? 'Visitante'} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{formatPrice(order.totalCents)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {order.status.replaceAll('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Faturamento confirmado</h2>
          <p className="text-2xl font-semibold text-rosé-700">
            {formatPrice(revenue._sum.totalCents ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            Pedidos com pagamento confirmado ou já enviados.
          </p>

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium text-foreground">Próximos passos</p>
            <div className="flex items-center justify-between rounded-lg bg-rosé-50 px-3 py-2 text-xs text-rosé-700">
              Cadastrar produtos
              <span className="text-[9px] uppercase tracking-wide">em breve</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              O cadastro de produtos entra na próxima entrega do painel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
