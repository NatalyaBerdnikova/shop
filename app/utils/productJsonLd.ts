import type { CatalogProduct } from '~/data/catalog.types'

function trimTrailingSlash(url: string) {
  return url.replace(/\/$/, '')
}

/** Абсолютный URL для schema.org / Open Graph. */
export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string): string {
  if (!pathOrUrl) return ''
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base = trimTrailingSlash(siteUrl || '')
  if (!base) return pathOrUrl
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

function priceRub(priceCents: number): string {
  return (Math.round(priceCents) / 100).toFixed(2)
}

function buildAdditionalProperties(product: CatalogProduct) {
  const props: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string
  }> = [
    {
      '@type': 'PropertyValue',
      name: 'Категория',
      value: product.category
    }
  ]

  for (const detail of product.details) {
    const sep = detail.indexOf(':')
    if (sep > 0) {
      props.push({
        '@type': 'PropertyValue',
        name: detail.slice(0, sep).trim(),
        value: detail.slice(sep + 1).trim()
      })
    } else if (detail.trim()) {
      props.push({
        '@type': 'PropertyValue',
        name: 'Характеристика',
        value: detail
      })
    }
  }

  return props
}

export type ProductJsonLdInput = {
  product: CatalogProduct
  siteUrl: string
  /** Полный путь страницы, напр. `/catalog/klubnika-v-stekle` */
  path: string
}

/**
 * Schema.org Product + BreadcrumbList (JSON-LD).
 * Источник — объект товара (мок / API / БД); поля мапятся 1:1.
 */
export function buildProductJsonLd(input: ProductJsonLdInput) {
  const { product, siteUrl, path } = input
  const base = trimTrailingSlash(siteUrl || '')
  const productUrl = toAbsoluteUrl(path, base)
  const catalogUrl = toAbsoluteUrl('/catalog', base)
  const images = product.images
    .map((src) => toAbsoluteUrl(src, base))
    .filter(Boolean)

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    url: productUrl,
    priceCurrency: 'RUB',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: 'amateru.st',
      url: base || undefined
    }
  }

  if (product.priceCents != null && product.priceCents >= 0) {
    offers.price = priceRub(product.priceCents)
  }

  const productNode: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.description,
    sku: product.id,
    mpn: product.id,
    productID: product.id,
    url: productUrl,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'amateru.st'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'amateru.st',
      url: base || undefined
    },
    releaseDate: product.releasedAt,
    itemCondition: 'https://schema.org/NewCondition',
    additionalProperty: buildAdditionalProperties(product),
    offers
  }

  if (images.length === 1) productNode.image = images[0]
  else if (images.length > 1) productNode.image = images

  return {
    '@context': 'https://schema.org',
    '@graph': [
      productNode,
      {
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Каталог',
            item: catalogUrl || '/catalog'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.title,
            item: productUrl || path
          }
        ]
      },
      {
        '@type': 'WebPage',
        '@id': productUrl || path,
        url: productUrl || path,
        name: product.title,
        description: product.description,
        isPartOf: base
          ? { '@type': 'WebSite', name: 'amateru.st', url: base }
          : undefined,
        about: { '@id': `${productUrl}#product` },
        primaryImageOfPage: images[0]
          ? { '@type': 'ImageObject', url: images[0] }
          : undefined,
        inLanguage: 'ru-RU'
      }
    ]
  }
}
