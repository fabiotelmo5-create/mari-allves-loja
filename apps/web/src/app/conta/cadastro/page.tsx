import Link from 'next/link';
import { Button } from '@/components/button';
import { User, Mail, Lock, Phone } from 'lucide-react';

export default function CadastroPage() {
  return (
    <main className="flex-1">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center gap-1 mb-6">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <h2 className="text-2xl font-serif text-rosé-700">Criar conta</h2>
          <p className="text-muted-foreground">Preencha seus dados para criar seu cadastro.</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-rosé-400" />
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Maria da Silva"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                required
              />
            </div>
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
                <Phone className="h-4 w-4 text-rosé-400" />
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(77) 9 9999-9999"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
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
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="termos"
                className="mt-0.5 rounded border-rosé-700"
                required
              />
              <label htmlFor="termos" className="text-xs text-muted-foreground leading-none">
                Concordo com os <Link href="/termos" className="text-rosé-700 hover:underline">termos de uso</Link> e
                <Link href="/privacidade" className="text-rosé-700 hover:underline">política de privacidade</Link>
              </label>
            </div>
            <Button type="submit" className="w-full mt-4">Criar conta</Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/conta/login" className="text-rosé-700 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
