export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
};

export function paymentProviderLabel(provider: string) {
  if (provider === 'manual') return 'Manual';
  if (provider === 'mercado_pago') return 'Mercado Pago';
  return provider;
}

export function paymentMethodLabel(method: string | null | undefined) {
  if (!method) return '—';

  const labels: Record<string, string> = {
    a_combinar: 'A combinar',
    checkout_pro: 'Checkout Mercado Pago',
    pix: 'Pix',
    credit_card: 'Cartão de crédito',
    debit_card: 'Cartão de débito',
    ticket: 'Boleto',
    bank_transfer: 'Transferência bancária',
    account_money: 'Saldo Mercado Pago',
  };

  return labels[method.toLowerCase()] ?? method;
}
