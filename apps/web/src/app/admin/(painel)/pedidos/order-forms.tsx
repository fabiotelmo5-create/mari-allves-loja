'use client';

import { useActionState } from 'react';
import { Button } from '@/components/button';
import { ORDER_STATUS_LABELS, type OrderStatusValue } from '@/lib/order-status';
import {
  saveShipmentAction,
  updateOrderStatusAction,
  type OrderActionState,
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
