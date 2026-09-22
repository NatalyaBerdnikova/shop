import type {
  YandexCreateOrderRequest,
  YandexCreateOrderResponse,
  YandexGetOrderResponse,
  YandexPaymentMethod
} from '~~/types/yandexPay'

function apiBase() {
  const config = useRuntimeConfig()
  return config.yandexPaySandbox
    ? 'https://sandbox.pay.yandex.ru/api/merchant/v1'
    : 'https://pay.yandex.ru/api/merchant/v1'
}

function apiKey() {
  const config = useRuntimeConfig()
  if (config.yandexPaySandbox) {
    return config.yandexPayApiKey || config.yandexPayMerchantId
  }
  return config.yandexPayApiKey
}

export function isYandexPayConfigured() {
  const config = useRuntimeConfig()
  return Boolean(config.yandexPayMerchantId && apiKey())
}

export function yandexPaymentMethods(): YandexPaymentMethod[] {
  const config = useRuntimeConfig()
  const raw = String(config.yandexPayMethods || 'CARD,SPLIT')
  const allowed: YandexPaymentMethod[] = ['CARD', 'SPLIT', 'SBPPAY']
  const methods = raw
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is YandexPaymentMethod =>
      allowed.includes(item as YandexPaymentMethod)
    )
  return methods.length ? methods : ['CARD', 'SPLIT']
}

export function yandexReceiptTax() {
  const config = useRuntimeConfig()
  const tax = Number(config.yandexPayReceiptTax)
  return Number.isInteger(tax) && tax >= 1 && tax <= 6 ? tax : 6
}

async function yandexFetch<T>(path: string, init?: RequestInit & { body?: unknown }) {
  const key = apiKey()
  if (!key) {
    throw createError({
      statusCode: 503,
      message: 'Яндекс Пэй не настроен: нет API-ключа'
    })
  }

  return await $fetch<T>(`${apiBase()}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `API-Key ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    body: init?.body as Record<string, unknown> | undefined
  })
}

export async function createYandexPayOrder(payload: YandexCreateOrderRequest) {
  return await yandexFetch<YandexCreateOrderResponse>('/orders', {
    method: 'POST',
    body: payload
  })
}

export async function getYandexPayOrder(orderId: string) {
  return await yandexFetch<YandexGetOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}`
  )
}

export function getPublicSiteUrl(event: Parameters<typeof getRequestURL>[0]) {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl || '').replace(/\/$/, '')
  if (configured) return configured
  const url = getRequestURL(event)
  return `${url.protocol}//${url.host}`
}

export function warehouseForRender() {
  const config = useRuntimeConfig()
  return {
    address: {
      country: 'RUS',
      locality: config.yandexWarehouseLocality || 'Москва',
      region: config.yandexWarehouseRegion || 'Москва',
      zip: config.yandexWarehouseZip || '',
      street: config.yandexWarehouseStreet || '',
      building: config.yandexWarehouseBuilding || '',
      addressLine: config.yandexWarehouseAddressLine || ''
    },
    contact: {
      firstName: config.yandexWarehouseContactName || 'amateru.st',
      phone: config.yandexWarehousePhone || '',
      email: config.yandexWarehouseEmail || ''
    }
  }
}
