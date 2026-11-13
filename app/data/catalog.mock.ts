/**
 * Каталог витрины.
 * Замените на загрузку с API / БД, когда бэкенд будет готов.
 */
import type { CatalogProduct } from './catalog.types'

export const mockCatalogProducts: CatalogProduct[] = [
  {
    id: 'strawberry-glass',
    slug: 'klubnika-v-stekle',
    title: 'Клубника в стекле',
    categorySlug: 'desserts',
    category: 'Десерты',
    priceCents: null,
    releasedAt: '2026-11-09',
    images: [],
    description:
      'Клубника в стекле — сладкий подарок ручной работы. Фото и актуальная цена — по запросу в Telegram или VK.',
    details: []
  }
]
