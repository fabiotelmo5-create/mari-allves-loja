'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/button';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { requestPasswordResetAction, type AuthState } from '../actions';

export default function EsqueceuSenhaPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
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
          <h1 className="text-2xl font-serif text-rosé-700">Recuperar senha</h1>
          <p className="text-muted-foreground">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          {state?.message ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-rosé-700 mb-4" />
              <p className="text-sm text-muted-foreground">{state.message}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
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

              <Button type="submit" className="w-full mt-4" disabled={pending}>
                {pending ? 'Enviando…' : 'Enviar link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/conta/login"
              className="inline-flex items-center gap-1 text-xs text-rosé-700 hover:underline"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
