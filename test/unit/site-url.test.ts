import { describe, expect, it } from 'vitest'
import {
  footerLegalLinks,
  footerServiceLinks,
  primaryNavLinks
} from '../../app/data/navigation'
import { catalogProducts } from '../../app/data/catalog'
import { resolvePublicSiteUrl } from '../../app/utils/siteUrl'
import {
  catalogProductRoutes,
  staticContentRoutes
} from '../../shared/staticRoutes'

describe('resolvePublicSiteUrl', () => {
  it('uses the configured public origin and strips a trailing slash', () => {
    expect(
      resolvePublicSiteUrl(
        'https://amateru.st/',
        'http://localhost:3000',
        true
      )
    ).toBe('https://amateru.st')
  })

  it('does not bake the prerender host when the public origin is empty', () => {
    expect(resolvePublicSiteUrl('', 'http://localhost:3000', true)).toBe('')
    expect(resolvePublicSiteUrl('  ', 'http://127.0.0.1:3000', true)).toBe('')
  })

  it('keeps the request origin for a live server render', () => {
    expect(
      resolvePublicSiteUrl(undefined, 'http://localhost:3000/', false)
    ).toBe('http://localhost:3000')
  })
})

describe('static prerender routes', () => {
  it('includes a page for every catalog product', () => {
    expect(catalogProductRoutes).toEqual(
      catalogProducts.map((product) => `/catalog/${product.slug}`)
    )
    expect(new Set(catalogProductRoutes).size).toBe(catalogProducts.length)
  })

  it('includes every menu and footer route', () => {
    const linked = [
      ...primaryNavLinks,
      ...footerServiceLinks,
      ...footerLegalLinks
    ].map((link) => link.to)
    for (const path of linked) {
      expect(staticContentRoutes).toContain(path)
    }
  })
})
