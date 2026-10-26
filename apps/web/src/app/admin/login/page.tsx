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
          <Link href="/" className="flex items-center justify-center gap-1 mb-4">
            <span className="text-rosé-700 font-serif font-bold text-xl tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-xl tracking-tight">Allves</span>
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
