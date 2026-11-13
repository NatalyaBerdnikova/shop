<script setup lang="ts">
import type { CatalogProduct } from '~/data/catalog'
import { formatProductPrice } from '~/utils/formatMoney'

const props = defineProps<{
  product: CatalogProduct
}>()

const isHovered = ref(false)
const activeImageIndex = ref(0)

const productHref = computed(() => `/catalog/${props.product.slug}`)

const activeImage = computed(
  () => props.product.images[activeImageIndex.value] ?? props.product.images[0] ?? ''
)

const hasImage = computed(() => Boolean(activeImage.value))

const formattedPrice = computed(() => formatProductPrice(props.product.priceCents))

function setActiveByPointer(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  const length = props.product.images.length
  if (length <= 1) return

  const rect = target.getBoundingClientRect()
  const progress = (event.clientX - rect.left) / rect.width
  const index = Math.floor(Math.min(0.999, Math.max(0, progress)) * length)
  activeImageIndex.value = index
}

function resetHoverState() {
  isHovered.value = false
  activeImageIndex.value = 0
}
</script>

<template lang="pug">
article.catalog-card(
  :class="{ 'catalog-card--hover': isHovered }"
  @mouseenter="isHovered = true"
  @mouseleave="resetHoverState"
)
  .catalog-card__media(@mousemove="setActiveByPointer")
    NuxtLink.catalog-card__media-link(:to="productHref" :aria-label="product.title")
      responsive-image(
        v-if="hasImage"
        :src="activeImage"
        :alt="product.title"
        :width="900"
        :height="1200"
        loading="lazy"
        :unsplash="true"
        img-class="catalog-card__image"
      )
      .catalog-card__image-placeholder(v-else aria-hidden="true")
        span Скоро фото
    .catalog-card__steps(v-if="product.images.length > 1" aria-hidden="true")
      span.catalog-card__step(
        v-for="(_, i) in product.images"
        :key="`${product.id}-step-${i}`"
        :class="{ 'catalog-card__step--active': i === activeImageIndex }"
      )

  .catalog-card__body
    h3.catalog-card__title
      NuxtLink.catalog-card__title-link(:to="productHref") {{ product.title }}
    p.catalog-card__price {{ formattedPrice }}
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.catalog-card {
  position: relative;
  border-radius: 0.95rem;
  border: 1px solid $color-ink-10;
  background: $color-white;
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &--hover {
    transform: translateY(-4px);
    box-shadow:
      0 4px 6px rgb(26 25 24 / 4%),
      0 12px 24px rgb(26 25 24 / 10%),
      0 24px 48px rgb(26 25 24 / 8%);
  }

  &__media {
    position: relative;
    aspect-ratio: 3 / 4;
    background: rgb(26 25 24 / 3%);
  }

  &__media-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: -2px;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    pointer-events: none;
  }

  &__image-placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: $color-ink-55;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
  }

  &__steps {
    position: absolute;
    inset-inline: 0.75rem;
    bottom: 0.75rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0.35rem;
    pointer-events: none;
  }

  &__step {
    height: 2px;
    background: rgb(255 255 255 / 45%);

    &--active {
      background: $color-white;
    }
  }

  &__body {
    padding: 0.75rem 0.85rem 0.9rem;
  }

  &__title {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.25;
    font-weight: 700;
    color: $color-ink;
  }

  &__title-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__price {
    margin: 0.4rem 0 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: $color-ink;
  }
}
</style>
