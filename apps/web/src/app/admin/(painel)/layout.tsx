import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Ticket,
  LogOut,
  Store,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { signOutAction } from '@/app/conta/actions';
import { Button } from '@/components/button';

export const metadata = { title: 'Painel — Mari Allves' };

const NAV = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, ready: true },
  { href: '/admin/produtos', label: 'Produtos', icon: Package, ready: false },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, ready: false },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes, ready: false },
  { href: '/admin/clientes', label: 'Clientes', icon: Users, ready: false },
  { href: '/admin/cupons', label: 'Cupons', icon: Ticket, ready: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, admin } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-border bg-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1">
              <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
              <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
            </Link>
            <span className="rounded-full bg-rosé-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rosé-700">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {admin.fullName} · {admin.role}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" target="_blank">
                <Store className="h-4 w-4" /> Ver loja
              </Link>
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-white lg:block">
          <nav className="space-y-1 p-3">
            {NAV.map((item) =>
              item.ready ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-rosé-50 hover:text-rosé-700"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                  title="Disponível em breve"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto text-[9px] uppercase tracking-wide">breve</span>
                </span>
              )
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
