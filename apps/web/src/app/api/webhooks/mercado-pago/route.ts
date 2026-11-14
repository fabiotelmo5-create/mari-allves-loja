import { NextRequest, NextResponse } from 'next/server';
import { applyMercadoPagoPayment } from '@/lib/payments/apply';
import { getPaymentConfig } from '@/lib/payments/config';
import {
  getMercadoPagoPayment,
  MercadoPagoApiError,
  verifyMercadoPagoSignature,
} from '@/lib/payments/mercado-pago';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

type WebhookBody = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
};

function readBody(value: unknown): WebhookBody | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as WebhookBody)
    : null;
}

/**
 * POST /api/webhooks/mercado-pago
 *
 * O Mercado Pago chama esta rota após mudanças de pagamento. A assinatura é
 * validada antes de qualquer consulta e o status do pedido só muda depois de
 * consultar o pagamento diretamente na API do provedor.
 */
export async function POST(request: NextRequest) {
  const config = getPaymentConfig();

  if (
    !config.mercadoPago.accessToken ||
    !config.mercadoPago.webhookSecret
  ) {
    return NextResponse.json(
      { error: 'payment_provider_not_configured' },
      { status: 503 }
    );
  }

  let body: WebhookBody | null = null;
  try {
    body = readBody(await request.json());
  } catch {
    body = null;
  }

  const searchParams = request.nextUrl.searchParams;
  const dataId =
    searchParams.get('data.id') ??
    searchParams.get('id') ??
    (body?.data?.id !== undefined ? String(body.data.id) : '');
  const type =
    searchParams.get('type') ??
    searchParams.get('topic') ??
    body?.type ??
    body?.topic ??
    '';

  if (!dataId) {
    return NextResponse.json({ error: 'missing_data_id' }, { status: 400 });
  }

  const validSignature = verifyMercadoPagoSignature({
    signature: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'),
    dataId,
    secret: config.mercadoPago.webhookSecret,
  });

  if (!validSignature) {
    console.warn('[mercado-pago] webhook com assinatura inválida:', dataId);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  // Outros tópicos (ex.: merchant_order) não alteram o pagamento diretamente.
  if (type !== 'payment') {
    return NextResponse.json({ received: true, ignored: type || 'unknown' });
  }

  try {
    const payment = await getMercadoPagoPayment(
      dataId,
      config.mercadoPago.accessToken
    );

    const result = await applyMercadoPagoPayment({
      payment,
      eventId: body?.id !== undefined ? `mp-notification:${body.id}` : null,
      source: 'webhook',
    });

    if (!result.ok && result.reason === 'database_error') {
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({
      received: true,
      duplicate: result.ok ? result.duplicate : false,
      order: result.ok ? result.orderCode : null,
      paymentStatus: result.ok ? result.paymentStatus : null,
      ignoredReason: result.ok ? null : result.reason,
    });
  } catch (error) {
    if (error instanceof MercadoPagoApiError && error.status === 404) {
      console.warn('[mercado-pago] pagamento não encontrado no provedor:', dataId);
      return NextResponse.json({ received: true, ignored: 'payment_not_found' });
    }

    console.error('[mercado-pago] erro ao processar webhook:', error);
    return NextResponse.json({ error: 'webhook_processing_failed' }, { status: 500 });
  }
}
