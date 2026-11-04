import Image from 'next/image';
import Link from 'next/link';
import { AdminLoginForm } from './admin-login-form';

export const metadata = { title: 'Painel administrativo — Mari Allves' };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  const initialError =
    erro === 'sem-permissao'
      ? 'Sua conta não tem permissão de administrador.'
      : undefined;

  return (
    <main className="flex-1 flex items-center justify-center bg-rosé-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <Link href="/" className="mb-4 flex items-center justify-center gap-2">
            <Image
              src="/logo-mari-allves.svg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10"
              unoptimized
            />
            <span className="flex flex-col items-start leading-none">
              <span className="flex items-baseline gap-1 font-serif text-xl font-bold tracking-tight">
                <span className="text-rosé-700">Mari</span>
                <span className="text-rosé-400">Allves</span>
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Moda Modesta
              </span>
            </span>
          </Link>
          <h1 className="text-lg font-serif text-rosé-700">Área administrativa</h1>
          <p className="text-xs text-muted-foreground">Acesso restrito à equipe da loja.</p>
        </div>

        <AdminLoginForm initialError={initialError} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">
            ← Voltar para a loja
          </Link>
        </p>
      </div>
    </main>
  );
}
