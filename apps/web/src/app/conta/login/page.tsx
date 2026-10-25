import Link from 'next/link';
import { Button } from '@/components/button';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <main className="flex-1">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center gap-1 mb-6">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <h2 className="text-2xl font-serif text-rosé-700">Entrar</h2>
          <p className="text-muted-foreground">Acesse sua conta para acompanhar pedidos e endereços.</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-rosé-400" />
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
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
            <div className="flex items-center justify-between">
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="rounded border-rosé-700" />
                <span className="text-muted-foreground">Lembrar de mim</span>
              </label>
              <Link href="/conta/esqueceu-senha" className="text-xs text-rosé-700 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Button type="submit" className="w-full mt-4">
              Entrar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/conta/cadastro" className="text-rosé-700 hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>

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
