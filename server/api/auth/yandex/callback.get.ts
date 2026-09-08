import {
  AUTH_OAUTH_STATE_COOKIE,
  AUTH_SESSION_COOKIE
} from '~~/types/auth'
import {
  exchangeYandexCode,
  fetchYandexUserInfo,
  getYandexRedirectUri,
  mapYandexUserInfo
} from '../../../utils/yandexAuth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = String(
    config.yandexOauthClientId || config.public.yandexOauthClientId || ''
  )
  const clientSecret = String(config.yandexOauthClientSecret || '')

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 503,
      message: 'Яндекс ID не настроен на сервере'
    })
  }

  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const state = typeof query.state === 'string' ? query.state : ''
  const oauthError = typeof query.error === 'string' ? query.error : ''

  if (oauthError) {
    return sendRedirect(
      event,
      `/?auth=error&reason=${encodeURIComponent(oauthError)}`
    )
  }

  if (!code || !state) {
    return sendRedirect(event, '/?auth=error&reason=missing_code')
  }

  const stored = getCookie(event, AUTH_OAUTH_STATE_COOKIE) || ''
  const [storedState, redirectTo = '/'] = stored.split(':')
  deleteCookie(event, AUTH_OAUTH_STATE_COOKIE, { path: '/' })

  if (!storedState || storedState !== state) {
    return sendRedirect(event, '/?auth=error&reason=invalid_state')
  }

  const redirectUri = getYandexRedirectUri(getRequestURL(event).origin)

  try {
    const token = await exchangeYandexCode({
      code,
      clientId,
      clientSecret,
      redirectUri
    })
    const info = await fetchYandexUserInfo(token.access_token)
    const user = mapYandexUserInfo(info)

    setCookie(event, AUTH_SESSION_COOKIE, JSON.stringify(user), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    })

    const safeRedirect =
      redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/'

    const sep = safeRedirect.includes('?') ? '&' : '?'
    return sendRedirect(event, `${safeRedirect}${sep}auth=success`)
  } catch {
    return sendRedirect(event, '/?auth=error&reason=token_exchange')
  }
})
