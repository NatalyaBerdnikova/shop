export interface CatalogProduct {
  id: string
  slug: string
  title: string
  /** Слаг категории для URL (латиница) */
  categorySlug: string
  category: string
  /** Цена в копейках; null — цена уточняется у продавца */
  priceCents: number | null
  /** Дата появления в каталоге (для сортировки «по новизне») */
  releasedAt: string
  images: string[]
  description: string
  details: string[]
}
