import type { CartLine } from '../types/cart'
import type {
  CheckoutSessionInput,
  OrderTotals
} from '../types/order'
import { sumLineCents } from './money'

export type CheckoutFieldErrors = Partial<
  Record<'lines' | 'comment' | 'form', string>
>

export function calcOrderTotals(
  lines: Array<{ unitPriceCents: number; quantity: number }>,
  deliveryCents = 0
): OrderTotals {
  const subtotalCents = sumLineCents(lines)
  const safeDelivery = Math.max(0, Math.round(deliveryCents))
  return {
    subtotalCents,
    deliveryCents: safeDelivery,
    totalCents: subtotalCents + safeDelivery
  }
}

export function validateCheckoutSession(
  payload: unknown
):
  | { ok: true; data: CheckoutSessionInput }
  | { ok: false; errors: CheckoutFieldErrors } {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: { form: 'Некорректные данные заказа' } }
  }

  const body = payload as Partial<CheckoutSessionInput>
  const rawLines = Array.isArray(body.lines) ? body.lines : []

  const merged = new Map<string, number>()
  for (const line of rawLines) {
    if (!line || typeof line !== 'object') continue
    const productId = String((line as { productId?: unknown }).productId ?? '').trim()
    const quantity = Number((line as { quantity?: unknown }).quantity)
    if (!productId) continue
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return {
        ok: false,
        errors: { lines: 'Количество товара должно быть от 1 до 99' }
      }
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity)
  }

  const lines = [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity: Math.min(quantity, 99)
  }))

  if (!lines.length) {
    return { ok: false, errors: { lines: 'Корзина пуста' } }
  }

  const comment = String(body.comment ?? '')
    .trim()
    .slice(0, 500)

  return {
    ok: true,
    data: { lines, comment }
  }
}

export function toCartLines(
  lines: Array<{
    productId: string
    slug?: string
    title: string
    unitPriceCents: number
    quantity: number
    imageUrl?: string
  }>
): CartLine[] {
  return lines.map((line) => ({
    id: line.productId,
    productId: line.productId,
    slug: line.slug,
    title: line.title,
    unitPriceCents: Math.round(line.unitPriceCents),
    quantity: line.quantity,
    imageUrl: line.imageUrl
  }))
}
