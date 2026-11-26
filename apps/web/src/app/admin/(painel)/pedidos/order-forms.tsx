'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatusValue } from '@/lib/order-status';
import { PAYMENT_STATUS_LABELS } from '@/lib/payment-labels';
import {
  correctOrderStatusAction,
  saveShipmentAction,
  syncMercadoPagoPaymentAction,
  updateOrderStatusAction,
  updatePaymentStatusAction,
  type OrderActionState,
  type SyncPaymentState,
} from '@/app/admin/orders-actions';

function Feedback({ state }: { state: OrderActionState }) {
  if (!state) return null;

  if (state.error) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
        Salvo com sucesso.
      </p>
    );
  }

  return null;
}

export function OrderStatusForm({
  orderId,
  allowed,
}: {
  orderId: string;
  allowed: OrderStatusValue[];
}) {
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, null);

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido está em um status final e não pode ser alterado.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm">
        Novo status
        <select name="status" required className="input" defaultValue={allowed[0]}>
          {allowed.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Observação (opcional)
        <textarea name="note" rows={2} maxLength={500} className="input" />
      </label>
      <Feedback state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? 'Salvando…' : 'Atualizar status'}
      </Button>
    </form>
  );
}

export function CorrectionStatusForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(correctOrderStatusAction, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
        Use apenas para corrigir erros. Esta ação permite qualquer status, inclusive voltar de
        status finais, e fica registrada no histórico.
      </p>
      <label className="block text-sm">
        Novo status
        <select name="status" required defaultValue="" className="input">
          <option value="" disabled>
            Selecione o status
          </option>
          {ALL_ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Motivo da correção <span className="text-rosé-600">*</span>
        <textarea
          name="note"
          required
          minLength={3}
          rows={2}
          maxLength={500}
          placeholder="Ex.: Cliente não pagou; status marcado por engano."
          className="input"
        />
      </label>
      <Feedback state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Corrigindo…' : 'Corrigir status'}
      </Button>
    </form>
  );
}

export function PaymentStatusForm({
  orderId,
  paymentId,
  currentStatus,
}: {
  orderId: string;
  paymentId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updatePaymentStatusAction, null);

  return (
    <form action={formAction} className="mt-3 border-t border-border pt-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="paymentId" value={paymentId} />
      <label className="block text-sm">
        Status do pagamento (manual)
        <select name="status" required defaultValue={currentStatus} className="input">
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Feedback state={state} />
      <Button type="submit" variant="outline" disabled={pending} className="mt-3">
        {pending ? 'Salvando…' : 'Salvar status do pagamento'}
      </Button>
    </form>
  );
}

function SyncPaymentFeedback({ state }: { state: SyncPaymentState }) {
  if (!state) return null;

  if (state.error) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
        {state.success}
      </p>
    );
  }

  return null;
}

export function SyncPaymentForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(
    syncMercadoPagoPaymentAction,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-xs text-muted-foreground">
        Consulta o status mais recente no Mercado Pago e atualiza o pedido. Use se o webhook
        atrasar ou falhar.
      </p>
      <SyncPaymentFeedback state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Sincronizando…' : 'Sincronizar com Mercado Pago'}
      </Button>
    </form>
  );
}

export function ShipmentForm({
  orderId,
  carrier,
  trackingCode,
}: {
  orderId: string;
  carrier: string | null;
  trackingCode: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveShipmentAction, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm">
        Transportadora / motoboy
        <input
          name="carrier"
          defaultValue={carrier ?? ''}
          maxLength={100}
          placeholder="Ex.: Motoboy local"
          className="input"
        />
      </label>
      <label className="block text-sm">
        Código de rastreio
        <input
          name="trackingCode"
          defaultValue={trackingCode ?? ''}
          maxLength={100}
          placeholder="Opcional para entrega local"
          className="input"
        />
      </label>
      <Feedback state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar envio'}
      </Button>
    </form>
  );
}
