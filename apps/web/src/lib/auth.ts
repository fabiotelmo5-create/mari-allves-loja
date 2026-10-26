import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@mari-allves/db';
import { createClient } from './supabase/server';

/**
 * Usuário autenticado (validado no servidor Supabase, não apenas no cookie).
 * `cache` evita múltiplas chamadas dentro da mesma requisição.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Perfil do usuário. O trigger do banco cria no cadastro; este fallback cobre
 * usuários criados antes do trigger existir.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;

  return prisma.profile.create({
    data: {
      userId: user.id,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      email: user.email ?? null,
      phone: (user.user_metadata?.phone as string | undefined) ?? null,
    },
  });
});

export async function requireUser(nextPath = '/conta') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/conta/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export const getAdminUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.adminUser.findUnique({ where: { userId: user.id } });
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const admin = await prisma.adminUser.findUnique({ where: { userId: user.id } });
  if (!admin || !admin.isActive) redirect('/admin/login?erro=sem-permissao');

  return { user, admin };
}

/** Evita open redirect: só aceita caminhos internos. */
export function safeNextPath(value: string | null | undefined, fallback = '/conta') {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}
