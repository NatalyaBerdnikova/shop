<script setup lang="ts">
import type { CatalogProduct } from '~/data/catalog'

const props = defineProps<{
  product: CatalogProduct
}>()

const cart = useCartStore()
const wishlist = useWishlistStore()
const isHovered = ref(false)
const activeImageIndex = ref(0)

const productHref = computed(() => `/catalog/${props.product.slug}`)

const activeImage = computed(
  () => props.product.images[activeImageIndex.value] ?? props.product.images[0]
)

const inWishlist = computed(() => wishlist.has(props.product.id))

const formattedPrice = computed(() =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(props.product.priceCents / 100)
)

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

function addToCart() {
  cart.addItem({
    id: props.product.id,
    productId: props.product.id,
    slug: props.product.slug,
    title: props.product.title,
    unitPriceCents: props.product.priceCents,
    quantity: 1,
    imageUrl: props.product.images[0]
  })
}

function onWishlistClick(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  wishlist.toggle({
    id: props.product.id,
    productId: props.product.id,
    slug: props.product.slug,
    title: props.product.title,
    unitPriceCents: props.product.priceCents,
    imageUrl: props.product.images[0],
    category: props.product.category
  })
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
        :src="activeImage"
        :alt="product.title"
        :width="900"
        :height="1200"
        loading="lazy"
        :unsplash="true"
        img-class="catalog-card__image"
      )
    .catalog-card__floating-actions
      button.catalog-card__fab(
        type="button"
        :class="{ 'catalog-card__fab--active': inWishlist }"
        :aria-label="inWishlist ? 'Убрать из избранного' : 'В избранное'"
        :aria-pressed="inWishlist"
        @click="onWishlistClick"
      )
        svg.catalog-card__fab-icon(
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="inWishlist ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        )
          path(d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z")
    .catalog-card__steps(v-if="product.images.length > 1" aria-hidden="true")
      span.catalog-card__step(
        v-for="(_, i) in product.images"
        :key="`${product.id}-step-${i}`"
        :class="{ 'catalog-card__step--active': i === activeImageIndex }"
      )

  .catalog-card__body
    .catalog-card__title-row
      h3.catalog-card__title
        NuxtLink.catalog-card__title-link(:to="productHref") {{ product.title }}
      button.catalog-card__cart-btn(
        type="button"
        aria-label="В корзину"
        @click="addToCart"
      )
        svg.catalog-card__cart-icon(
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        )
          path(d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z")
          line(x1="3" y1="6" x2="21" y2="6")
          path(d="M16 10a4 4 0 0 1-8 0")
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

  &__floating-actions {
    position: absolute;
    top: 0.65rem;
    right: 0.65rem;
    z-index: 2;
  }

  &__fab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: $color-white;
    color: $color-ink;
    box-shadow: 0 2px 10px rgb(26 25 24 / 12%);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: $color-ink;
      color: $color-white;
    }

    &--active {
      color: $color-gold;
    }

    &--active:hover {
      background: $color-gold;
      color: $color-white;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__fab-icon {
    display: block;
    flex-shrink: 0;
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

  &__title-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__title {
    margin: 0;
    flex: 1 1 auto;
    min-width: 0;
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

  &__cart-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.85rem;
    height: 1.85rem;
    margin: -0.15rem -0.2rem 0 0;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: $color-ink;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transform: translateX(4px);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease,
      visibility 0.18s ease,
      background 0.15s ease,
      color 0.15s ease;

    .catalog-card--hover & {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    &:hover {
      background: $color-gold;
      color: $color-white;
    }

    &:focus-visible {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__cart-icon {
    display: block;
  }

  &__price {
    margin: 0.4rem 0 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: $color-ink;
  }
}

@media (hover: none) {
  .catalog-card__cart-btn {
    opacity: 1;
    visibility: visible;
    transform: none;
  }
}
</style>
