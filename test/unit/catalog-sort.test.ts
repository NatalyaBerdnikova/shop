import { describe, expect, it } from 'vitest'
import {
  catalogSortQueryParam,
  parseCatalogSort,
  sortCatalogProducts,
  type CatalogSortable
} from '../../shared/catalogSort'

/** Фикстура из specs/001-catalog-sort/spec.md */
const fixture: CatalogSortable[] = [
  { id: 'b', priceCents: 100, releasedAt: '2026-01-02' },
  { id: 'a', priceCents: 100, releasedAt: '2026-01-01' },
  { id: 'd', priceCents: 200, releasedAt: '2025-06-01' },
  { id: 'c', priceCents: 50, releasedAt: 'not-a-date' }
]

describe('parseCatalogSort (spec 001)', () => {
  it.each([
    { input: undefined, expected: 'new' },
    { input: '', expected: 'new' },
    { input: 'foo', expected: 'new' },
    { input: 'new', expected: 'new' },
    { input: 'price-asc', expected: 'price-asc' },
    { input: 'price-desc', expected: 'price-desc' },
    { input: ['price-asc', 'new'], expected: 'price-asc' },
    { input: ['nope'], expected: 'new' }
  ] as const)('$input → $expected', ({ input, expected }) => {
    expect(parseCatalogSort(input)).toBe(expected)
  })
})

describe('catalogSortQueryParam (spec 001)', () => {
  it('не пишет дефолт в URL', () => {
    expect(catalogSortQueryParam('new')).toBeUndefined()
  })

  it('пишет ненулевой режим', () => {
    expect(catalogSortQueryParam('price-asc')).toBe('price-asc')
    expect(catalogSortQueryParam('price-desc')).toBe('price-desc')
  })
})

describe('sortCatalogProducts (spec 001)', () => {
  it.each([
    { sort: 'new' as const, ids: ['b', 'a', 'd', 'c'] },
    { sort: 'price-asc' as const, ids: ['c', 'a', 'b', 'd'] },
    { sort: 'price-desc' as const, ids: ['d', 'a', 'b', 'c'] }
  ])('$sort → $ids', ({ sort, ids }) => {
    expect(sortCatalogProducts(fixture, sort).map((item) => item.id)).toEqual(ids)
  })

  it('не мутирует исходный массив', () => {
    const snapshot = fixture.map((item) => item.id)
    sortCatalogProducts(fixture, 'price-asc')
    expect(fixture.map((item) => item.id)).toEqual(snapshot)
  })
})
