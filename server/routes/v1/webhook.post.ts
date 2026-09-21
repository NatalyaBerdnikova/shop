import type { YandexWebhookPayload } from '~~/types/yandexPay'
import { getOrder, patchOrder } from '../../utils/orders'
import { withYandexPayJwt } from '../../utils/yandexMerchant'
import { applyWebhookPayment } from '../../utils/yandexPaySync'

export default defineEventHandler((event) =>
  withYandexPayJwt<YandexWebhookPayload>(event, async (payload) => {
    const orderId = payload.order?.orderId || payload.operation?.orderId
    if (!orderId) {
      return { status: 'success' }
    }

    const order = await getOrder(orderId)
    if (!order) {
      return { status: 'success' }
    }

    if (payload.event === 'ORDER_STATUS_UPDATED' && payload.order?.paymentStatus) {
      await patchOrder(order.id, applyWebhookPayment(order, payload.order.paymentStatus))
    }

    return { status: 'success' }
  })
)
