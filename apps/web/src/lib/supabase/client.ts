'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso no navegador (componentes client).
 * Lê a sessão do cookie gravado pelo servidor.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
