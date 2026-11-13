import { describe, expect, it } from 'vitest'
import { buildProductJsonLd } from '../../app/utils/productJsonLd'
import type { CatalogProduct } from '../../app/data/catalog.types'

const sample: CatalogProduct = {
  id: 'strawberry-glass',
  slug: 'klubnika-v-stekle',
  title: 'Клубника в стекле',
  categorySlug: 'desserts',
  category: 'Десерты',
  priceCents: null,
  releasedAt: '2026-11-09',
  images: ['/decor/cover.png'],
  description: 'Клубника в стекле — сладкий подарок.',
  details: ['Формат: стекло']
}

describe('buildProductJsonLd', () => {
  it('maps product fields into Schema.org Product graph without required price', () => {
    const json = buildProductJsonLd({
      product: sample,
      siteUrl: 'https://amateru.st',
      path: '/catalog/klubnika-v-stekle'
    })

    const product = (json['@graph'] as Array<Record<string, unknown>>).find(
      (n) => n['@type'] === 'Product'
    )

    expect(product?.name).toBe('Клубника в стекле')
    expect(product?.sku).toBe('strawberry-glass')
    expect(product?.material).toBeUndefined()
    expect((product?.offers as { price?: string }).price).toBeUndefined()
    expect(product?.image).toBe('https://amateru.st/decor/cover.png')
  })

  it('includes offer price when priceCents is set', () => {
    const json = buildProductJsonLd({
      product: { ...sample, priceCents: 250000 },
      siteUrl: 'https://amateru.st',
      path: '/catalog/klubnika-v-stekle'
    })

    const product = (json['@graph'] as Array<Record<string, unknown>>).find(
      (n) => n['@type'] === 'Product'
    )

    expect((product?.offers as { price: string }).price).toBe('2500.00')
  })
})
