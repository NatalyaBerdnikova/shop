<script setup lang="ts">
import type { CatalogProduct } from '~/data/catalog'

const props = defineProps<{
  product: CatalogProduct
}>()

const cart = useCartStore()
const quantity = ref(1)
const isHovered = ref(false)
const activeImageIndex = ref(0)

const activeImage = computed(
  () => props.product.images[activeImageIndex.value] ?? props.product.images[0]
)

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
    quantity: quantity.value,
    imageUrl: props.product.images[0]
  })
}

function onWishlistClick(e: Event) {
  e.preventDefault()
  e.stopPropagation()
}
</script>

<template lang="pug">
article.catalog-card(
  :class="{ 'catalog-card--hover': isHovered }"
  @mouseenter="isHovered = true"
  @mouseleave="resetHoverState"
)
  .catalog-card__media(
    @mousemove="setActiveByPointer"
  )
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
        aria-label="В избранное"
        @click="onWishlistClick"
      )
        svg.catalog-card__fab-icon(
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
          path(d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z")
      NuxtLink.catalog-card__fab(
        :to="`/catalog/${product.slug}`"
        aria-label="Быстрый просмотр"
      )
        svg.catalog-card__fab-icon(
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
          path(d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z")
          circle(cx="12" cy="12" r="3")
    .catalog-card__steps(v-if="product.images.length > 1" aria-hidden="true")
      span.catalog-card__step(
        v-for="(_, i) in product.images"
        :key="`${product.id}-step-${i}`"
        :class="{ 'catalog-card__step--active': i === activeImageIndex }"
      )

  .catalog-card__body
    .catalog-card__stars(role="img" aria-label="Рейтинг не указан")
      svg.catalog-card__star(
        v-for="n in 5"
        :key="`${product.id}-star-${n}`"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        aria-hidden="true"
      )
        path(d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")
    p.catalog-card__meta {{ product.category }} · {{ product.material }}
    h3.catalog-card__title
      NuxtLink.catalog-card__title-link(:to="`/catalog/${product.slug}`") {{ product.title }}
    p.catalog-card__price {{ formattedPrice }}

  .catalog-card__footer
    .catalog-card__qty
      button.catalog-card__qty-btn(
        type="button"
        aria-label="Уменьшить количество"
        :disabled="quantity <= 1"
        @click="quantity = Math.max(1, quantity - 1)"
      ) –
      output.catalog-card__qty-value {{ quantity }}
      button.catalog-card__qty-btn(
        type="button"
        aria-label="Увеличить количество"
        @click="quantity += 1"
      ) +
    button.catalog-card__add-btn(
      type="button"
      @click="addToCart"
    ) В корзину
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.catalog-card {
  position: relative;
  z-index: 1;
  border-radius: 0.95rem;
  border: 1px solid $color-ink-10;
  background: $color-white;
  overflow: visible;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    z-index 0s linear 0.2s;

  &--hover {
    z-index: 10;
    transform: translateY(-4px);
    box-shadow:
      0 4px 6px rgb(26 25 24 / 4%),
      0 12px 24px rgb(26 25 24 / 10%),
      0 24px 48px rgb(26 25 24 / 8%);
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease,
      z-index 0s linear 0s;
  }

  &__media {
    position: relative;
    aspect-ratio: 3 / 4;
    background: rgb(26 25 24 / 3%);
    border-radius: 0.95rem 0.95rem 0 0;
    overflow: hidden;
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
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
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
    text-decoration: none;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: $color-ink;
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

  &__stars {
    display: flex;
    gap: 0.2rem;
    margin-bottom: 0.35rem;
    color: rgb(26 25 24 / 22%);
  }

  &__star {
    flex-shrink: 0;
    display: block;
  }

  &__meta {
    margin: 0 0 0.25rem;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    line-height: 1.35;
    color: $color-ink-55;
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

  &__footer {
    position: absolute;
    left: -1px;
    right: -1px;
    top: 100%;
    margin-top: -1px;
    display: flex;
    min-height: 2.6rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(6px);
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      visibility 0.2s ease;
    border-radius: 0 0 0.95rem 0.95rem;
    overflow: hidden;
    background: $color-white;
    border: 1px solid $color-ink-10;
    border-top: 1px solid $color-ink-8;
    box-shadow: 0 16px 24px rgb(26 25 24 / 10%);

    .catalog-card--hover & {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }
  }

  &__qty {
    display: flex;
    flex: 1 1 50%;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-width: 0;
    background: rgb(26 25 24 / 5%);
    border-right: 1px solid $color-ink-10;
  }

  &__qty-btn {
    border: none;
    background: transparent;
    width: 2.25rem;
    height: 100%;
    min-height: 2.6rem;
    cursor: pointer;
    color: $color-ink;
    font-size: 1rem;
    line-height: 1;

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__qty-value {
    min-width: 1.5rem;
    text-align: center;
    font-size: 0.88rem;
    font-weight: 600;
  }

  &__add-btn {
    flex: 1 1 50%;
    border: none;
    margin: 0;
    padding: 0 0.5rem;
    min-height: 2.6rem;
    background: $color-ink;
    color: $color-white;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #000;
    }
  }
}
</style>
