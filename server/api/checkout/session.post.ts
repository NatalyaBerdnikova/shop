import { validateCheckoutSession, calcOrderTotals } from '#shared/orderValidation'
import {
  buildYandexCart,
  buildYandexCartItem
} from '#shared/yandexPay'
import { resolveCheckoutLines } from '../../utils/catalog'
import { createCheckoutOrder, patchOrder } from '../../utils/orders'
import {
  createYandexPayOrder,
  getPublicSiteUrl,
  isYandexPayConfigured,
  yandexPaymentMethods,
  yandexReceiptTax
} from '../../utils/yandexPayClient'

export default defineEventHandler(async (event) => {
  if (!isYandexPayConfigured()) {
    throw createError({
      statusCode: 503,
      message:
        'Чекаут Яндекса ещё не подключён. Добавьте merchant id и API-ключ в окружение.'
    })
  }

  const body = await readBody(event)
  const parsed = validateCheckoutSession(body)
  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      message: 'Ошибка валидации',
      data: { errors: parsed.errors }
    })
  }

  const resolved = resolveCheckoutLines(parsed.data.lines)
  if (!resolved.ok) {
    throw createError({
      statusCode: 400,
      message: 'Ошибка валидации',
      data: {
        errors: {
          lines: 'Некоторые товары больше недоступны. Обновите корзину.'
        }
      }
    })
  }

  const tax = yandexReceiptTax()
  const totals = calcOrderTotals(resolved.cartLines)
  const order = await createCheckoutOrder({
    lines: resolved.cartLines,
    comment: parsed.data.comment ?? ''
  })

  const siteUrl = getPublicSiteUrl(event)
  const yandexItems = resolved.items.map(({ product, quantity, measurements }) =>
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

  try {
    const yandex = await createYandexPayOrder({
      orderId: order.id,
      currencyCode: 'RUB',
      availablePaymentMethods: yandexPaymentMethods(),
      cart: buildYandexCart({
        orderId: order.id,
        items: yandexItems,
        subtotalCents: totals.subtotalCents
      }),
      metadata: JSON.stringify({
        comment: order.comment || undefined
      }),
      ttl: 1800,
      redirectUrls: {
        onSuccess: `${siteUrl}/order/${order.id}?pay=success`,
        onError: `${siteUrl}/order/${order.id}?pay=error`,
        onAbort: `${siteUrl}/checkout?pay=abort`
      }
    })

    const paymentUrl = yandex.data?.paymentUrl
    if (!paymentUrl) {
      await patchOrder(order.id, { status: 'failed' })
      throw createError({
        statusCode: 502,
        message: yandex.reason || 'Яндекс Пэй не вернул ссылку на чекаут'
      })
    }

    const saved = await patchOrder(order.id, {
      status: 'pending',
      paymentUrl,
      paymentStatus: 'PENDING'
    })

    return {
      orderId: order.id,
      paymentUrl,
      order: saved
    }
  } catch (error) {
    await patchOrder(order.id, { status: 'failed' }).catch(() => undefined)
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof (error as { statusCode?: number }).statusCode === 'number'
    ) {
      throw error
    }
    const fetchError = error as { data?: { reason?: string }; message?: string }
    throw createError({
      statusCode: 502,
      message:
        fetchError.data?.reason ||
        fetchError.message ||
        'Не удалось открыть чекаут Яндекса'
    })
  }
})
