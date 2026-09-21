import type { Order, OrderStatus } from '~~/types/order'
import { calcOrderTotals } from '#shared/orderValidation'

function createOrderId() {
  return `CT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

function nowIso() {
  return new Date().toISOString()
}

export async function saveOrder(order: Order): Promise<Order> {
  const storage = useStorage('orders')
  await storage.setItem(order.id, order)
  return order
}

export async function createCheckoutOrder(input: {
  lines: Order['lines']
  comment: string
}): Promise<Order> {
  const createdAt = nowIso()
  const totals = calcOrderTotals(input.lines)
  const order: Order = {
    id: createOrderId(),
    createdAt,
    updatedAt: createdAt,
    status: 'checkout',
    comment: input.comment,
    lines: input.lines,
    ...totals
  }
  return saveOrder(order)
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!id || typeof id !== 'string') return null
  const storage = useStorage('orders')
  const order = await storage.getItem<Order>(id)
  return order ?? null
}

export async function patchOrder(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const order = await getOrder(id)
  if (!order) return null

  const deliveryCents =
    patch.delivery?.amountCents ??
    patch.deliveryCents ??
    order.deliveryCents
  const totals = calcOrderTotals(patch.lines ?? order.lines, deliveryCents)

  const next: Order = {
    ...order,
    ...patch,
    ...totals,
    updatedAt: nowIso()
  }
  return saveOrder(next)
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  return patchOrder(id, { status })
}
