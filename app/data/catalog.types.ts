export interface CatalogProduct {
  id: string
  slug: string
  title: string
  /** Слаг категории для URL (латиница) */
  categorySlug: string
  category: string
  material: string
  priceCents: number
  /** Дата появления в каталоге (для сортировки «по новизне») */
  releasedAt: string
  images: string[]
  description: string
  details: string[]
}
