import type { AuthUser } from '~~/types/auth'

/** Ответ login.yandex.ru/info (поля зависят от scope). */
export interface YandexUserInfo {
  id: string
  login?: string
  display_name?: string
  real_name?: string
  first_name?: string
  last_name?: string
  default_email?: string
  emails?: string[]
  birthday?: string | null
  default_phone?: {
    id?: number
    number?: string
  } | null
}

export function mapYandexUserInfo(info: YandexUserInfo): AuthUser {
  const firstName = (info.first_name ?? '').trim()
  const lastName = (info.last_name ?? '').trim()
  const email = (info.default_email ?? info.emails?.[0] ?? '').trim()
  const phone = (info.default_phone?.number ?? '').trim()
  const birthday =
    typeof info.birthday === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(info.birthday)
      ? info.birthday
      : null

  const fromNames = `${firstName} ${lastName}`.trim()
  const displayName = (
    info.display_name ||
    info.real_name ||
    fromNames ||
    info.login ||
    'Пользователь'
  ).trim()

  return {
    id: String(info.id),
    login: info.login,
    firstName,
    lastName,
    email,
    phone,
    birthday,
    displayName
  }
}

export async function fetchYandexUserInfo(accessToken: string) {
  return await $fetch<YandexUserInfo>('https://login.yandex.ru/info', {
    query: { format: 'json' },
    headers: {
      Authorization: `OAuth ${accessToken}`
    }
  })
}

export async function exchangeYandexCode(params: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri
  })

  return await $fetch<{
    access_token: string
    expires_in?: number
    refresh_token?: string
    token_type?: string
  }>('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })
}

export function getYandexRedirectUri(origin: string) {
  return `${origin}/api/auth/yandex/callback`
}
