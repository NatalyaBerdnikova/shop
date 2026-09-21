export type YandexPayEnv = 'sandbox' | 'production'

export type YandexPaymentMethod = 'CARD' | 'SPLIT' | 'SBPPAY'

export type YandexPaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'VOIDED'
  | 'REFUNDED'
  | 'CONFIRMED'
  | 'PARTIALLY_REFUNDED'
  | 'FAILED'

export interface YandexMoneyAmount {
  amount: string
  label?: string
}

export interface YandexCartQuantity {
  count: number
}

export interface YandexCartMeasurements {
  weight: number
  height: number
  length: number
  width: number
}

export interface YandexCartItem {
  productId: string
  title: string
  quantity: YandexCartQuantity
  total: string
  unitPrice?: string
  discountedUnitPrice?: string
  subtotal?: string
  description?: string
  receipt?: {
    title?: string
    tax: number
  }
  measurements?: YandexCartMeasurements
}

export interface YandexCart {
  externalId?: string
  items: YandexCartItem[]
  total: YandexMoneyAmount
  measurements?: YandexCartMeasurements
}

export interface YandexCreateOrderRequest {
  orderId: string
  currencyCode: 'RUB'
  availablePaymentMethods: YandexPaymentMethod[]
  cart: YandexCart
  metadata?: string
  ttl?: number
  redirectUrls: {
    onSuccess: string
    onError: string
    onAbort?: string
  }
}

export interface YandexCreateOrderResponse {
  code: number
  status: string
  data?: {
    paymentUrl?: string
  }
  reasonCode?: string
  reason?: string
}

export interface YandexShippingMethod {
  methodType?: string
  courierOption?: {
    title?: string
    amount?: string
    provider?: string
  } | null
  pickupOption?: {
    title?: string
    amount?: string
    address?: string
    pickupPointId?: string
    provider?: string
  } | null
  yandexDeliveryOption?: {
    title?: string
    amount?: string
    yandexDeliveryOptionId?: string
  } | null
}

export interface YandexOrderDetails {
  orderId: string
  paymentStatus?: YandexPaymentStatus | null
  orderAmount?: string
  paymentMethod?: {
    methodType?: string
    cardLast4?: string
    cardNetwork?: string
  }
  shippingMethod?: YandexShippingMethod | null
  metadata?: string
}

export interface YandexGetOrderResponse {
  code: number
  status: string
  data?: {
    delivery?: {
      price?: string
      actualPrice?: string
      status?: string
    }
    order?: YandexOrderDetails
  }
}

export interface YandexWebhookPayload {
  merchantId?: string
  event?: string
  eventTime?: string
  order?: {
    orderId?: string
    paymentStatus?: YandexPaymentStatus
  }
  operation?: {
    orderId?: string
    status?: string
    operationType?: string
  }
}

export interface YandexMerchantFailBody {
  status: 'fail'
  reasonCode: string
  reason: string
}
