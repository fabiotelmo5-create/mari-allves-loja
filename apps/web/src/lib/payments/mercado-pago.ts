import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { PaymentStatus } from '@mari-allves/db';

// Permite apontar para um mock local em testes. Em produção, deixe vazio.
const API_BASE = (
  process.env.MERCADO_PAGO_API_BASE?.trim() || 'https://api.mercadopago.com'
).replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15_000;

export class MercadoPagoApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'MercadoPagoApiError';
  }
}

type PreferenceItemInput = {
  id: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
};

export type CreateMercadoPagoPreferenceInput = {
  orderCode: string;
  orderId: string;
  items: PreferenceItemInput[];
  shippingTitle: string | null;
  shippingCents: number;
  payer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  appUrl: string;
  accessToken: string;
  sandbox: boolean;
};

export type MercadoPagoPreferenceResult = {
  preferenceId: string;
  checkoutUrl: string;
  raw: {
    preference_id: string;
    init_point: string | null;
    sandbox_init_point: string | null;
    expiration_date_to: string | null;
  };
};

export type MercadoPagoPaymentData = {
  id: string;
  status: string;
  statusDetail: string | null;
  externalReference: string | null;
  preferenceId: string | null;
  method: string | null;
  amountCents: number | null;
  dateApproved: string | null;
  dateLastUpdated: string | null;
  raw: {
    id: string;
    status: string;
    status_detail: string | null;
    external_reference: string | null;
    preference_id: string | null;
    payment_type_id: string | null;
    payment_method_id: string | null;
    transaction_amount: number | null;
    date_approved: string | null;
    date_last_updated: string | null;
  };
};

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function safeErrorMessage(body: unknown) {
  const object = asObject(body);
  const message = asString(object?.message) ?? asString(object?.error);
  return message?.slice(0, 300) ?? 'Erro retornado pelo Mercado Pago.';
}

async function mercadoPagoFetch(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error('[mercado-pago] falha de rede:', error instanceof Error ? error.message : error);
    throw new MercadoPagoApiError(503, 'Não foi possível conectar ao Mercado Pago.');
  }

  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message = safeErrorMessage(body);
    console.error('[mercado-pago] erro da API:', response.status, message);
    throw new MercadoPagoApiError(response.status, message);
  }

  return body;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    name: parts[0] ?? '',
    surname: parts.slice(1).join(' '),
  };
}

function payerPhone(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  return {
    area_code: digits.slice(0, 2),
    number: digits.slice(2),
  };
}

function toMoney(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export async function createMercadoPagoPreference(
  input: CreateMercadoPagoPreferenceInput
): Promise<MercadoPagoPreferenceResult> {
  const items = input.items.map((item) => ({
    id: item.id,
    title: item.title.slice(0, 250),
    quantity: item.quantity,
    unit_price: toMoney(item.unitPriceCents),
    currency_id: 'BRL',
  }));

  if (input.shippingCents > 0) {
    items.push({
      id: 'frete',
      title: `Frete — ${input.shippingTitle ?? 'entrega'}`.slice(0, 250),
      quantity: 1,
      unit_price: toMoney(input.shippingCents),
      currency_id: 'BRL',
    });
  }

  const { name, surname } = splitName(input.payer.name);
  const phone = payerPhone(input.payer.phone);
  const baseUrl = input.appUrl.replace(/\/+$/, '');
  const backUrls = {
    success: `${baseUrl}/pedido/${encodeURIComponent(input.orderCode)}?pagamento=sucesso`,
    failure: `${baseUrl}/pedido/${encodeURIComponent(input.orderCode)}?pagamento=falha`,
    pending: `${baseUrl}/pedido/${encodeURIComponent(input.orderCode)}?pagamento=pendente`,
  };

  const body = {
    items,
    payer: {
      email: input.payer.email,
      ...(name ? { name } : {}),
      ...(surname ? { surname } : {}),
      ...(phone ? { phone } : {}),
    },
    back_urls: backUrls,
    // O Mercado Pago exige HTTPS para retorno automático.
    ...(baseUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
    notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
    external_reference: input.orderCode,
    metadata: {
      order_code: input.orderCode,
      order_id: input.orderId,
    },
    statement_descriptor: 'MARI ALLVES',
    expires: true,
    expiration_date_from: new Date().toISOString(),
    // Limite de 10 minutos para o cliente concluir o pagamento.
    expiration_date_to: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };

  const response = await mercadoPagoFetch('/checkout/preferences', input.accessToken, {
    method: 'POST',
    headers: {
      'X-Idempotency-Key': `mp-pref-${input.orderCode}`.slice(0, 64),
    },
    body: JSON.stringify(body),
  });

  const data = asObject(response);
  const preferenceId = asString(data?.id);
  const initPoint = asString(data?.init_point);
  const sandboxInitPoint = asString(data?.sandbox_init_point);
  const checkoutUrl = input.sandbox
    ? sandboxInitPoint ?? initPoint
    : initPoint ?? sandboxInitPoint;

  if (!preferenceId || !checkoutUrl) {
    throw new MercadoPagoApiError(
      502,
      'O Mercado Pago não retornou a preferência de pagamento esperada.'
    );
  }

  return {
    preferenceId,
    checkoutUrl,
    raw: {
      preference_id: preferenceId,
      init_point: initPoint,
      sandbox_init_point: sandboxInitPoint,
      expiration_date_to: asString(data?.expiration_date_to),
    },
  };
}

function normalizePayment(body: unknown, fallbackId: string): MercadoPagoPaymentData {
  const data = asObject(body) ?? {};
  const paymentType = asString(data.payment_type_id);
  const paymentMethod = asString(data.payment_method_id);
  const amount = asNumber(data.transaction_amount);

  return {
    id: asString(data.id) ?? fallbackId,
    status: asString(data.status) ?? 'pending',
    statusDetail: asString(data.status_detail),
    externalReference: asString(data.external_reference),
    preferenceId: asString(data.preference_id),
    method: paymentType ?? paymentMethod,
    amountCents: amount === null ? null : Math.round(amount * 100),
    dateApproved: asString(data.date_approved),
    dateLastUpdated: asString(data.date_last_updated),
    raw: {
      id: asString(data.id) ?? fallbackId,
      status: asString(data.status) ?? 'pending',
      status_detail: asString(data.status_detail),
      external_reference: asString(data.external_reference),
      preference_id: asString(data.preference_id),
      payment_type_id: paymentType,
      payment_method_id: paymentMethod,
      transaction_amount: amount,
      date_approved: asString(data.date_approved),
      date_last_updated: asString(data.date_last_updated),
    },
  };
}

export async function getMercadoPagoPayment(
  paymentId: string,
  accessToken: string
): Promise<MercadoPagoPaymentData> {
  const response = await mercadoPagoFetch(
    `/v1/payments/${encodeURIComponent(paymentId)}`,
    accessToken
  );

  return normalizePayment(response, paymentId);
}

export async function searchMercadoPagoPayments(
  externalReference: string,
  accessToken: string
): Promise<MercadoPagoPaymentData[]> {
  const query = new URLSearchParams({
    external_reference: externalReference,
    sort: 'date_created',
    criteria: 'desc',
    limit: '10',
  });

  const response = await mercadoPagoFetch(
    `/v1/payments/search?${query.toString()}`,
    accessToken
  );
  const data = asObject(response);
  const results = Array.isArray(data?.results) ? data.results : [];

  return results.map((result, index) =>
    normalizePayment(result, `search-${externalReference}-${index}`)
  );
}

export function mapMercadoPagoStatus(status: string): PaymentStatus {
  switch (status) {
    case 'approved':
      return PaymentStatus.APROVADO;
    case 'rejected':
      return PaymentStatus.RECUSADO;
    case 'cancelled':
      return PaymentStatus.CANCELADO;
    case 'refunded':
    case 'charged_back':
      return PaymentStatus.REEMBOLSADO;
    case 'expired':
      return PaymentStatus.EXPIRADO;
    case 'pending':
    case 'in_process':
    case 'authorized':
    case 'in_mediation':
    default:
      return PaymentStatus.PENDENTE;
  }
}

/**
 * Valida a assinatura do webhook do Mercado Pago.
 * Manifesto: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * HMAC-SHA256 com o segredo do webhook.
 */
export function verifyMercadoPagoSignature(input: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
  secret: string | null;
}) {
  if (!input.signature || !input.requestId || !input.dataId || !input.secret) {
    return false;
  }

  const parts = new Map<string, string>();
  for (const part of input.signature.split(',')) {
    const separator = part.indexOf('=');
    if (separator <= 0) continue;
    parts.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }

  const timestamp = parts.get('ts');
  const receivedSignature = parts.get('v1');
  if (!timestamp || !receivedSignature) return false;

  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${timestamp};`;
  const expected = createHmac('sha256', input.secret).update(manifest).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(receivedSignature, 'utf8');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
