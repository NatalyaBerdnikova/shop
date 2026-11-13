<script setup lang="ts">
import { getCatalogProductBySlug } from '~/data/catalog'
import { socialLinks } from '~/data/contacts'
import { formatProductPrice } from '~/utils/formatMoney'
import {
  buildProductJsonLd,
  toAbsoluteUrl
} from '~/utils/productJsonLd'

const route = useRoute()
const config = useRuntimeConfig()
const activeImageIndex = ref(0)

const slug = computed(() => String(route.params.slug ?? ''))
const product = computed(() => getCatalogProductBySlug(slug.value))

if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Товар не найден',
    fatal: true
  })
}

const activeImage = computed(
  () =>
    product.value?.images[activeImageIndex.value] ??
    product.value?.images[0] ??
    ''
)

const hasImage = computed(() => Boolean(activeImage.value))

const formattedPrice = computed(() =>
  formatProductPrice(product.value?.priceCents)
)

const requestUrl = useRequestURL()
const siteUrl = computed(
  () =>
    (config.public.siteUrl as string)?.trim() ||
    `${requestUrl.protocol}//${requestUrl.host}`
)

const productPath = computed(() => `/catalog/${slug.value}`)

const productJsonLd = computed(() => {
  if (!product.value) return null
  return buildProductJsonLd({
    product: product.value,
    siteUrl: siteUrl.value,
    path: productPath.value
  })
})

const ogImage = computed(() => {
  const src = product.value?.images[0]
  if (!src) return ''
  return toAbsoluteUrl(src, siteUrl.value)
})

function detailParts(detail: string) {
  const sep = detail.indexOf(':')
  if (sep <= 0) return { name: 'Характеристика', value: detail }
  return {
    name: detail.slice(0, sep).trim(),
    value: detail.slice(sep + 1).trim()
  }
}

useSeoMeta({
  title: () =>
    product.value ? `${product.value.title} — amateru.st` : 'Товар',
  description: () =>
    product.value?.description ?? 'Страница товара в каталоге amateru.st.',
  ogTitle: () => product.value?.title,
  ogDescription: () => product.value?.description,
  ogType: 'website',
  ogUrl: () => toAbsoluteUrl(productPath.value, siteUrl.value),
  ogImage: () => ogImage.value || undefined,
  ogLocale: 'ru_RU',
  ogSiteName: 'amateru.st',
  twitterCard: 'summary_large_image',
  twitterTitle: () => product.value?.title,
  twitterDescription: () => product.value?.description,
  twitterImage: () => ogImage.value || undefined
})

useHead(() => {
  const p = product.value
  const jsonLd = productJsonLd.value
  if (!p || !jsonLd) return {}

  const meta: Array<Record<string, string>> = [
    { name: 'description', content: p.description },
    { property: 'product:brand', content: 'amateru.st' },
    { property: 'product:availability', content: 'in stock' },
    { property: 'product:condition', content: 'new' },
    { name: 'robots', content: 'index, follow' }
  ]

  if (p.priceCents != null) {
    meta.push(
      { property: 'product:price:amount', content: (p.priceCents / 100).toFixed(2) },
      { property: 'product:price:currency', content: 'RUB' }
    )
  }

  return {
    title: `${p.title} — amateru.st`,
    link: [
      {
        rel: 'canonical',
        href: toAbsoluteUrl(productPath.value, siteUrl.value)
      }
    ],
    meta,
    script: [
      {
        key: 'product-jsonld',
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd)
      }
    ]
  }
})
</script>

<template lang="pug">
main.product-page(
  v-if="product"
  itemscope
  itemtype="https://schema.org/Product"
)
  .container
    nav.product-page__breadcrumbs(
      aria-label="Хлебные крошки"
      itemscope
      itemtype="https://schema.org/BreadcrumbList"
    )
      span(
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      )
        NuxtLink.product-page__crumb(itemprop="item" to="/catalog")
          span(itemprop="name") Каталог
        meta(itemprop="position" content="1")
      span.product-page__crumb-sep /
      span(
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      )
        span.product-page__crumb-current(itemprop="name") {{ product.title }}
        meta(itemprop="position" content="2")

    .product-page__layout
      section.product-page__gallery
        responsive-image(
          v-if="hasImage"
          :src="activeImage"
          :alt="product.title"
          :width="1200"
          :height="1500"
          loading="eager"
          :unsplash="true"
          img-class="product-page__main-image"
        )
        .product-page__image-placeholder(v-else)
          span Фото скоро появится
        meta(
          v-for="(image, i) in product.images"
          :key="`${product.id}-meta-img-${i}`"
          itemprop="image"
          :content="image"
        )
        .product-page__thumbs(v-if="product.images.length > 1")
          button.product-page__thumb(
            v-for="(image, i) in product.images"
            :key="`${product.id}-thumb-${i}`"
            type="button"
            :class="{ 'product-page__thumb--active': i === activeImageIndex }"
            :aria-label="`Показать фото ${i + 1}`"
            @click="activeImageIndex = i"
          )
            responsive-image(
              :src="image"
              :alt="`${product.title} ${i + 1}`"
              :width="360"
              :height="360"
              :unsplash="true"
              img-class="product-page__thumb-image"
            )

      section.product-page__info
        meta(itemprop="sku" :content="product.id")
        meta(itemprop="productID" :content="product.id")
        link(itemprop="url" :href="productPath")

        p.product-page__meta
          span(itemprop="category") {{ product.category }}
        h1.product-page__title(itemprop="name") {{ product.title }}
        p.product-page__price(
          itemprop="offers"
          itemscope
          itemtype="https://schema.org/Offer"
        )
          meta(itemprop="priceCurrency" content="RUB")
          meta(
            v-if="product.priceCents != null"
            itemprop="price"
            :content="(product.priceCents / 100).toFixed(2)"
          )
          meta(
            itemprop="availability"
            content="https://schema.org/InStock"
          )
          meta(
            itemprop="itemCondition"
            content="https://schema.org/NewCondition"
          )
          link(itemprop="url" :href="productPath")
          span {{ formattedPrice }}
        p.product-page__description(itemprop="description") {{ product.description }}

        ul.product-page__details(v-if="product.details.length")
          li.product-page__detail(
            v-for="detail in product.details"
            :key="detail"
            itemprop="additionalProperty"
            itemscope
            itemtype="https://schema.org/PropertyValue"
          )
            meta(:content="detailParts(detail).name" itemprop="name")
            meta(:content="detailParts(detail).value" itemprop="value")
            | {{ detail }}

        .product-page__contact
          p.product-page__contact-lead Чтобы заказать или уточнить детали:
          .product-page__contact-links
            a.product-page__contact-btn(
              v-for="link in socialLinks"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
            ) {{ link.label }}
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.product-page {
  padding-block: clamp(1.3rem, 3vw, 2.2rem) clamp(2rem, 4vw, 3rem);

  &__breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: $color-ink-55;
    font-size: 0.92rem;
  }

  &__crumb {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: clamp(1rem, 3vw, 2rem);
  }

  &__main-image {
    width: 100%;
    border-radius: 0.95rem;
    border: 1px solid $color-ink-10;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    display: block;
  }

  &__image-placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 0.95rem;
    border: 1px dashed $color-ink-12;
    background: rgb(26 25 24 / 3%);
    color: $color-ink-55;
    font-size: 1rem;
  }

  &__thumbs {
    margin-top: 0.7rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__thumb {
    border: 1px solid $color-ink-10;
    border-radius: 0.7rem;
    background: $color-paper;
    padding: 0;
    cursor: pointer;
    overflow: hidden;

    &--active {
      border-color: $color-gold;
    }
  }

  &__thumb-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
  }

  &__meta {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    color: $color-ink-55;
  }

  &__title {
    margin: 0.35rem 0 0;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    line-height: 1.15;
  }

  &__price {
    margin: 0.6rem 0 0;
    font-size: 1.3rem;
    font-weight: 700;
  }

  &__description {
    margin: 0.85rem 0 0;
    color: $color-ink-70;
    max-width: 48ch;
  }

  &__details {
    margin: 1rem 0 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.45rem;
  }

  &__contact {
    margin-top: 1.4rem;
    display: grid;
    gap: 0.75rem;
  }

  &__contact-lead {
    margin: 0;
    color: $color-ink-55;
    font-size: 0.95rem;
  }

  &__contact-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  &__contact-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.4rem;
    padding-inline: 1.15rem;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    text-decoration: none;
    font-size: 0.9rem;
  }
}

@media (width <= 900px) {
  .product-page {
    &__layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>
