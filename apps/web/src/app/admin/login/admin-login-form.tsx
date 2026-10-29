'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { adminSignInAction, type AdminAuthState } from '@/app/admin/auth-actions';

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState<AdminAuthState, FormData>(
    adminSignInAction,
    initialError ? { error: initialError } : null
  );

  return (
    <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
      <ShieldCheck className="mx-auto h-8 w-8 text-rosé-700 mb-4" />

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-rosé-400" /> E-mail administrativo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@mariallves.com.br"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-rosé-400" /> Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
            required
          />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar no painel'}
          {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Acesso restrito à equipe da loja.
      </p>
    </div>
  );
}