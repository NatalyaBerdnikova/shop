import { calcOrderTotals } from '#shared/orderValidation'
import {
  mapYandexPaymentStatus,
  mapYandexShipping
} from '#shared/yandexPay'
import type { Order } from '~~/types/order'
import { getYandexPayOrder } from './yandexPayClient'
import { patchOrder } from './orders'

export async function syncOrderFromYandex(order: Order): Promise<Order> {
  const response = await getYandexPayOrder(order.id)
  const yandexOrder = response.data?.order
  if (!yandexOrder) return order

  const delivery = mapYandexShipping(
    yandexOrder.shippingMethod,
    response.data?.delivery?.actualPrice || response.data?.delivery?.price
  )
  const paymentStatus = yandexOrder.paymentStatus ?? order.paymentStatus
  const status = mapYandexPaymentStatus(paymentStatus)
  const deliveryCents = delivery?.amountCents ?? order.deliveryCents
  const totals = calcOrderTotals(order.lines, deliveryCents)

  return (
    (await patchOrder(order.id, {
      status,
      paymentStatus: paymentStatus ?? undefined,
      paymentMethod: yandexOrder.paymentMethod?.methodType,
      delivery,
      ...totals
    })) ?? order
  )
}

export function applyWebhookPayment(
  order: Order,
  paymentStatus?: string
): Pick<Order, 'status' | 'paymentStatus'> & {
  deliveryCents?: number
  totalCents?: number
} {
  const status = mapYandexPaymentStatus(paymentStatus)
  const deliveryCents = order.deliveryCents
  return {
    status,
    paymentStatus,
    deliveryCents,
    totalCents: order.subtotalCents + deliveryCents
  }
}
