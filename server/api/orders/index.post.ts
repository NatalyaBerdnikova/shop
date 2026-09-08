import { validateCreateOrderPayload } from '#shared/orderValidation'
import { saveOrder } from '../../utils/orders'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = validateCreateOrderPayload(body)

  if (!result.ok) {
    throw createError({
      statusCode: 400,
      message: 'Ошибка валидации',
      data: { errors: result.errors }
    })
  }

  const order = await saveOrder(result.data)
  setResponseStatus(event, 201)
  return order
})
