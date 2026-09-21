import type { OrderDelivery, OrderStatus } from '../types/order'
import type {
  YandexCart,
  YandexCartItem,
  YandexCartMeasurements,
  YandexPaymentStatus,
  YandexShippingMethod
} from '../types/yandexPay'
import { formatRubAmount, parseRubAmountToCents } from './money'

/** Типовая коробка для украшений, если у SKU нет своих габаритов. */
export const DEFAULT_PARCEL_MM = {
  weightGrams: 350,
  lengthMm: 180,
  widthMm: 120,
  heightMm: 60
} as const

export function mmToMeters(mm: number) {
  return Math.round(mm) / 1000
}

export function gramsToKg(grams: number) {
  return Math.round(grams) / 1000
}

export function parcelMeasurements(input?: {
  weightGrams?: number
  lengthMm?: number
  widthMm?: number
  heightMm?: number
}): YandexCartMeasurements {
  return {
    weight: gramsToKg(input?.weightGrams || DEFAULT_PARCEL_MM.weightGrams),
    length: mmToMeters(input?.lengthMm || DEFAULT_PARCEL_MM.lengthMm),
    width: mmToMeters(input?.widthMm || DEFAULT_PARCEL_MM.widthMm),
    height: mmToMeters(input?.heightMm || DEFAULT_PARCEL_MM.heightMm)
  }
}

export function combineParcels(
  parcels: YandexCartMeasurements[]
): YandexCartMeasurements {
  if (!parcels.length) return parcelMeasurements()
  return {
    weight: Number(
      parcels.reduce((sum, item) => sum + item.weight, 0).toFixed(3)
    ),
    length: Math.max(...parcels.map((item) => item.length)),
    width: Math.max(...parcels.map((item) => item.width)),
    height: Number(
      parcels.reduce((sum, item) => sum + item.height, 0).toFixed(3)
    )
  }
}

export function buildYandexCartItem(input: {
  productId: string
  title: string
  quantity: number
  unitPriceCents: number
  description?: string
  tax: number
  measurements?: YandexCartMeasurements
}): YandexCartItem {
  const totalCents = input.unitPriceCents * input.quantity
  const unit = formatRubAmount(input.unitPriceCents)
  const total = formatRubAmount(totalCents)
  return {
    productId: input.productId,
    title: input.title,
    description: input.description,
    quantity: { count: input.quantity },
    unitPrice: unit,
    discountedUnitPrice: unit,
    subtotal: total,
    total,
    receipt: {
      title: input.title,
      tax: input.tax
    },
    measurements: input.measurements
  }
}

export function buildYandexCart(input: {
  orderId: string
  items: YandexCartItem[]
  subtotalCents: number
}): YandexCart {
  const measurements = combineParcels(
    input.items
      .map((item) => item.measurements)
      .filter((value): value is YandexCartMeasurements => Boolean(value))
  )
  return {
    externalId: input.orderId,
    items: input.items,
    total: { amount: formatRubAmount(input.subtotalCents) },
    measurements
  }
}

export function mapYandexPaymentStatus(
  status?: YandexPaymentStatus | string | null
): OrderStatus {
  switch (status) {
    case 'CAPTURED':
    case 'CONFIRMED':
      return 'paid'
    case 'PENDING':
    case 'AUTHORIZED':
      return 'pending'
    case 'FAILED':
      return 'failed'
    case 'VOIDED':
      return 'cancelled'
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'refunded'
    default:
      return 'checkout'
  }
}

export function mapYandexShipping(
  shipping?: YandexShippingMethod | null,
  deliveryPrice?: string
): OrderDelivery | undefined {
  if (!shipping && !deliveryPrice) return undefined

  if (shipping?.methodType === 'YANDEX_DELIVERY' && shipping.yandexDeliveryOption) {
    const option = shipping.yandexDeliveryOption
    return {
      methodType: 'YANDEX_DELIVERY',
      title: option.title || 'Яндекс Доставка',
      provider: 'yandex',
      amountCents: parseRubAmountToCents(option.amount ?? deliveryPrice)
    }
  }

  if (shipping?.methodType === 'PICKUP' && shipping.pickupOption) {
    const option = shipping.pickupOption
    const provider = (option.provider || '').toLowerCase()
    return {
      methodType: 'PICKUP',
      title: option.title || 'Пункт выдачи',
      provider: provider.includes('cdek') ? 'cdek' : provider || 'pickup',
      amountCents: parseRubAmountToCents(option.amount ?? deliveryPrice),
      address: option.address,
      pickupPointId: option.pickupPointId,
      pickupPointName: option.title
    }
  }

  if (shipping?.courierOption) {
    return {
      methodType: shipping.methodType || 'COURIER',
      title: shipping.courierOption.title || 'Курьер',
      provider: shipping.courierOption.provider,
      amountCents: parseRubAmountToCents(
        shipping.courierOption.amount ?? deliveryPrice
      )
    }
  }

  if (deliveryPrice) {
    return {
      methodType: shipping?.methodType,
      amountCents: parseRubAmountToCents(deliveryPrice)
    }
  }

  return undefined
}

export function deliveryLabel(delivery?: OrderDelivery) {
  if (!delivery) return 'Яндекс Доставка или СДЭК — выбирается в чекауте Яндекса'
  if (delivery.provider === 'cdek') return 'СДЭК'
  if (delivery.provider === 'yandex' || delivery.methodType === 'YANDEX_DELIVERY') {
    return 'Яндекс Доставка'
  }
  return delivery.title || 'Доставка'
}
