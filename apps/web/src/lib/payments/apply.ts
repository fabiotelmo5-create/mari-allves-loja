import 'server-only';

import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  prisma,
} from '@mari-allves/db';
import {
  mapMercadoPagoStatus,
  type MercadoPagoPaymentData,
} from './mercado-pago';

export type ApplyMercadoPagoPaymentResult =
  | {
      ok: true;
      duplicate: boolean;
      orderCode: string;
      paymentStatus: PaymentStatus;
      orderStatus: OrderStatus;
      orderStatusChanged: boolean;
    }
  | {
      ok: false;
      reason: 'order_not_found' | 'amount_mismatch' | 'database_error';
      message: string;
    };

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function resolvePaymentStatus(
  current: PaymentStatus,
  incoming: PaymentStatus
): PaymentStatus {
  // Uma aprovação nunca é sobrescrita por uma notificação atrasada de recusa.
  if (current === PaymentStatus.APROVADO) {
    return incoming === PaymentStatus.REEMBOLSADO
      ? PaymentStatus.REEMBOLSADO
      : current;
  }

  if (current === PaymentStatus.REEMBOLSADO) return current;

  // Se o provedor confirmar um pagamento depois de um cancelamento local,
  // registra o fato para a equipe estornar. O pedido continua cancelado.
  if (current === PaymentStatus.CANCELADO) {
    return incoming === PaymentStatus.APROVADO ||
      incoming === PaymentStatus.REEMBOLSADO
      ? incoming
      : current;
  }

  return incoming;
}

function eventPayload(input: {
  payment: MercadoPagoPaymentData;
  source: 'webhook' | 'sync';
  appliedStatus: PaymentStatus;
  ignored: boolean;
}): Prisma.InputJsonValue {
  return {
    provider: 'mercado_pago',
    source: input.source,
    payment_id: input.payment.id,
    provider_status: input.payment.status,
    provider_status_detail: input.payment.statusDetail,
    applied_status: input.appliedStatus,
    external_reference: input.payment.externalReference,
    preference_id: input.payment.preferenceId,
    amount_cents: input.payment.amountCents,
    ignored: input.ignored,
  };
}

/**
 * Aplica um pagamento do Mercado Pago de forma idempotente.
 *
 * A única fonte de verdade para aprovar um pagamento online é este fluxo,
 * alimentado pelo webhook assinado (ou por uma sincronização manual do admin).
 * A página de retorno do checkout nunca altera status.
 */
export async function applyMercadoPagoPayment(input: {
  payment: MercadoPagoPaymentData;
  eventId?: string | null;
  source: 'webhook' | 'sync';
}): Promise<ApplyMercadoPagoPaymentResult> {
  const { payment } = input;

  if (!payment.externalReference) {
    console.warn('[mercado-pago] pagamento sem external_reference:', payment.id);
    return {
      ok: false,
      reason: 'order_not_found',
      message: 'O pagamento não contém a referência do pedido.',
    };
  }

  const order = await prisma.order.findUnique({
    where: { code: payment.externalReference },
    include: {
      payments: {
        where: { provider: 'mercado_pago' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!order) {
    console.warn(
      '[mercado-pago] pedido não encontrado para external_reference:',
      payment.externalReference
    );
    return {
      ok: false,
      reason: 'order_not_found',
      message: 'Pedido não encontrado para este pagamento.',
    };
  }

  const localPayment = order.payments[0] ?? null;
  const eventId =
    input.eventId?.trim() ||
    `mp-sync:${payment.id}:${payment.status}:${payment.dateLastUpdated ?? ''}`;

  if (payment.amountCents === null || payment.amountCents !== order.totalCents) {
    console.error(
      '[mercado-pago] valor divergente:',
      payment.id,
      payment.amountCents,
      order.totalCents
    );

    if (localPayment) {
      try {
        await prisma.paymentEvent.create({
          data: {
            paymentId: localPayment.id,
            providerEventId: eventId,
            eventType: 'payment.amount_mismatch',
            payload: {
              provider: 'mercado_pago',
              source: input.source,
              payment_id: payment.id,
              provider_amount_cents: payment.amountCents,
              order_amount_cents: order.totalCents,
              external_reference: payment.externalReference,
            },
          },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          console.error('[mercado-pago] falha ao registrar divergência:', error);
        }
      }
    }

    return {
      ok: false,
      reason: 'amount_mismatch',
      message: 'O valor pago não corresponde ao total do pedido.',
    };
  }

  if (localPayment) {
    const alreadyProcessed = await prisma.paymentEvent.findUnique({
      where: { providerEventId: eventId },
      select: { id: true },
    });

    if (alreadyProcessed) {
      return {
        ok: true,
        duplicate: true,
        orderCode: order.code,
        paymentStatus: localPayment.status,
        orderStatus: order.status,
        orderStatusChanged: false,
      };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const currentPayment =
        localPayment ??
        (await tx.payment.create({
          data: {
            orderId: order.id,
            provider: 'mercado_pago',
            providerTxId: payment.id,
            providerPreferenceId: payment.preferenceId,
            idempotencyKey: `mp-${order.id}-${payment.id}`,
            method: payment.method ?? 'checkout_pro',
            status: mapMercadoPagoStatus(payment.status),
            amountCents: order.totalCents,
            raw: payment.raw as Prisma.InputJsonValue,
          },
        }));

      const duplicateEvent = await tx.paymentEvent.findUnique({
        where: { providerEventId: eventId },
        select: { id: true },
      });

      if (duplicateEvent) {
        return {
          duplicate: true,
          paymentStatus: currentPayment.status,
          orderStatus: order.status,
          orderStatusChanged: false,
        };
      }

      const targetStatus = mapMercadoPagoStatus(payment.status);
      const appliedStatus = resolvePaymentStatus(currentPayment.status, targetStatus);
      const ignored = appliedStatus !== targetStatus;

      await tx.paymentEvent.create({
        data: {
          paymentId: currentPayment.id,
          providerEventId: eventId,
          eventType: `payment.${payment.status}`,
          payload: eventPayload({
            payment,
            source: input.source,
            appliedStatus,
            ignored,
          }),
        },
      });

      const shouldUpdateProviderTxId =
        currentPayment.providerTxId.startsWith('mp-pending-') ||
        currentPayment.providerTxId.startsWith('pref-') ||
        appliedStatus === PaymentStatus.APROVADO ||
        currentPayment.providerTxId === payment.id;

      await tx.payment.update({
        where: { id: currentPayment.id },
        data: {
          status: appliedStatus,
          method: payment.method ?? currentPayment.method ?? 'checkout_pro',
          providerPreferenceId:
            payment.preferenceId ?? currentPayment.providerPreferenceId,
          raw: payment.raw as Prisma.InputJsonValue,
          ...(shouldUpdateProviderTxId ? { providerTxId: payment.id } : {}),
        },
      });

      let nextOrderStatus: OrderStatus | null = null;

      if (
        appliedStatus === PaymentStatus.APROVADO &&
        order.status === OrderStatus.AGUARDANDO_PAGAMENTO
      ) {
        nextOrderStatus = OrderStatus.PAGAMENTO_CONFIRMADO;
      }

      const refundableOrderStatuses: OrderStatus[] = [
        OrderStatus.PAGAMENTO_CONFIRMADO,
        OrderStatus.ENVIADO,
        OrderStatus.ENTREGUE,
      ];

      if (
        appliedStatus === PaymentStatus.REEMBOLSADO &&
        refundableOrderStatuses.includes(order.status)
      ) {
        nextOrderStatus = OrderStatus.REEMBOLSADO;
      }

      if (nextOrderStatus) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: nextOrderStatus },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: nextOrderStatus,
            note:
              nextOrderStatus === OrderStatus.PAGAMENTO_CONFIRMADO
                ? 'Pagamento aprovado pelo Mercado Pago.'
                : 'Pagamento reembolsado pelo Mercado Pago.',
            changedBy: 'system',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tableName: 'Payment',
          recordId: currentPayment.id,
          action: 'UPDATE',
          changedBy: 'system',
          oldData: {
            status: currentPayment.status,
            orderStatus: order.status,
          },
          newData: {
            status: appliedStatus,
            providerStatus: payment.status,
            providerPaymentId: payment.id,
            orderStatus: nextOrderStatus ?? order.status,
            source: input.source,
          },
        },
      });

      return {
        duplicate: false,
        paymentStatus: appliedStatus,
        orderStatus: nextOrderStatus ?? order.status,
        orderStatusChanged: Boolean(nextOrderStatus),
      };
    });

    return {
      ok: true,
      orderCode: order.code,
      ...result,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: true,
        duplicate: true,
        orderCode: order.code,
        paymentStatus: localPayment?.status ?? PaymentStatus.PENDENTE,
        orderStatus: order.status,
        orderStatusChanged: false,
      };
    }

    console.error('[mercado-pago] falha ao aplicar pagamento:', error);
    return {
      ok: false,
      reason: 'database_error',
      message: 'Não foi possível atualizar o pagamento agora.',
    };
  }
}
