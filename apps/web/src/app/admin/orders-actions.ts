'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import {
  canTransition,
  isOrderStatus,
  ORDER_STATUS_LABELS,
} from '@/lib/order-status';

export type OrderActionState = { error?: string; success?: boolean } | null;

function revalidateOrder(orderId: string, code: string) {
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/${code}`);
  revalidatePath('/meus-pedidos');
  revalidatePath('/catalogo');
}

export async function updateOrderStatusAction(
  _previousState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const { admin } = await requireAdmin();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const nextStatus = String(formData.get('status') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim().slice(0, 500);

  if (!orderId) return { error: 'Pedido não encontrado.' };
  if (!isOrderStatus(nextStatus)) return { error: 'Status inválido.' };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shipment: true },
  });

  if (!order) return { error: 'Pedido não encontrado.' };
  if (order.status === nextStatus) return { error: 'O pedido já está nesse status.' };
  if (!canTransition(order.status, nextStatus)) {
    return {
      error: `Não é possível passar de "${ORDER_STATUS_LABELS[order.status]}" para "${ORDER_STATUS_LABELS[nextStatus]}".`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: nextStatus, adminUserId: admin.id },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: nextStatus,
          note: note || null,
          changedBy: admin.userId,
        },
      });

      if (nextStatus === 'PAGAMENTO_CONFIRMADO') {
        await tx.payment.updateMany({
          where: { orderId, status: 'PENDENTE' },
          data: { status: 'APROVADO' },
        });
      }

      if (nextStatus === 'ENVIADO') {
        await tx.shipment.upsert({
          where: { orderId },
          create: { orderId, shippedAt: new Date() },
          update: { shippedAt: order.shipment?.shippedAt ?? new Date() },
        });
      }

      if (nextStatus === 'ENTREGUE') {
        await tx.shipment.updateMany({
          where: { orderId },
          data: { deliveredAt: new Date() },
        });
      }

      if (nextStatus === 'CANCELADO') {
        // A transição para CANCELADO é terminal, então o estoque volta uma única vez.
        for (const item of order.items) {
          if (!item.variantId) continue;

          const stock = await tx.stock.findUnique({ where: { variantId: item.variantId } });
          if (!stock) continue;

          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              type: 'DEVOLUCAO',
              quantity: item.quantity,
              reason: `Cancelamento do pedido ${order.code}`,
              changedBy: admin.userId,
              adminUserId: admin.id,
            },
          });
        }

        await tx.payment.updateMany({
          where: { orderId },
          data: { status: 'CANCELADO' },
        });
      }

      if (nextStatus === 'REEMBOLSADO') {
        await tx.payment.updateMany({
          where: { orderId },
          data: { status: 'REEMBOLSADO' },
        });
      }

      await tx.auditLog.create({
        data: {
          tableName: 'Order',
          recordId: orderId,
          action: 'UPDATE',
          changedBy: admin.userId,
          oldData: { status: order.status },
          newData: { status: nextStatus, note: note || null },
        },
      });
    });
  } catch {
    return { error: 'Não foi possível atualizar o pedido. Tente novamente.' };
  }

  revalidateOrder(orderId, order.code);
  return { success: true };
}

export async function saveShipmentAction(
  _previousState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const { admin } = await requireAdmin();

  const orderId = String(formData.get('orderId') ?? '').trim();
  const carrier = String(formData.get('carrier') ?? '').trim().slice(0, 100);
  const trackingCode = String(formData.get('trackingCode') ?? '').trim().slice(0, 100);

  if (!orderId) return { error: 'Pedido não encontrado.' };
  if (!carrier && !trackingCode) {
    return { error: 'Informe a transportadora ou o código de rastreio.' };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, code: true, status: true },
  });

  if (!order) return { error: 'Pedido não encontrado.' };
  if (order.status === 'CANCELADO') {
    return { error: 'Não é possível registrar envio de um pedido cancelado.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { orderId },
        create: { orderId, carrier: carrier || null, trackingCode: trackingCode || null },
        update: { carrier: carrier || null, trackingCode: trackingCode || null },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'Shipment',
          recordId: orderId,
          action: 'UPDATE',
          changedBy: admin.userId,
          newData: { carrier: carrier || null, trackingCode: trackingCode || null },
        },
      });
    });
  } catch {
    return { error: 'Não foi possível salvar o envio. Tente novamente.' };
  }

  revalidateOrder(orderId, order.code);
  return { success: true };
}
