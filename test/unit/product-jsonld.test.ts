import { describe, expect, it } from 'vitest'
import { buildProductJsonLd } from '../../app/utils/productJsonLd'
import type { CatalogProduct } from '../../app/data/catalog.types'

const sample: CatalogProduct = {
  id: 'ring-aurora',
  slug: 'ring-aurora',
  title: 'Кольцо Aurora',
  categorySlug: 'rings',
  category: 'Кольца',
  material: 'Серебро 925',
  priceCents: 129900,
  releasedAt: '2025-11-02',
  images: [
    'https://images.unsplash.com/photo-1',
    '/decor/cover.png'
  ],
  description: 'Минималистичное кольцо.',
  details: ['Вес: 4.1 г', 'Ручная полировка'],
  weightGrams: 120
}

describe('buildProductJsonLd', () => {
  it('maps product fields into Schema.org Product graph', () => {
    const json = buildProductJsonLd({
      product: sample,
      siteUrl: 'https://amateru.st',
      path: '/catalog/ring-aurora'
    })

    const product = (json['@graph'] as Array<Record<string, unknown>>).find(
      (n) => n['@type'] === 'Product'
    )

    expect(product?.name).toBe('Кольцо Aurora')
    expect(product?.sku).toBe('ring-aurora')
    expect(product?.material).toBe('Серебро 925')
    expect((product?.offers as { price: string }).price).toBe('1299.00')
    expect(product?.image).toEqual([
      'https://images.unsplash.com/photo-1',
      'https://amateru.st/decor/cover.png'
    ])
    expect(product?.weight).toEqual({
      '@type': 'QuantitativeValue',
      value: 120,
      unitCode: 'GRM'
    })
  })
})
