'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/button';
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signUpAction, type AuthState } from '../actions';

export function CadastroForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUpAction, null);

  if (state?.message) {
    return (
      <div className="bg-white p-8 rounded-xl border border-border shadow-sm text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-rosé-700 mb-4" />
        <h2 className="text-lg font-serif text-rosé-700 mb-2">Confirme seu e-mail</h2>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Não recebeu? Verifique a caixa de spam ou{' '}
          <Link href="/conta/login" className="text-rosé-700 hover:underline">
            tente entrar
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-rosé-400" />
            Nome completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Maria da Silva"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
            required
          />
        </div>

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
          <label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-rosé-400" />
            Telefone <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(77) 9 9999-9999"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
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
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            className="mt-0.5 rounded border-rosé-700"
            required
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug">
            Concordo com os{' '}
            <Link href="/termos" className="text-rosé-700 hover:underline">
              termos de uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacidade" className="text-rosé-700 hover:underline">
              política de privacidade
            </Link>
            .
          </label>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={pending}>
          {pending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/conta/login" className="text-rosé-700 hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
