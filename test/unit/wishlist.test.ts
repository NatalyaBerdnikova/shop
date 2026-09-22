import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWishlistStore } from '../../app/stores/wishlist'

const sample = {
  id: 'ring-aurora',
  productId: 'ring-aurora',
  slug: 'ring-aurora',
  title: 'Кольцо Aurora',
  unitPriceCents: 129900,
  imageUrl: 'https://example.com/a.jpg',
  category: 'Кольца'
}

describe('wishlist store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds and removes items', () => {
    const wishlist = useWishlistStore()
    expect(wishlist.isEmpty).toBe(true)
    wishlist.add(sample)
    expect(wishlist.count).toBe(1)
    expect(wishlist.has('ring-aurora')).toBe(true)
    wishlist.remove('ring-aurora')
    expect(wishlist.isEmpty).toBe(true)
  })

  it('toggles without duplicates', () => {
    const wishlist = useWishlistStore()
    expect(wishlist.toggle(sample)).toBe(true)
    expect(wishlist.toggle(sample)).toBe(false)
    expect(wishlist.count).toBe(0)
    wishlist.add(sample)
    wishlist.add(sample)
    expect(wishlist.count).toBe(1)
  })
})
