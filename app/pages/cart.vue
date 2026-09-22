<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'

const cart = useCartStore()

useHead({
  title: 'Корзина',
  meta: [
    {
      name: 'description',
      content: 'Корзина покупок amateru.st: проверьте выбранные украшения перед оформлением заказа.'
    }
  ]
})

const formattedSubtotal = computed(() =>
  formatRubFromCents(cart.subtotalCents)
)

const itemsLabel = computed(() => {
  const n = cart.totalQuantity
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} товаров`
  if (mod10 === 1) return `${n} товар`
  if (mod10 >= 2 && mod10 <= 4) return `${n} товара`
  return `${n} товаров`
})

function lineHref(line: { slug?: string; productId: string }) {
  return `/catalog/${line.slug || line.productId}`
}

function lineTotal(line: { unitPriceCents: number; quantity: number }) {
  return formatRubFromCents(line.unitPriceCents * line.quantity)
}
</script>

<template lang="pug">
.cart-page
  .container
    nav.cart-page__breadcrumbs(aria-label="Хлебные крошки")
      NuxtLink.cart-page__crumb(to="/catalog") Каталог
      span.cart-page__crumb-sep /
      span.cart-page__crumb-current Корзина

    header.cart-page__header(v-if="!cart.isEmpty")
      h1.cart-page__title Корзина
      p.cart-page__subtitle {{ itemsLabel }}

    .cart-page__empty(v-if="cart.isEmpty")
      h1.cart-page__empty-title Корзина пустая
      p.cart-page__empty-text
        | Перейдите в каталог, чтобы найти подходящие украшения.
      NuxtLink.cart-page__empty-cta(to="/catalog") Перейти в каталог
      NuxtLink.cart-page__empty-home(to="/") На главную

    .cart-page__layout(v-else)
      ul.cart-page__list(aria-label="Товары в корзине")
        li.cart-line(v-for="line in cart.lines" :key="line.id")
          NuxtLink.cart-line__media(:to="lineHref(line)")
            img.cart-line__image(
              v-if="line.imageUrl"
              :src="line.imageUrl"
              :alt="line.title"
              width="120"
              height="150"
              loading="lazy"
            )
            span.cart-line__image-fallback(v-else aria-hidden="true")

          .cart-line__body
            .cart-line__top
              NuxtLink.cart-line__title(:to="lineHref(line)") {{ line.title }}
              button.cart-line__remove(
                type="button"
                :aria-label="`Удалить ${line.title}`"
                @click="cart.removeLine(line.id)"
              ) Удалить

            p.cart-line__unit {{ formatRubFromCents(line.unitPriceCents) }}

            .cart-line__controls
              .cart-line__qty
                button.cart-line__qty-btn(
                  type="button"
                  :disabled="line.quantity <= 1"
                  aria-label="Уменьшить количество"
                  @click="cart.increment(line.id, -1)"
                ) −
                output.cart-line__qty-value(
                  :aria-label="`Количество: ${line.quantity}`"
                ) {{ line.quantity }}
                button.cart-line__qty-btn(
                  type="button"
                  :disabled="line.quantity >= 99"
                  aria-label="Увеличить количество"
                  @click="cart.increment(line.id, 1)"
                ) +

              p.cart-line__total {{ lineTotal(line) }}

      aside.cart-page__summary
        .cart-page__summary-card
          h2.cart-page__summary-title Итого
          .cart-page__summary-row
            span Сумма
            strong {{ formattedSubtotal }}
          p.cart-page__summary-note Доставка и оплата — в чекауте Яндекса
          NuxtLink.cart-page__checkout(to="/checkout") Оформить заказ
          NuxtLink.cart-page__continue(to="/catalog") Продолжить покупки
          button.cart-page__clear(
            type="button"
            @click="cart.clear()"
          ) Очистить корзину
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.cart-page {
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

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
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
    letter-spacing: 0.02em;
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
    letter-spacing: 0.04em;
    margin-top: 0.35rem;

    &:hover {
      filter: brightness(1.05);
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 3px;
    }
  }

  &__empty-home {
    font-size: 0.9rem;
    color: $color-ink-55;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem);
    gap: clamp(1.5rem, 4vw, 2.75rem);
    align-items: start;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0;
    border-top: 1px solid $color-ink-8;
  }

  &__summary-card {
    position: sticky;
    top: 5.5rem;
    display: grid;
    gap: 0.85rem;
    padding: 1.25rem 1.35rem 1.35rem;
    border: 1px solid $color-ink-10;
    border-radius: 1rem;
    background: $color-white;
  }

  &__summary-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__summary-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    font-size: 1.05rem;

    strong {
      font-size: 1.25rem;
      font-weight: 700;
    }
  }

  &__summary-note {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.4;
    color: $color-ink-55;
  }

  &__checkout {
    margin-top: 0.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    height: 2.6rem;
    border: none;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      filter: brightness(1.05);
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 3px;
    }
  }

  &__continue {
    text-align: center;
    font-size: 0.88rem;
    letter-spacing: 0.03em;
    color: $color-ink;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    justify-self: center;

    &:hover {
      color: $color-gold;
      border-bottom-color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 3px;
    }
  }

  &__clear {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: $color-ink-55;
    font-size: 0.82rem;
    cursor: pointer;
    justify-self: center;

    &:hover {
      color: $color-ink;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }
}

.cart-line {
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

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
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
    gap: 0.55rem;
    align-content: start;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
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

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__remove {
    flex-shrink: 0;
    margin: 0;
    padding: 0.15rem 0;
    border: none;
    background: transparent;
    color: $color-ink-55;
    font-size: 0.8rem;
    letter-spacing: 0.02em;
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__unit {
    margin: 0;
    font-size: 0.88rem;
    color: $color-ink-55;
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
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
    width: 2.1rem;
    height: 2.1rem;
    cursor: pointer;
    color: $color-ink;
    font-size: 1rem;
    line-height: 1;

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: -2px;
    }
  }

  &__qty-value {
    min-width: 1.75rem;
    text-align: center;
    font-size: 0.9rem;
  }

  &__total {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
}

@media (width <= 800px) {
  .cart-page {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__summary-card {
      position: static;
    }
  }

  .cart-line {
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: 0.85rem;
  }
}
</style>
