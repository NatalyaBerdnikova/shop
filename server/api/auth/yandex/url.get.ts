import { randomBytes } from 'node:crypto'
import {
  AUTH_OAUTH_STATE_COOKIE,
  YANDEX_OAUTH_SCOPES
} from '~~/types/auth'
import { getYandexRedirectUri } from '../../../utils/yandexAuth'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const clientId = String(
    config.yandexOauthClientId || config.public.yandexOauthClientId || ''
  )

  if (!clientId) {
    throw createError({
      statusCode: 503,
      message:
        'Яндекс ID не настроен: укажите NUXT_YANDEX_OAUTH_CLIENT_ID и NUXT_YANDEX_OAUTH_CLIENT_SECRET'
    })
  }

  const query = getQuery(event)
  const redirectTo =
    typeof query.redirect === 'string' && query.redirect.startsWith('/')
      ? query.redirect
      : '/'

  const state = randomBytes(16).toString('hex')
  setCookie(event, AUTH_OAUTH_STATE_COOKIE, `${state}:${redirectTo}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10
  })

  const redirectUri = getYandexRedirectUri(getRequestURL(event).origin)
  const authorizeUrl = new URL('https://oauth.yandex.ru/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', YANDEX_OAUTH_SCOPES.join(' '))
  authorizeUrl.searchParams.set('force_confirm', 'yes')
  authorizeUrl.searchParams.set('state', state)

  return { url: authorizeUrl.toString() }
})
