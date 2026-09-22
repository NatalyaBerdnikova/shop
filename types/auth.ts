/** Профиль пользователя после входа через Яндекс ID. */
export interface AuthUser {
  id: string
  login?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** Дата рождения YYYY-MM-DD, если Яндекс её отдал. */
  birthday: string | null
  displayName: string
}

export const AUTH_SESSION_COOKIE = 'amateru_auth_v1'
export const AUTH_OAUTH_STATE_COOKIE = 'amateru_oauth_state'

export const YANDEX_OAUTH_SCOPES = [
  'login:info',
  'login:email',
  'login:birthday',
  'login:default_phone'
] as const
