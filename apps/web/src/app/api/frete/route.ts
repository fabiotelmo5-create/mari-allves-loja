import { NextResponse } from 'next/server';
import { prisma } from '@mari-allves/db';
import { cepMatches, onlyDigits } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = onlyDigits(searchParams.get('cep') ?? '');

  if (cep.length !== 8) {
    return NextResponse.json(
      { available: false, message: 'Informe um CEP válido com 8 dígitos.' },
      { status: 400 }
    );
  }

  const [zones, address] = await Promise.all([
    prisma.shippingZone.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
    }),
    lookupAddress(cep),
  ]);

  const zone = zones.find((item) => cepMatches(cep, item.zipRanges));

  if (!zone) {
    return NextResponse.json({
      available: false,
      address,
      message:
        'Ainda não entregamos nesse CEP. Fale com a loja para combinarmos a entrega.',
    });
  }

  return NextResponse.json({
    available: true,
    address,
    zone: {
      id: zone.id,
      name: zone.name,
      priceCents: zone.priceCents,
      shippingDays: zone.shippingDays,
      freeShippingMinSubtotalCents: zone.freeShippingMinSubtotalCents,
    },
  });
}

async function lookupAddress(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;

    return {
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    // O ViaCEP é opcional: o frete continua sendo calculado pela faixa de CEP.
    return null;
  }
}
