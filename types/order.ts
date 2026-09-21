import type { CartLine } from './cart'

/** Бесплатная доставка от суммы заказа. Порог на сайте — для подсказки; фактический считается в кабинете Яндекса. */
export const FREE_DELIVERY_MIN_CENTS = 800_000

export const ORDER_STATUSES = [
  'checkout',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded'
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface CheckoutContact {
  name?: string
  phone?: string
  email?: string
}

export interface OrderDelivery {
  methodType?: string
  title?: string
  provider?: string
  amountCents: number
  address?: string
  pickupPointId?: string
  pickupPointName?: string
}

export interface CheckoutSessionInput {
  comment?: string
  lines: Array<{
    productId: string
    quantity: number
  }>
}

export interface OrderTotals {
  subtotalCents: number
  deliveryCents: number
  totalCents: number
}

export interface Order extends OrderTotals {
  id: string
  createdAt: string
  updatedAt: string
  status: OrderStatus
  comment: string
  lines: CartLine[]
  contact?: CheckoutContact
  delivery?: OrderDelivery
  paymentUrl?: string
  paymentStatus?: string
  paymentMethod?: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  checkout: 'Оформление',
  pending: 'Ожидает оплату',
  paid: 'Оплачен',
  failed: 'Ошибка оплаты',
  cancelled: 'Отменён',
  refunded: 'Возврат'
}

export const YANDEX_PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает оплату',
  AUTHORIZED: 'Средства захолдированы',
  CAPTURED: 'Оплачен',
  CONFIRMED: 'Подтверждён',
  FAILED: 'Оплата не прошла',
  VOIDED: 'Отменён',
  REFUNDED: 'Возврат',
  PARTIALLY_REFUNDED: 'Частичный возврат'
}
