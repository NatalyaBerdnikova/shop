import { describe, expect, it } from 'vitest'
import { formatRubAmount, parseRubAmountToCents } from '../../shared/money'
import {
  calcOrderTotals,
  validateCheckoutSession
} from '../../shared/orderValidation'
import {
  buildYandexCart,
  buildYandexCartItem,
  mapYandexPaymentStatus,
  mapYandexShipping,
  parcelMeasurements
} from '../../shared/yandexPay'

describe('checkout session validation', () => {
  it('rejects empty payload', () => {
    expect(validateCheckoutSession(null).ok).toBe(false)
  })

  it('merges duplicate product lines', () => {
    const result = validateCheckoutSession({
      comment: '  упаковать отдельно  ',
      lines: [
        { productId: 'ring-aurora', quantity: 1 },
        { productId: 'ring-aurora', quantity: 2 }
      ]
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.lines).toEqual([
      { productId: 'ring-aurora', quantity: 3 }
    ])
    expect(result.data.comment).toBe('упаковать отдельно')
  })
})

describe('order totals', () => {
  it('adds delivery to subtotal', () => {
    expect(
      calcOrderTotals([{ unitPriceCents: 100_000, quantity: 2 }], 35000)
    ).toEqual({
      subtotalCents: 200_000,
      deliveryCents: 35000,
      totalCents: 235_000
    })
  })
})

describe('yandex pay cart', () => {
  it('formats money with two decimals', () => {
    expect(formatRubAmount(129900)).toBe('1299.00')
    expect(parseRubAmountToCents('12.34')).toBe(1234)
  })

  it('builds cart item totals from catalog prices', () => {
    const item = buildYandexCartItem({
      productId: 'ring-aurora',
      title: 'Кольцо Aurora',
      quantity: 2,
      unitPriceCents: 129900,
      tax: 6,
      measurements: parcelMeasurements()
    })
    expect(item.total).toBe('2598.00')
    expect(item.quantity.count).toBe(2)
  })

  it('maps payment and pickup shipping', () => {
    expect(mapYandexPaymentStatus('CAPTURED')).toBe('paid')
    expect(
      mapYandexShipping({
        methodType: 'PICKUP',
        pickupOption: {
          title: 'СДЭК Арбат',
          amount: '290.00',
          address: 'Арбат, 1',
          pickupPointId: 'cdek-1',
          provider: 'CDEK'
        }
      })
    ).toMatchObject({
      provider: 'cdek',
      amountCents: 29000,
      pickupPointName: 'СДЭК Арбат'
    })
  })

  it('keeps external order id on the cart', () => {
    const cart = buildYandexCart({
      orderId: 'CT-ABCDEF',
      items: [
        buildYandexCartItem({
          productId: 'ring-aurora',
          title: 'Кольцо Aurora',
          quantity: 1,
          unitPriceCents: 10000,
          tax: 6
        })
      ],
      subtotalCents: 10000
    })
    expect(cart.externalId).toBe('CT-ABCDEF')
    expect(cart.total.amount).toBe('100.00')
  })
})
