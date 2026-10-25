import Link from 'next/link';
import { Button } from '@/components/button';
import { User, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-rosé-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-rosé-700 font-serif font-bold text-xl tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-xl tracking-tight">Allves</span>
          </div>
          <h2 className="text-lg font-serif text-rosé-700">Área administrativa</h2>
          <p className="text-xs text-muted-foreground">Acesso restrito à equipe da loja.</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          <ShieldCheck className="mx-auto h-8 w-8 text-rosé-700 mb-4" />
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-rosé-400" />
                E-mail administrativo
              </label>
              <input
                type="email"
                placeholder="admin@mariallves.com.br"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosé-400" />
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Entrar no painel <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Primeiro acesso? Use o token de configuração informado pela responsável.
          </p>
        </div>
      </div>
    </main>
  );
}
