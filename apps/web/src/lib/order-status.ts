export const ALL_ORDER_STATUSES = [
  'AGUARDANDO_PAGAMENTO',
  'PAGAMENTO_CONFIRMADO',
  'EM_PREPARACAO',
  'ENVIADO',
  'ENTREGUE',
  'CANCELADO',
  'REEMBOLSADO',
] as const;

export type OrderStatusValue = (typeof ALL_ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGAMENTO_CONFIRMADO: 'Pagamento confirmado',
  EM_PREPARACAO: 'Em preparação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
};

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatusValue, string> = {
  AGUARDANDO_PAGAMENTO: 'bg-amber-50 text-amber-700',
  PAGAMENTO_CONFIRMADO: 'bg-emerald-50 text-emerald-700',
  EM_PREPARACAO: 'bg-blue-50 text-blue-700',
  ENVIADO: 'bg-indigo-50 text-indigo-700',
  ENTREGUE: 'bg-emerald-50 text-emerald-700',
  CANCELADO: 'bg-red-50 text-red-700',
  REEMBOLSADO: 'bg-gray-100 text-gray-600',
};

const TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  AGUARDANDO_PAGAMENTO: ['PAGAMENTO_CONFIRMADO', 'CANCELADO'],
  PAGAMENTO_CONFIRMADO: ['EM_PREPARACAO', 'CANCELADO', 'REEMBOLSADO'],
  EM_PREPARACAO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGUE', 'REEMBOLSADO'],
  ENTREGUE: ['REEMBOLSADO'],
  CANCELADO: [],
  REEMBOLSADO: [],
};

export function canTransition(from: string, to: string) {
  return (TRANSITIONS[from as OrderStatusValue] ?? []).includes(to as OrderStatusValue);
}

export function nextStatuses(from: string) {
  return TRANSITIONS[from as OrderStatusValue] ?? [];
}

export function isOrderStatus(value: string): value is OrderStatusValue {
  return (ALL_ORDER_STATUSES as readonly string[]).includes(value);
}
