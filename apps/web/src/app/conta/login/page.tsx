import Link from 'next/link';
import { Button } from '@/components/button';
import { LoginForm } from './login-form';

export const metadata = { title: 'Entrar — Mari Allves' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;

  const initialError =
    erro === 'link-invalido'
      ? 'O link expirou ou já foi usado. Solicite um novo.'
      : undefined;

  return (
    <main className="flex-1">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center gap-1 mb-6">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <h1 className="text-2xl font-serif text-rosé-700">Entrar</h1>
          <p className="text-muted-foreground">
            Acesse sua conta para acompanhar pedidos e endereços.
          </p>
        </div>

        <LoginForm next={next} initialError={initialError} />

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground mb-4">Ou continue como visitante</p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/carrinho">Comprar sem cadastro</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
