import { NextResponse } from 'next/server';
import { prisma } from '@mari-allves/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Diagnóstico leve: informa se as variáveis essenciais estão presentes
 * (nunca expõe os valores) e se o banco responde.
 */
export async function GET() {
  let database: 'ok' | 'error' | 'not_configured' = 'not_configured';

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
    } catch {
      database = 'error';
    }
  }

  return NextResponse.json({
    ok: database !== 'error',
    database,
    databaseUrl: Boolean(process.env.DATABASE_URL),
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
