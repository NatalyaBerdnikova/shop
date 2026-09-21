import { calcOrderTotals } from '#shared/orderValidation'
import { mapYandexShipping, mapYandexPaymentStatus } from '#shared/yandexPay'
import { parseRubAmountToCents } from '#shared/money'
import { resolveCheckoutLines } from '../../../utils/catalog'
import { createCheckoutOrder, getOrder, patchOrder } from '../../../utils/orders'
import { withYandexPayJwt, yandexFail } from '../../../utils/yandexMerchant'
import type { YandexShippingMethod } from '~~/types/yandexPay'

interface CreatePayload {
  merchantId?: string
  orderId?: string
  orderAmount?: string
  metadata?: string
  cart?: {
    cartId?: string
    externalId?: string
    items?: Array<{
      productId?: string
      quantity?: { count?: number | string } | number
    }>
  }
  shippingMethod?: YandexShippingMethod
  shippingContact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  billingContact?: {
    email?: string
    phone?: string
  }
}

function quantityOf(
  value: { count?: number | string } | number | undefined
) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return Number(value.count)
  return 0
}

function contactName(contact?: CreatePayload['shippingContact']) {
  return [contact?.firstName, contact?.lastName].filter(Boolean).join(' ').trim()
}

export default defineEventHandler((event) =>
  withYandexPayJwt<CreatePayload>(event, async (payload) => {
    const orderId = payload.orderId || payload.cart?.externalId
    let order = orderId ? await getOrder(orderId) : null

    if (!order) {
      const requestLines =
        payload.cart?.items
          ?.map((item) => ({
            productId: String(item.productId ?? ''),
            quantity: quantityOf(item.quantity)
          }))
          .filter((item) => item.productId && item.quantity > 0) ?? []

      if (!requestLines.length) {
        return yandexFail(event, 404, 'ORDER_NOT_FOUND', 'Order not found')
      }

      const resolved = resolveCheckoutLines(requestLines)
      if (!resolved.ok) {
        return yandexFail(event, 404, 'ITEM_NOT_FOUND', 'Item not found')
      }

      order = await createCheckoutOrder({
        lines: resolved.cartLines,
        comment: ''
      })
    }

    const delivery = mapYandexShipping(payload.shippingMethod)
    const expected = calcOrderTotals(
      order.lines,
      delivery?.amountCents ?? order.deliveryCents
    )
    const incomingAmount = parseRubAmountToCents(payload.orderAmount)
    if (incomingAmount && Math.abs(incomingAmount - expected.totalCents) > 1) {
      return yandexFail(
        event,
        409,
        'ORDER_AMOUNT_MISMATCH',
        'Order amount mismatch'
      )
    }

    const contact = {
      name: contactName(payload.shippingContact) || order.contact?.name,
      phone:
        payload.shippingContact?.phone ||
        payload.billingContact?.phone ||
        order.contact?.phone,
      email:
        payload.shippingContact?.email ||
        payload.billingContact?.email ||
        order.contact?.email
    }

    const saved = await patchOrder(order.id, {
      status: mapYandexPaymentStatus('PENDING'),
      paymentStatus: 'PENDING',
      delivery,
      contact,
      ...expected
    })

    return {
      status: 'success',
      data: {
        orderId: saved?.id ?? order.id
      }
    }
  })
)
