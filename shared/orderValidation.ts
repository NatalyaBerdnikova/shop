import type { CartLine } from '../types/cart'
import type {
  CheckoutFormInput,
  CreateOrderPayload,
  DeliveryCarrier,
  OrderTotals,
  PaymentMethod,
  PickupPointSelection
} from '../types/order'
import {
  DELIVERY_CARRIERS,
  FREE_DELIVERY_MIN_CENTS,
  PAYMENT_METHODS
} from '../types/order'

export type CheckoutFieldErrors = Partial<
  Record<
    | 'name'
    | 'phone'
    | 'email'
    | 'carrier'
    | 'city'
    | 'pickupPoint'
    | 'paymentMethod'
    | 'lines'
    | 'form',
    string
  >
>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(?:\+7|7|8)\d{10}$/

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7${digits.slice(1)}`
  }
  if (digits.length === 10) {
    return `+7${digits}`
  }
  return phone.trim()
}

export function isDeliveryCarrier(value: unknown): value is DeliveryCarrier {
  return (
    typeof value === 'string' &&
    (DELIVERY_CARRIERS as readonly string[]).includes(value)
  )
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === 'string' &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  )
}

function isPickupPoint(value: unknown): value is PickupPointSelection {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return (
    typeof point.id === 'string' &&
    isDeliveryCarrier(point.carrier) &&
    typeof point.name === 'string' &&
    typeof point.city === 'string' &&
    typeof point.address === 'string' &&
    typeof point.deliveryCents === 'number' &&
    Number.isFinite(point.deliveryCents) &&
    point.deliveryCents >= 0
  )
}

export function calcOrderTotals(
  lines: CartLine[],
  pickupPoint: PickupPointSelection | null
): OrderTotals {
  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  )
  const baseDelivery = pickupPoint?.deliveryCents ?? 0
  const freeDeliveryApplied =
    Boolean(pickupPoint) && subtotalCents >= FREE_DELIVERY_MIN_CENTS
  const deliveryCents = freeDeliveryApplied ? 0 : baseDelivery

  return {
    subtotalCents,
    deliveryCents,
    totalCents: subtotalCents + deliveryCents,
    freeDeliveryApplied
  }
}

export function validateCheckoutForm(
  input: CheckoutFormInput
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {}
  const name = input.contact.name.trim()
  const phone = normalizePhone(input.contact.phone)
  const email = input.contact.email.trim()

  if (name.length < 2) errors.name = 'Укажите имя'
  if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Укажите телефон в формате +7XXXXXXXXXX'
  }
  if (!EMAIL_RE.test(email)) errors.email = 'Укажите корректный email'

  if (!isDeliveryCarrier(input.delivery.carrier)) {
    errors.carrier = 'Выберите службу доставки'
  }

  if (!input.delivery.city.trim()) {
    errors.city = 'Укажите город'
  }

  if (!input.delivery.pickupPoint) {
    errors.pickupPoint = 'Выберите пункт выдачи'
  } else if (
    input.delivery.pickupPoint.carrier !== input.delivery.carrier
  ) {
    errors.pickupPoint = 'Пункт выдачи не соответствует службе доставки'
  }

  if (!isPaymentMethod(input.paymentMethod)) {
    errors.paymentMethod = 'Выберите способ оплаты'
  }

  return errors
}

export function validateCreateOrderPayload(
  payload: unknown
):
  | { ok: true; data: CreateOrderPayload }
  | { ok: false; errors: CheckoutFieldErrors } {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: { form: 'Некорректные данные заказа' } }
  }

  const body = payload as Partial<CreateOrderPayload>
  const lines = Array.isArray(body.lines)
    ? body.lines.filter((line) => {
        if (!line || typeof line !== 'object') return false
        const item = line as Record<string, unknown>
        return (
          typeof item.id === 'string' &&
          typeof item.productId === 'string' &&
          typeof item.title === 'string' &&
          typeof item.unitPriceCents === 'number' &&
          Number.isInteger(item.quantity) &&
          (item.quantity as number) > 0 &&
          (item.quantity as number) <= 99
        )
      })
    : []

  if (!lines.length) {
    return { ok: false, errors: { lines: 'Корзина пуста' } }
  }

  const pickupPoint = isPickupPoint(body.delivery?.pickupPoint)
    ? {
        id: body.delivery!.pickupPoint!.id,
        carrier: body.delivery!.pickupPoint!.carrier,
        name: body.delivery!.pickupPoint!.name,
        city: body.delivery!.pickupPoint!.city,
        address: body.delivery!.pickupPoint!.address,
        schedule: body.delivery!.pickupPoint!.schedule,
        deliveryCents: Math.round(body.delivery!.pickupPoint!.deliveryCents),
        etaDaysMin: body.delivery!.pickupPoint!.etaDaysMin,
        etaDaysMax: body.delivery!.pickupPoint!.etaDaysMax
      }
    : null

  const form: CheckoutFormInput = {
    contact: {
      name: String(body.contact?.name ?? ''),
      phone: String(body.contact?.phone ?? ''),
      email: String(body.contact?.email ?? '')
    },
    delivery: {
      carrier: (body.delivery?.carrier as DeliveryCarrier) ?? 'yandex',
      city: String(body.delivery?.city ?? ''),
      pickupPoint
    },
    paymentMethod: (body.paymentMethod as PaymentMethod) ?? 'card_online',
    comment: String(body.comment ?? '').trim().slice(0, 500)
  }

  const errors = validateCheckoutForm(form)
  if (Object.keys(errors).length) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      ...form,
      contact: {
        name: form.contact.name.trim(),
        phone: normalizePhone(form.contact.phone),
        email: form.contact.email.trim().toLowerCase()
      },
      delivery: {
        carrier: form.delivery.carrier,
        city: form.delivery.city.trim(),
        pickupPoint: form.delivery.pickupPoint
      },
      lines: lines.map((line) => ({
        id: line.id,
        productId: line.productId,
        slug: line.slug,
        title: line.title,
        unitPriceCents: Math.round(line.unitPriceCents),
        quantity: line.quantity,
        imageUrl: line.imageUrl
      }))
    }
  }
}
