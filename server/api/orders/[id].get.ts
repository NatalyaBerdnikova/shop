import { getOrder } from '../../utils/orders'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан номер заказа' })
  }

  const order = await getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Заказ не найден' })
  }

  return order
})
