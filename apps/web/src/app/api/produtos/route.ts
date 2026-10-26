import { NextRequest, NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/**
 * GET /api/produtos?slugs=slug-a,slug-b
 * Usado pelo carrinho (client component) para resolver os produtos do banco.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('slugs') ?? '';
  const slugs = raw
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (slugs.length === 0) {
    return NextResponse.json([]);
  }

  const products = await getProductsBySlugs(slugs);
  return NextResponse.json(products);
}
