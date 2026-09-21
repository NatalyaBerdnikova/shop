import { getOrder } from '../../../utils/orders'
import { isYandexPayConfigured } from '../../../utils/yandexPayClient'
import { syncOrderFromYandex } from '../../../utils/yandexPaySync'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан номер заказа' })
  }

  const order = await getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Заказ не найден' })
  }

  if (!isYandexPayConfigured()) return order

  try {
    return await syncOrderFromYandex(order)
  } catch {
    return order
  }
})
