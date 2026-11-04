import Link from 'next/link';
import { Package, Heart, LogOut, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireUser, getCurrentProfile } from '@/lib/auth';
import { Button } from '@/components/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { signOutAction } from './actions';

export const metadata = { title: 'Minha conta — Mari Allves' };

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const { senha } = await searchParams;
  const user = await requireUser('/conta');
  const profile = await getCurrentProfile();

  const ordersCount = profile
    ? await prisma.order.count({ where: { profileId: profile.id } })
    : 0;

  const firstName = (profile?.fullName ?? user.email ?? '').split(' ')[0];

  const cards = [
    {
      href: '/meus-pedidos',
      icon: Package,
      title: 'Meus pedidos',
      description:
        ordersCount === 0
          ? 'Você ainda não fez pedidos'
          : `${ordersCount} ${ordersCount === 1 ? 'pedido' : 'pedidos'}`,
    },
    {
      href: '/favoritos',
      icon: Heart,
      title: 'Favoritos',
      description: 'Em breve',
    },
  ];

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {senha === 'alterada' && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Senha alterada com sucesso.
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Minha conta</p>
            <h1 className="text-2xl font-serif text-rosé-700">Olá, {firstName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <Link
              href="/conta/esqueceu-senha"
              className="mt-1 inline-block text-xs text-rosé-700 hover:underline"
            >
              Alterar senha
            </Link>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <span>Sair</span>
              <LogOut className="h-4 w-4 shrink-0" />
            </Button>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 hover:border-rosé-300 hover:bg-rosé-50/50 transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rosé-50 text-rosé-700">
                <card.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground">{card.title}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {card.description}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rosé-700" />
            </Link>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Aparência
          </p>
          <ThemeToggle />
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Administração
          </p>
          <Link
            href="/admin/login"
            className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-colors hover:border-rosé-300 hover:bg-rosé-50/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rosé-50 text-rosé-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">Entrar no painel administrativo</span>
              <span className="block text-xs text-muted-foreground">
                Acesso protegido por e-mail e senha de administrador.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rosé-700" />
          </Link>
        </div>

        <div className="mt-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← Continuar comprando</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
