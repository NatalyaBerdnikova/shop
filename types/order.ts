import type { CartLine } from './cart'

export const DELIVERY_CARRIERS = ['yandex', 'cdek'] as const
export type DeliveryCarrier = (typeof DELIVERY_CARRIERS)[number]

export const PAYMENT_METHODS = [
  'card_online',
  'card_on_delivery'
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface CheckoutContact {
  name: string
  phone: string
  email: string
}

/** Выбранный пункт выдачи (ПВЗ / постамат). */
export interface PickupPointSelection {
  id: string
  carrier: DeliveryCarrier
  name: string
  city: string
  address: string
  schedule?: string
  /** Стоимость доставки до этого ПВЗ в копейках (до применения порога бесплатной). */
  deliveryCents: number
  etaDaysMin?: number
  etaDaysMax?: number
}

export interface CheckoutDelivery {
  carrier: DeliveryCarrier
  city: string
  pickupPoint: PickupPointSelection | null
}

export interface CheckoutFormInput {
  contact: CheckoutContact
  delivery: CheckoutDelivery
  paymentMethod: PaymentMethod
  comment: string
}

/** Тело запроса на создание заказа. */
export interface CreateOrderPayload extends CheckoutFormInput {
  lines: CartLine[]
}

export interface OrderTotals {
  subtotalCents: number
  deliveryCents: number
  totalCents: number
  freeDeliveryApplied: boolean
}

export interface Order extends CheckoutFormInput, OrderTotals {
  id: string
  createdAt: string
  lines: CartLine[]
  status: 'new'
}

export const CARRIER_LABELS: Record<DeliveryCarrier, string> = {
  yandex: 'Яндекс Доставка',
  cdek: 'СДЭК'
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card_online: 'Картой онлайн',
  card_on_delivery: 'Картой при получении в ПВЗ'
}

/** Бесплатная доставка от суммы заказа (как у Risha Wear). */
export const FREE_DELIVERY_MIN_CENTS = 800_000
