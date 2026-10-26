'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/button';
import { Lock, AlertCircle } from 'lucide-react';
import { updatePasswordAction, type AuthState } from '../actions';

export default function RedefinirSenhaPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePasswordAction,
    null
  );

  return (
    <main className="flex-1">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-1 mb-6">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <h1 className="text-2xl font-serif text-rosé-700">Criar nova senha</h1>
          <p className="text-muted-foreground">Escolha uma senha com pelo menos 8 caracteres.</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosé-400" />
                Nova senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-rosé-400" />
                Repita a nova senha
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar nova senha'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
