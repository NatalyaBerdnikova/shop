<script setup lang="ts">
import { getCatalogProductBySlug } from '~/data/catalog'

const route = useRoute()
const cart = useCartStore()
const quantity = ref(1)
const activeImageIndex = ref(0)

const slug = computed(() => String(route.params.slug ?? ''))
const product = computed(() => getCatalogProductBySlug(slug.value))

if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Товар не найден'
  })
}

const activeImage = computed(
  () => product.value?.images[activeImageIndex.value] ?? product.value?.images[0] ?? ''
)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format((product.value?.priceCents ?? 0) / 100)
)

function addToCart() {
  if (!product.value) return
  cart.addItem({
    id: product.value.id,
    productId: product.value.id,
    slug: product.value.slug,
    title: product.value.title,
    unitPriceCents: product.value.priceCents,
    quantity: quantity.value,
    imageUrl: product.value.images[0]
  })
}

useHead(() => ({
  title: product.value ? `${product.value.title} - Каталог` : 'Товар',
  meta: [
    {
      name: 'description',
      content: product.value?.description ?? 'Страница товара в каталоге amateru.st.'
    }
  ]
}))
</script>

<template lang="pug">
main.product-page
  .container(v-if="product")
    nav.product-page__breadcrumbs(aria-label="Хлебные крошки")
      NuxtLink.product-page__crumb(to="/catalog") Каталог
      span.product-page__crumb-sep /
      span.product-page__crumb-current {{ product.title }}

    .product-page__layout
      section.product-page__gallery
        responsive-image(
          :src="activeImage"
          :alt="product.title"
          :width="1200"
          :height="1500"
          loading="eager"
          :unsplash="true"
          img-class="product-page__main-image"
        )
        .product-page__thumbs
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
        p.product-page__meta {{ product.category }} · {{ product.material }}
        h1.product-page__title {{ product.title }}
        p.product-page__price {{ formattedPrice }}
        p.product-page__description {{ product.description }}

        ul.product-page__details
          li.product-page__detail(v-for="detail in product.details" :key="detail") {{ detail }}

        .product-page__buy
          .product-page__qty
            button.product-page__qty-btn(
              type="button"
              :disabled="quantity <= 1"
              aria-label="Уменьшить количество"
              @click="quantity = Math.max(1, quantity - 1)"
            ) -
            output.product-page__qty-value {{ quantity }}
            button.product-page__qty-btn(
              type="button"
              aria-label="Увеличить количество"
              @click="quantity += 1"
            ) +
          button.product-page__add-btn(type="button" @click="addToCart") Добавить в корзину
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

  &__buy {
    margin-top: 1.2rem;
    display: flex;
    gap: 0.65rem;
    align-items: center;
    flex-wrap: wrap;
  }

  &__qty {
    display: inline-flex;
    align-items: center;
    border: 1px solid $color-ink-12;
    border-radius: 999px;
    overflow: hidden;
    background: $color-paper;
  }

  &__qty-btn {
    border: none;
    background: transparent;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }

  &__qty-value {
    min-width: 1.6rem;
    text-align: center;
    font-size: 0.9rem;
  }

  &__add-btn {
    border: none;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    height: 2.2rem;
    padding-inline: 1rem;
    cursor: pointer;
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
