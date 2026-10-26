'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mari-allves/db';
import { createClient } from '@/lib/supabase/server';

export type AdminAuthState = { error?: string } | null;

export async function adminSignInAction(
  _prevState: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Informe e-mail e senha.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  // Só entra quem estiver cadastrado em AdminUser e ativo.
  const admin = await prisma.adminUser.findUnique({ where: { userId: data.user.id } });

  if (!admin || !admin.isActive) {
    await supabase.auth.signOut();
    return { error: 'Esta conta não tem acesso ao painel administrativo.' };
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}
