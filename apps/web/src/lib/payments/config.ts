import 'server-only';

import type { PaymentMode } from './types';

export type PaymentConfig = {
  mode: PaymentMode;
  requestedProvider: string;
  appUrl: string;
  mercadoPago: {
    accessToken: string | null;
    publicKey: string | null;
    webhookSecret: string | null;
    sandbox: boolean;
    configured: boolean;
  };
};

let warnedAboutFallback = false;

function normalizeProvider(value: string | undefined) {
  return (value ?? 'manual').trim().toLowerCase().replaceAll('-', '_');
}

function resolveAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/+$/, '');

  return 'http://localhost:3000';
}

function readBoolean(value: string | undefined) {
  return ['1', 'true', 'sim', 'yes'].includes((value ?? '').trim().toLowerCase());
}

/**
 * Configuração server-side do pagamento.
 *
 * O Checkout Pro precisa de:
 * - MERCADO_PAGO_ACCESS_TOKEN
 * - MERCADO_PAGO_WEBHOOK_SECRET
 *
 * A chave pública não é usada pelo Checkout Pro (redirect), mas fica prevista
 * para uma futura integração de checkout transparente.
 *
 * Se o provedor estiver selecionado mas faltar alguma chave, a loja continua
 * funcionando com pagamento manual em vez de exibir um checkout quebrado.
 */
export function getPaymentConfig(): PaymentConfig {
  const requestedProvider = normalizeProvider(process.env.PAYMENT_PROVIDER);
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() || null;
  const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY?.trim() || null;
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim() || null;
  const mercadoPagoConfigured = Boolean(accessToken && webhookSecret);

  const mode: PaymentMode =
    requestedProvider === 'mercado_pago' && mercadoPagoConfigured
      ? 'mercado_pago'
      : 'manual';

  if (
    !warnedAboutFallback &&
    requestedProvider === 'mercado_pago' &&
    !mercadoPagoConfigured
  ) {
    warnedAboutFallback = true;
    console.warn(
      '[payments] PAYMENT_PROVIDER=mercado_pago, mas faltam MERCADO_PAGO_ACCESS_TOKEN e/ou MERCADO_PAGO_WEBHOOK_SECRET. Usando pagamento manual até as chaves serem configuradas.'
    );
  }

  return {
    mode,
    requestedProvider,
    appUrl: resolveAppUrl(),
    mercadoPago: {
      accessToken,
      publicKey,
      webhookSecret,
      sandbox: readBoolean(process.env.MERCADO_PAGO_SANDBOX),
      configured: mercadoPagoConfigured,
    },
  };
}
