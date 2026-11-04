'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@mari-allves/db';
import { getCurrentProfile } from '@/lib/auth';
import { cepMatches, onlyDigits } from '@/lib/shipping';

export type CheckoutState = { error?: string; orderCode?: string } | null;

type CartInput = { variantId: string; quantity: number };

class StockError extends Error {
  constructor(public readonly productName: string) {
    super('stock');
  }
}

function parseItems(value: FormDataEntryValue | null): CartInput[] | null {
  try {
    const parsed = JSON.parse(String(value ?? '[]')) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 50) return null;

    const seen = new Set<string>();
    const items: CartInput[] = [];

    for (const raw of parsed) {
      const row = raw as Record<string, unknown>;
      const variantId = String(row.variantId ?? '').trim();
      const quantity = Number(row.quantity);

      if (!variantId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return null;
      }
      if (seen.has(variantId)) return null;

      seen.add(variantId);
      items.push({ variantId, quantity });
    }

    return items;
  } catch {
    return null;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function generateOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = randomBytes(4).toString('hex').toUpperCase();
  return `MA-${date}-${suffix}`;
}

function readExpectedCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const number = Number(raw);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

export async function createOrderAction(
  _previousState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const items = parseItems(formData.get('items'));
  if (!items) {
    return {
      error: 'Seu carrinho está vazio ou inválido. Volte ao carrinho e tente novamente.',
    };
  }

  const idempotencyKey = String(formData.get('idempotencyKey') ?? '').trim();
  if (idempotencyKey.length < 10 || idempotencyKey.length > 100) {
    return {
      error: 'Não foi possível identificar este envio. Recarregue a página e tente novamente.',
    };
  }

  // Reenvio do mesmo formulário: devolve o pedido já criado em vez de duplicar.
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey },
    select: { code: true },
  });
  if (existingOrder) return { orderCode: existingOrder.code };

  const customerName = String(formData.get('customerName') ?? '').trim();
  const customerEmail = String(formData.get('customerEmail') ?? '').trim().toLowerCase();
  const customerPhone = String(formData.get('customerPhone') ?? '').trim();

  const zip = onlyDigits(String(formData.get('zip') ?? ''));
  const street = String(formData.get('street') ?? '').trim();
  const number = String(formData.get('number') ?? '').trim();
  const complement = String(formData.get('complement') ?? '').trim();
  const district = String(formData.get('district') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const state = String(formData.get('state') ?? '').trim().toUpperCase();
  const shippingZoneId = String(formData.get('shippingZoneId') ?? '').trim();

  const expectedSubtotalCents = readExpectedCents(formData.get('expectedSubtotalCents'));
  const expectedShippingCents = readExpectedCents(formData.get('expectedShippingCents'));

  if (customerName.length < 3) return { error: 'Informe seu nome completo.' };
  if (!isValidEmail(customerEmail)) return { error: 'Informe um e-mail válido.' };
  if (onlyDigits(customerPhone).length < 10) {
    return { error: 'Informe um telefone válido com DDD.' };
  }
  if (zip.length !== 8) return { error: 'Informe um CEP válido com 8 dígitos.' };
  if (street.length < 3) return { error: 'Informe a rua do endereço.' };
  if (!number) return { error: 'Informe o número do endereço.' };
  if (district.length < 2) return { error: 'Informe o bairro.' };
  if (city.length < 2) return { error: 'Informe a cidade.' };
  if (!/^[A-Z]{2}$/.test(state)) return { error: 'Informe o estado (UF) com 2 letras.' };
  if (!shippingZoneId) return { error: 'Calcule o frete antes de finalizar o pedido.' };
  if (formData.get('terms') !== 'on') {
    return { error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' };
  }

  const profile = await getCurrentProfile();

  const [zone, variants] = await Promise.all([
    prisma.shippingZone.findFirst({ where: { id: shippingZoneId, active: true } }),
    prisma.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.variantId) },
        active: true,
        product: { status: 'PUBLICADO' },
      },
      include: {
        product: { select: { id: true, name: true, priceCents: true } },
        stock: { select: { id: true, quantity: true } },
      },
    }),
  ]);

  if (!zone || !cepMatches(zip, zone.zipRanges)) {
    return { error: 'A opção de frete não está mais disponível para este CEP. Calcule novamente.' };
  }
  if (variants.length !== items.length) {
    return { error: 'Um dos itens não está mais disponível. Volte ao carrinho e atualize.' };
  }

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));
  const orderItems = items.map((item) => {
    const variant = variantById.get(item.variantId);
    if (!variant) throw new Error('Variação ausente após validação.');

    const unitPriceCents = variant.priceCents ?? variant.product.priceCents;

    return {
      variant,
      quantity: item.quantity,
      unitPriceCents,
      totalCents: unitPriceCents * item.quantity,
    };
  });

  for (const item of orderItems) {
    const available = item.variant.stock?.quantity ?? 0;
    if (available < item.quantity) {
      return {
        error: `"${item.variant.product.name}" (${item.variant.size} / ${item.variant.color}) tem apenas ${available} unidade(s) em estoque. Ajuste a quantidade no carrinho.`,
      };
    }
  }

  const subtotalCents = orderItems.reduce((total, item) => total + item.totalCents, 0);
  const shippingCents =
    zone.freeShippingMinSubtotalCents !== null &&
    subtotalCents >= zone.freeShippingMinSubtotalCents
      ? 0
      : zone.priceCents;
  const totalCents = subtotalCents + shippingCents;

  if (expectedSubtotalCents !== null && expectedSubtotalCents !== subtotalCents) {
    return { error: 'Os preços dos itens mudaram. Revise o resumo do pedido antes de finalizar.' };
  }
  if (expectedShippingCents !== null && expectedShippingCents !== shippingCents) {
    return { error: 'O valor do frete mudou. Calcule novamente antes de finalizar.' };
  }

  const code = generateOrderCode();

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          code,
          idempotencyKey,
          profileId: profile?.id ?? null,
          guestEmail: customerEmail,
          guestName: customerName,
          guestPhone: customerPhone,
          status: 'AGUARDANDO_PAGAMENTO',
          subtotalCents,
          discountCents: 0,
          shippingCents,
          totalCents,
          shippingMethod: zone.name,
          shippingDays: zone.shippingDays,
          addressSnapshot: {
            recipient: customerName,
            email: customerEmail,
            phone: customerPhone,
            zip,
            street,
            number,
            complement: complement || null,
            district,
            city,
            state,
          },
          items: {
            create: orderItems.map((item) => ({
              productId: item.variant.product.id,
              variantId: item.variant.id,
              productName: item.variant.product.name,
              size: item.variant.size,
              color: item.variant.color,
              sku: item.variant.sku,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              totalCents: item.totalCents,
            })),
          },
        },
      });

      for (const item of orderItems) {
        const stockId = item.variant.stock?.id;
        if (!stockId) throw new StockError(item.variant.product.name);

        // Baixa atômica: só decrementa se ainda houver saldo suficiente.
        const updated = await tx.$queryRaw<Array<{ quantity: number }>>`
          UPDATE "Stock"
          SET quantity = quantity - ${item.quantity}, "updatedAt" = now()
          WHERE id = ${stockId} AND quantity >= ${item.quantity}
          RETURNING quantity
        `;

        if (updated.length === 0) throw new StockError(item.variant.product.name);

        await tx.stockMovement.create({
          data: {
            stockId,
            type: 'SAIDA',
            quantity: item.quantity,
            reason: `Pedido ${code}`,
            changedBy: 'system',
          },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: created.id,
          fromStatus: null,
          toStatus: 'AGUARDANDO_PAGAMENTO',
          note: 'Pedido criado pelo site. Pagamento a combinar com a loja.',
          changedBy: 'system',
        },
      });

      await tx.payment.create({
        data: {
          orderId: created.id,
          provider: 'manual',
          providerTxId: `manual-${created.id}`,
          idempotencyKey: `payment-${idempotencyKey}`,
          method: 'a_combinar',
          status: 'PENDENTE',
          amountCents: totalCents,
        },
      });

      await tx.auditLog.create({
        data: {
          tableName: 'Order',
          recordId: created.id,
          action: 'CREATE',
          changedBy: profile?.userId ?? 'guest',
          newData: { code, totalCents, status: 'AGUARDANDO_PAGAMENTO' },
        },
      });

      return created;
    });

    revalidatePath('/admin');
    revalidatePath('/admin/pedidos');
    revalidatePath('/meus-pedidos');
    revalidatePath('/catalogo');

    return { orderCode: order.code };
  } catch (error) {
    if (error instanceof StockError) {
      return {
        error: `"${error.productName}" acabou de esgotar. Volte ao carrinho e ajuste a quantidade.`,
      };
    }

    // Corrida de idempotência: outra requisição criou o pedido primeiro.
    const duplicate = await prisma.order.findUnique({
      where: { idempotencyKey },
      select: { code: true },
    });
    if (duplicate) return { orderCode: duplicate.code };

    console.error('createOrderAction failed', error);
    return { error: 'Não foi possível criar o pedido agora. Tente novamente em instantes.' };
  }
}
