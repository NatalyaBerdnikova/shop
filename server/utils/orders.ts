import type { CreateOrderPayload, Order } from '~~/types/order'
import { calcOrderTotals } from '#shared/orderValidation'

function createOrderId() {
  return `CT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function saveOrder(payload: CreateOrderPayload): Promise<Order> {
  const storage = useStorage('orders')
  const totals = calcOrderTotals(payload.lines, payload.delivery.pickupPoint)
  const order: Order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    status: 'new',
    ...payload,
    ...totals
  }
  await storage.setItem(order.id, order)
  return order
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!id || typeof id !== 'string') return null
  const storage = useStorage('orders')
  const order = await storage.getItem<Order>(id)
  return order ?? null
}
