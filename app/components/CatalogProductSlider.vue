<script setup lang="ts">
import type { CatalogProduct } from '~/data/catalog'

const props = defineProps<{
  products: CatalogProduct[]
  title?: string
}>()

const scroller = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)

function updateNav() {
  const el = scroller.value
  if (!el) {
    canPrev.value = false
    canNext.value = false
    return
  }
  const maxScroll = el.scrollWidth - el.clientWidth
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft < maxScroll - 4
}

function scrollByPage(direction: -1 | 1) {
  const el = scroller.value
  if (!el) return
  const amount = Math.max(el.clientWidth * 0.85, 240)
  el.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

onMounted(() => {
  updateNav()
  const el = scroller.value
  if (!el) return
  el.addEventListener('scroll', updateNav, { passive: true })
  window.addEventListener('resize', updateNav)
})

onUnmounted(() => {
  const el = scroller.value
  el?.removeEventListener('scroll', updateNav)
  window.removeEventListener('resize', updateNav)
})

watch(
  () => props.products.length,
  async () => {
    await nextTick()
    updateNav()
  }
)
</script>

<template lang="pug">
section.product-slider(v-if="products.length")
  .container.product-slider__head
    h2.product-slider__title {{ title || 'Самые популярные' }}
    .product-slider__nav(v-if="products.length > 1")
      button.product-slider__btn(
        type="button"
        aria-label="Предыдущие товары"
        :disabled="!canPrev"
        @click="scrollByPage(-1)"
      )
        span(aria-hidden="true") ‹
      button.product-slider__btn(
        type="button"
        aria-label="Следующие товары"
        :disabled="!canNext"
        @click="scrollByPage(1)"
      )
        span(aria-hidden="true") ›

  .product-slider__track-wrap
    .container
      ul.product-slider__track(
        ref="scroller"
        tabindex="0"
        aria-label="Слайдер товаров"
      )
        li.product-slider__item(v-for="product in products" :key="product.id")
          CatalogProductCard(:product="product")

  .container.product-slider__footer
    NuxtLink.product-slider__all(to="/catalog") Смотреть все
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.product-slider {
  padding-block: clamp(1.75rem, 4vw, 3rem) clamp(2.25rem, 5vw, 3.5rem);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.15rem;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 1.85rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.2;
  }

  &__nav {
    display: flex;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  &__btn {
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    padding: 0;
    border: 1px solid $color-ink-12;
    border-radius: 999px;
    background: $color-paper;
    color: $color-ink;
    font-size: 1.45rem;
    line-height: 1;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      color 0.15s ease,
      background 0.15s ease;

    &:hover:not(:disabled) {
      border-color: $color-gold;
      color: $color-gold;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__track-wrap {
    // чтобы тень карточки при hover не обрезалась контейнером
    overflow: visible;
  }

  &__track {
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0.35rem 0 1rem;
    list-style: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 4px;
    }
  }

  &__item {
    flex: 0 0 min(72vw, 240px);
    scroll-snap-align: start;
    min-width: 0;

    @media (min-width: 640px) {
      flex-basis: calc((100% - 2rem) / 3);
    }

    @media (min-width: 1024px) {
      flex-basis: calc((100% - 3rem) / 4);
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 0.35rem;
  }

  &__all {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
    padding-inline: 1.35rem;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    text-decoration: none;
    font-size: 0.9rem;
    letter-spacing: 0.03em;
    transition: background 0.15s ease;

    &:hover {
      background: $color-ink;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 3px;
    }
  }
}
</style>
