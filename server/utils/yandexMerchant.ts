import type { H3Event } from 'h3'
import type { YandexMerchantFailBody } from '~~/types/yandexPay'
import {
  readYandexPayJwt,
  sendYandexPayAuthError
} from '../utils/yandexPayJwt'

export async function withYandexPayJwt<T extends Record<string, unknown>>(
  event: H3Event,
  handler: (payload: T) => Promise<unknown> | unknown
) {
  try {
    const payload = await readYandexPayJwt<T>(event)
    return await handler(payload)
  } catch (error) {
    const mapped = sendYandexPayAuthError(error)
    setResponseStatus(event, mapped.statusCode)
    return mapped.body
  }
}

export function yandexFail(
  event: H3Event,
  statusCode: number,
  reasonCode: string,
  reason: string
): YandexMerchantFailBody {
  setResponseStatus(event, statusCode)
  return { status: 'fail', reasonCode, reason }
}
