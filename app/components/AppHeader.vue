<script setup lang="ts">
import { primaryNavLinks } from '~/data/navigation'

const cart = useCartStore()
const route = useRoute()

const menuOpen = ref(false)
const drawerId = useId()

function openMenu() {
  menuOpen.value = true
}

function closeMenu() {
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)

watch(menuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) closeMenu()
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template lang="pug">
header.site-header(role="banner")
  .site-header__bar
    .container.site-header__inner
      NuxtLink.site-header__logo(to="/" @click="closeMenu")
        span.site-header__brand Сияние
        span.site-header__tagline Ювелирная мастерская

      nav.site-header__nav.site-header__nav--desktop(aria-label="Основное меню")
        NuxtLink.site-header__link(
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
        ) {{ link.label }}

      .site-header__actions
        NuxtLink.site-header__cart(
          to="/korzina"
          aria-label="Корзина"
        )
          span.site-header__cart-label Корзина
          span.site-header__cart-badge(v-if="cart.totalQuantity > 0" aria-hidden="true") {{ cart.totalQuantity }}

        button.site-header__burger(
          type="button"
          :aria-expanded="menuOpen"
          :aria-controls="drawerId"
          aria-label="Открыть меню"
          @click="toggleMenu"
        )
          span.site-header__burger-line(aria-hidden="true")
          span.site-header__burger-line(aria-hidden="true")
          span.site-header__burger-line(aria-hidden="true")

  Transition(name="site-header-backdrop")
    button.site-header__backdrop(
      v-if="menuOpen"
      type="button"
      tabindex="-1"
      aria-label="Закрыть меню"
      @click="closeMenu"
    )

  .site-header__drawer(
    :id="drawerId"
    :class="{ 'site-header__drawer--open': menuOpen }"
    role="dialog"
    aria-modal="true"
    aria-label="Мобильное меню"
    :aria-hidden="!menuOpen"
    :inert="!menuOpen"
  )
    .site-header__drawer-top
      span.site-header__drawer-title Меню
      button.site-header__drawer-close(
        type="button"
        aria-label="Закрыть меню"
        @click="closeMenu"
      ) ×

    nav.site-header__drawer-nav(aria-label="Разделы магазина")
      NuxtLink.site-header__drawer-link(
        v-for="link in primaryNavLinks"
        :key="link.to"
        :to="link.to"
        @click="closeMenu"
      ) {{ link.label }}

    NuxtLink.site-header__drawer-cart(to="/korzina" @click="closeMenu")
      | Корзина
      template(v-if="cart.totalQuantity > 0") &nbsp;({{ cart.totalQuantity }})
</template>

<style scoped lang="scss">
$bp-nav: 1024px;
$gold: #9a7b4f;
$ink: #1a1918;
$paper: #faf9f7;

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: $paper;
  border-bottom: 1px solid rgb(26 25 24 / 8%);
}

.site-header__bar {
  position: relative;
  z-index: 102;
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
  padding-block: 0.65rem;
}

.site-header__logo {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 4px;
  }
}

.site-header__brand {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.site-header__tagline {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(26 25 24 / 55%);
}

.site-header__nav--desktop {
  display: none;

  @media (min-width: $bp-nav) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.35rem 1.25rem;
  }
}

.site-header__link {
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: $ink;
  padding: 0.35rem 0;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: $gold;
  }

  &.router-link-active {
    color: $gold;
    border-bottom-color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.site-header__cart {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: $ink;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgb(26 25 24 / 12%);
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: $gold;
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-header__cart-label {
  @media (max-width: #{$bp-nav - 1px}) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

.site-header__cart-badge {
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.25rem;
  text-align: center;
  color: #fff;
  background: $gold;
  border-radius: 999px;
}

.site-header__burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: $ink;

  @media (min-width: $bp-nav) {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-header__burger-line {
  display: block;
  width: 1.35rem;
  height: 2px;
  margin-inline: auto;
  background: currentcolor;
  border-radius: 1px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.site-header__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(15 15 16 / 45%);
  cursor: pointer;
  appearance: none;

  @media (min-width: $bp-nav) {
    display: none !important;
  }
}

.site-header-backdrop-enter-active,
.site-header-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.site-header-backdrop-enter-from,
.site-header-backdrop-leave-to {
  opacity: 0;
}

.site-header__drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 101;
  display: flex;
  flex-direction: column;
  width: min(20rem, 92vw);
  max-height: 100dvh;
  padding: 1rem 1.25rem 1.5rem;
  background: $paper;
  box-shadow: -12px 0 40px rgb(15 15 16 / 12%);
  transform: translateX(100%);
  visibility: hidden;
  transition:
    transform 0.28s ease,
    visibility 0.28s ease;

  @media (min-width: $bp-nav) {
    display: none !important;
  }
}

.site-header__drawer--open {
  transform: translateX(0);
  visibility: visible;
}

.site-header__drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(26 25 24 / 10%);
}

.site-header__drawer-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(26 25 24 / 55%);
}

.site-header__drawer-close {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1;
  color: $ink;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-header__drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow-y: auto;
  flex: 1;
}

.site-header__drawer-link {
  padding: 0.75rem 0;
  font-size: 1rem;
  text-decoration: none;
  color: $ink;
  border-bottom: 1px solid rgb(26 25 24 / 6%);

  &:hover,
  &.router-link-active {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-header__drawer-cart {
  margin-top: 1rem;
  padding-top: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
  text-decoration: none;
  color: $ink;
  border-top: 1px solid rgb(26 25 24 / 10%);

  &:hover {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}
</style>
