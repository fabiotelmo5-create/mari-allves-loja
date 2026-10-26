import Link from 'next/link';
import { CadastroForm } from './cadastro-form';

export const metadata = { title: 'Criar conta — Mari Allves' };

export default function CadastroPage() {
  return (
    <main className="flex-1">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center gap-1 mb-6">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <h1 className="text-2xl font-serif text-rosé-700">Criar conta</h1>
          <p className="text-muted-foreground">Preencha seus dados para criar seu cadastro.</p>
        </div>

        <CadastroForm />
      </div>
    </main>
  );
}
