import { formatRubAmount } from '#shared/money'
import { calcOrderTotals } from '#shared/orderValidation'
import {
  buildYandexCart,
  buildYandexCartItem,
  mapYandexShipping
} from '#shared/yandexPay'
import { resolveCheckoutLines } from '../../../utils/catalog'
import { getOrder } from '../../../utils/orders'
import {
  warehouseForRender,
  yandexPaymentMethods,
  yandexReceiptTax
} from '../../../utils/yandexPayClient'
import { withYandexPayJwt, yandexFail } from '../../../utils/yandexMerchant'
import type { YandexShippingMethod } from '~~/types/yandexPay'

interface RenderPayload {
  merchantId?: string
  orderId?: string
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
}

function quantityOf(
  value: { count?: number | string } | number | undefined
) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return Number(value.count)
  return 0
}

export default defineEventHandler((event) =>
  withYandexPayJwt<RenderPayload>(event, async (payload) => {
    const orderId = payload.orderId || payload.cart?.externalId
    const existing = orderId ? await getOrder(orderId) : null

    const requestLines =
      payload.cart?.items
        ?.map((item) => ({
          productId: String(item.productId ?? ''),
          quantity: quantityOf(item.quantity)
        }))
        .filter((item) => item.productId && item.quantity > 0) ?? []

    const sourceLines = existing
      ? existing.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity
        }))
      : requestLines

    if (!sourceLines.length) {
      return yandexFail(event, 404, 'ORDER_NOT_FOUND', 'Order not found')
    }

    const resolved = resolveCheckoutLines(sourceLines)
    if (!resolved.ok) {
      return yandexFail(event, 404, 'ITEM_NOT_FOUND', 'Item not found')
    }

    const shipping = mapYandexShipping(payload.shippingMethod)
    const totals = calcOrderTotals(
      resolved.cartLines,
      shipping?.amountCents ?? existing?.deliveryCents ?? 0
    )
    const tax = yandexReceiptTax()
    const items = resolved.items.map(({ product, quantity, measurements }) =>
      buildYandexCartItem({
        productId: product.id,
        title: product.title,
        quantity,
        unitPriceCents: product.priceCents,
        description: product.material,
        tax,
        measurements
      })
    )

    return {
      status: 'success',
      data: {
        currencyCode: 'RUB',
        availablePaymentMethods: yandexPaymentMethods(),
        enableCommentField: true,
        enableCoupons: false,
        metadata: payload.metadata || orderId,
        orderAmount: formatRubAmount(totals.totalCents),
        requiredFields: {
          billingContact: { email: true },
          shippingContact: { email: true, name: true, phone: true }
        },
        cart: buildYandexCart({
          orderId: existing?.id || orderId || resolved.cartLines[0].productId,
          items,
          subtotalCents: totals.subtotalCents
        }),
        shipping: {
          availableMethods: ['YANDEX_DELIVERY', 'PICKUP'],
          yandexDelivery: {
            warehouse: warehouseForRender()
          }
        }
      }
    }
  })
)
