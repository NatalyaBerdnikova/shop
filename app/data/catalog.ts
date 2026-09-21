import { mockCatalogProducts } from './catalog.mock'

export type { CatalogProduct } from './catalog.types'

/** Текущая витрина каталога (пока из моков; позже подставьте ответ API). */
export const catalogProducts = mockCatalogProducts

/** Известные слаги категорий (для валидации query) */
export const categorySlugSet = new Set(
  catalogProducts.map((p) => p.categorySlug)
)

/** Быстрый индекс по слагу для страницы товара */
const catalogBySlug = new Map(catalogProducts.map((p) => [p.slug, p] as const))
const catalogById = new Map(catalogProducts.map((p) => [p.id, p] as const))

export function getCatalogProductBySlug(slug: string) {
  return catalogBySlug.get(slug)
}

export function getCatalogProductById(id: string) {
  return catalogById.get(id)
}
