import { catalogProducts } from '../app/data/catalog'

/** Страницы с собственным HTML. Ссылки меню и подвала должны входить в этот список. */
export const staticContentRoutes = [
  '/',
  '/catalog',
  '/delivery',
  '/privacy',
  '/return',
  '/offer'
] as const

export const catalogProductRoutes = catalogProducts.map(
  (product) => `/catalog/${product.slug}`
)

/** Маршруты, которые `nuxt generate` обязан записать в `.output/public`. */
export const staticPrerenderRoutes = [
  ...staticContentRoutes,
  ...catalogProductRoutes
]
