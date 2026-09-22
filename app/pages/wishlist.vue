<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'

const wishlist = useWishlistStore()
const cart = useCartStore()

useHead({
  title: 'Избранное',
  meta: [
    {
      name: 'description',
      content: 'Избранные украшения amateru.st — сохраните понравившиеся изделия.'
    }
  ]
})

const itemsLabel = computed(() => {
  const n = wishlist.count
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} изделий`
  if (mod10 === 1) return `${n} изделие`
  if (mod10 >= 2 && mod10 <= 4) return `${n} изделия`
  return `${n} изделий`
})

function itemHref(item: { slug?: string; productId: string }) {
  return `/catalog/${item.slug || item.productId}`
}

function addToCart(item: {
  id: string
  productId: string
  slug?: string
  title: string
  unitPriceCents: number
  imageUrl?: string
}) {
  cart.addItem({
    id: item.id,
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    unitPriceCents: item.unitPriceCents,
    quantity: 1,
    imageUrl: item.imageUrl
  })
}
</script>

<template lang="pug">
.wishlist-page
  .container
    nav.wishlist-page__breadcrumbs(aria-label="Хлебные крошки")
      NuxtLink.wishlist-page__crumb(to="/catalog") Каталог
      span.wishlist-page__crumb-sep /
      span.wishlist-page__crumb-current Избранное

    header.wishlist-page__header(v-if="!wishlist.isEmpty")
      h1.wishlist-page__title Избранное
      p.wishlist-page__subtitle {{ itemsLabel }}

    .wishlist-page__empty(v-if="wishlist.hydrated && wishlist.isEmpty")
      h1.wishlist-page__empty-title В избранном пока пусто
      p.wishlist-page__empty-text
        | Отмечайте сердечком украшения в каталоге — они появятся здесь.
      NuxtLink.wishlist-page__empty-cta(to="/catalog") Перейти в каталог

    template(v-else-if="!wishlist.isEmpty")
      ul.wishlist-page__list(aria-label="Избранные товары")
        li.wishlist-item(v-for="item in wishlist.items" :key="item.id")
          NuxtLink.wishlist-item__media(:to="itemHref(item)")
            img.wishlist-item__image(
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              width="160"
              height="200"
              loading="lazy"
            )
            span.wishlist-item__image-fallback(v-else aria-hidden="true")

          .wishlist-item__body
            p.wishlist-item__category(v-if="item.category") {{ item.category }}
            NuxtLink.wishlist-item__title(:to="itemHref(item)") {{ item.title }}
            p.wishlist-item__price {{ formatRubFromCents(item.unitPriceCents) }}

            .wishlist-item__actions
              button.wishlist-item__cart(
                type="button"
                @click="addToCart(item)"
              ) В корзину
              button.wishlist-item__remove(
                type="button"
                :aria-label="`Убрать ${item.title} из избранного`"
                @click="wishlist.remove(item.id)"
              ) Убрать

      .wishlist-page__footer
        button.wishlist-page__clear(
          type="button"
          @click="wishlist.clear()"
        ) Очистить избранное
        NuxtLink.wishlist-page__continue(to="/catalog") В каталог
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.wishlist-page {
  padding-block: clamp(1.3rem, 3vw, 2.2rem) clamp(2.5rem, 5vw, 4rem);

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

  &__crumb-sep {
    opacity: 0.55;
  }

  &__header {
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
  }

  &__title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }

  &__subtitle {
    margin: 0.4rem 0 0;
    color: $color-ink-55;
    font-size: 0.95rem;
  }

  &__empty {
    display: grid;
    gap: 1rem;
    justify-items: start;
    max-width: 28rem;
    padding-block: clamp(2.5rem, 8vw, 5rem);
  }

  &__empty-title {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.1rem);
    font-weight: 600;
  }

  &__empty-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.55;
    color: $color-ink-55;
  }

  &__empty-cta {
    display: inline-flex;
    align-items: center;
    height: 2.5rem;
    padding-inline: 1.25rem;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    text-decoration: none;
    font-size: 0.9rem;
    margin-top: 0.35rem;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0;
    border-top: 1px solid $color-ink-8;
  }

  &__footer {
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    align-items: center;
  }

  &__clear {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: $color-ink-55;
    font-size: 0.88rem;
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }

  &__continue {
    font-size: 0.9rem;
    color: $color-ink;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }
}

.wishlist-item {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 1rem;
  padding-block: 1.15rem;
  border-bottom: 1px solid $color-ink-8;

  &__media {
    display: block;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid $color-ink-10;
    background: $color-paper;
    aspect-ratio: 4 / 5;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__image-fallback {
    display: block;
    width: 100%;
    height: 100%;
    background: $color-ink-6;
  }

  &__body {
    display: grid;
    gap: 0.35rem;
    align-content: start;
    min-width: 0;
  }

  &__category {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
    color: $color-ink;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }

  &__price {
    margin: 0.15rem 0 0;
    font-size: 1.05rem;
    font-weight: 700;
  }

  &__actions {
    margin-top: 0.55rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem 0.85rem;
    align-items: center;
  }

  &__cart {
    display: inline-flex;
    align-items: center;
    height: 2.2rem;
    padding-inline: 1rem;
    border: none;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    cursor: pointer;
  }

  &__remove {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: $color-ink-55;
    font-size: 0.85rem;
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }
}

@media (width <= 560px) {
  .wishlist-item {
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: 0.85rem;
  }
}
</style>
