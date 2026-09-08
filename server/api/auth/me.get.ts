import type { AuthUser } from '~~/types/auth'
import { AUTH_SESSION_COOKIE } from '~~/types/auth'

function parseUser(raw: string | undefined): AuthUser | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as AuthUser
    if (!data || typeof data !== 'object' || typeof data.id !== 'string') {
      return null
    }
    return {
      id: data.id,
      login: data.login,
      firstName: String(data.firstName ?? ''),
      lastName: String(data.lastName ?? ''),
      email: String(data.email ?? ''),
      phone: String(data.phone ?? ''),
      birthday: data.birthday ?? null,
      displayName: String(data.displayName ?? 'Пользователь')
    }
  } catch {
    return null
  }
}

export default defineEventHandler((event) => {
  const user = parseUser(getCookie(event, AUTH_SESSION_COOKIE))
  return { user }
})
