export const CATALOG_SORT_VALUES = ['new', 'price-asc', 'price-desc'] as const
export type CatalogSortValue = (typeof CATALOG_SORT_VALUES)[number]

export const DEFAULT_CATALOG_SORT: CatalogSortValue = 'new'

export const CATALOG_SORT_OPTIONS: {
  value: CatalogSortValue
  label: string
}[] = [
  { value: 'new', label: 'По новизне' },
  { value: 'price-asc', label: 'Цена ↑' },
  { value: 'price-desc', label: 'Цена ↓' }
]

export function isCatalogSortValue(value: unknown): value is CatalogSortValue {
  return (
    typeof value === 'string' &&
    (CATALOG_SORT_VALUES as readonly string[]).includes(value)
  )
}

/**
 * Query `sort` → допустимое значение. Поведение: specs/001-catalog-sort/spec.md
 */
export function parseCatalogSort(value: unknown): CatalogSortValue {
  if (Array.isArray(value)) return parseCatalogSort(value[0])
  return isCatalogSortValue(value) ? value : DEFAULT_CATALOG_SORT
}

/** Дефолт в URL не пишем. */
export function catalogSortQueryParam(sort: CatalogSortValue) {
  return sort === DEFAULT_CATALOG_SORT ? undefined : sort
}

export interface CatalogSortable {
  id: string
  priceCents: number
  releasedAt: string
}

function releasedAtTime(value: string) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function compareId(a: string, b: string) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function sortCatalogProducts<T extends CatalogSortable>(
  products: readonly T[],
  sort: CatalogSortValue
): T[] {
  return [...products].sort((left, right) => {
    if (sort === 'price-asc') {
      const byPrice = left.priceCents - right.priceCents
      return byPrice !== 0 ? byPrice : compareId(left.id, right.id)
    }
    if (sort === 'price-desc') {
      const byPrice = right.priceCents - left.priceCents
      return byPrice !== 0 ? byPrice : compareId(left.id, right.id)
    }
    const byDate = releasedAtTime(right.releasedAt) - releasedAtTime(left.releasedAt)
    return byDate !== 0 ? byDate : compareId(left.id, right.id)
  })
}
