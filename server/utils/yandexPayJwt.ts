import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from 'jose'
import type { YandexMerchantFailBody } from '~~/types/yandexPay'

function jwksUrl() {
  const config = useRuntimeConfig()
  return config.yandexPaySandbox
    ? 'https://sandbox.pay.yandex.ru/api/jwks'
    : 'https://pay.yandex.ru/api/jwks'
}

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function getJwks() {
  const url = jwksUrl()
  let jwks = jwksByUrl.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksByUrl.set(url, jwks)
  }
  return jwks
}

export class YandexPayAuthError extends Error {
  reasonCode: string

  constructor(reasonCode: string, message: string) {
    super(message)
    this.reasonCode = reasonCode
  }

  toBody(): YandexMerchantFailBody {
    return {
      status: 'fail',
      reasonCode: this.reasonCode,
      reason: this.message
    }
  }
}

export async function verifyYandexPayJwt<T extends Record<string, unknown>>(
  token: string
): Promise<T> {
  const config = useRuntimeConfig()
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      algorithms: ['ES256']
    })
    const merchantId = String(payload.merchantId ?? '')
    if (config.yandexPayMerchantId && merchantId !== config.yandexPayMerchantId) {
      throw new YandexPayAuthError('OTHER', 'Invalid merchantId')
    }
    return payload as T
  } catch (error) {
    if (error instanceof YandexPayAuthError) throw error
    if (error instanceof joseErrors.JWTExpired) {
      throw new YandexPayAuthError('TOKEN_EXPIRED', 'JWT token has expired')
    }
    throw new YandexPayAuthError('UNAUTHORIZED', 'Invalid token signature')
  }
}

export async function readYandexPayJwt<T extends Record<string, unknown>>(
  event: Parameters<typeof readRawBody>[0]
): Promise<T> {
  const raw = await readRawBody(event, 'utf8')
  const token = raw?.trim()
  if (!token) {
    throw new YandexPayAuthError('UNAUTHORIZED', 'Empty request body')
  }
  return verifyYandexPayJwt<T>(token)
}

export function sendYandexPayAuthError(error: unknown) {
  if (error instanceof YandexPayAuthError) {
    return {
      statusCode: error.reasonCode === 'TOKEN_EXPIRED' ? 401 : 401,
      body: error.toBody()
    }
  }
  return {
    statusCode: 401,
    body: {
      status: 'fail' as const,
      reasonCode: 'UNAUTHORIZED',
      reason: 'Invalid token'
    }
  }
}
