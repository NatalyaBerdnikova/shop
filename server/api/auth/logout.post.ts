import { AUTH_SESSION_COOKIE } from '~~/types/auth'

export default defineEventHandler((event) => {
  deleteCookie(event, AUTH_SESSION_COOKIE, { path: '/' })
  return { ok: true }
})
