/**
 * Публичный origin для canonical и Open Graph.
 * Во время `nuxt generate` хост пререндера — localhost; без NUXT_PUBLIC_SITE_URL
 * его нельзя записывать в статичный HTML.
 */
export function resolvePublicSiteUrl(
  configured: string | undefined | null,
  requestOrigin: string,
  isPrerender: boolean
): string {
  const fromConfig = String(configured || '')
    .trim()
    .replace(/\/$/, '')
  if (fromConfig) return fromConfig
  if (isPrerender) return ''
  return String(requestOrigin || '')
    .trim()
    .replace(/\/$/, '')
}
