'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth';

export type AuthState = { error?: string; message?: string } | null;

/** Traduz mensagens do Supabase Auth para pt-BR. */
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
    'User already registered': 'Este e-mail já está cadastrado. Tente entrar.',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
    'New password should be different from the old password':
      'A nova senha precisa ser diferente da senha atual.',
    'Auth session missing!': 'Sessão expirada. Solicite um novo link.',
  };

  return map[message] ?? 'Não foi possível concluir. Tente novamente.';
}

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  return `${protocol}://${host}`;
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNextPath(String(formData.get('next') ?? ''), '/conta');

  if (!email || !password) {
    return { error: 'Informe e-mail e senha.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translateAuthError(error.message) };

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const acceptedTerms = formData.get('terms');

  if (fullName.length < 3) return { error: 'Informe seu nome completo.' };
  if (!email) return { error: 'Informe seu e-mail.' };
  if (password.length < 8) return { error: 'A senha precisa ter pelo menos 8 caracteres.' };
  if (!acceptedTerms) return { error: 'É necessário aceitar os termos de uso.' };

  const origin = await getOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${origin}/auth/callback?next=/conta`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  // Confirmação de e-mail desativada no projeto: já entra direto.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/conta');
  }

  return {
    message:
      'Cadastro criado! Enviamos um link de confirmação para o seu e-mail. ' +
      'Confirme para ativar a conta.',
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordResetAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { error: 'Informe seu e-mail.' };

  const origin = await getOrigin();
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/conta/redefinir-senha`,
  });

  // Resposta idêntica exista ou não a conta (evita descobrir e-mails cadastrados).
  return {
    message:
      'Se este e-mail estiver cadastrado, enviaremos um link para redefinir a senha. ' +
      'Verifique também a caixa de spam.',
  };
}

export async function updatePasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'A senha precisa ter pelo menos 8 caracteres.' };
  if (password !== confirm) return { error: 'As senhas não conferem.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sessão expirada. Solicite um novo link de redefinição.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };

  revalidatePath('/', 'layout');
  redirect('/conta?senha=alterada');
}
