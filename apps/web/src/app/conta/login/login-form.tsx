'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/button';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { signInAction, type AuthState } from '../actions';

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    initialError ? { error: initialError } : null
  );

  return (
    <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next ?? '/conta'} />

        {state?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-rosé-400" />
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-rosé-400" />
            Senha
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

        <div className="flex items-center justify-end">
          <Link href="/conta/esqueceu-senha" className="text-xs text-rosé-700 hover:underline">
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
          {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/conta/cadastro" className="text-rosé-700 hover:underline font-medium">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
