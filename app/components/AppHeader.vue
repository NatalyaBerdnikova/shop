<script setup lang="ts">
import { primaryNavLinks } from '~/data/navigation'

const cart = useCartStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const drawerId = useId()
const accountMenuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function openLogin() {
  closeMenu()
  accountMenuOpen.value = false
  auth.openLoginModal()
}

async function logout() {
  accountMenuOpen.value = false
  closeMenu()
  await auth.logout()
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
    accountMenuOpen.value = false
  }
)

watch(menuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (menuOpen.value) closeMenu()
    accountMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)

  if (route.query.auth === 'success') {
    auth.fetchMe().then(() => {
      auth.closeLoginModal()
    })
    const query = { ...route.query }
    delete query.auth
    delete query.reason
    router.replace({ query })
  }

  if (route.query.auth === 'error') {
    auth.openLoginModal()
    const query = { ...route.query }
    delete query.auth
    delete query.reason
    router.replace({ query })
  }
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
        span.site-header__brand Цитадель
        span.site-header__tagline Ювелирная мастерская

      nav.site-header__nav.site-header__nav--desktop(aria-label="Основное меню")
        NuxtLink.site-header__link(
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
        ) {{ link.label }}

      .site-header__actions
        .site-header__account(v-if="auth.isLoggedIn")
          button.site-header__account-btn(
            type="button"
            :aria-expanded="accountMenuOpen"
            aria-haspopup="true"
            @click="accountMenuOpen = !accountMenuOpen"
          )
            span.site-header__account-label {{ auth.fullName || 'Аккаунт' }}
          .site-header__account-menu(v-if="accountMenuOpen")
            p.site-header__account-meta(v-if="auth.user?.email") {{ auth.user.email }}
            p.site-header__account-meta(v-if="auth.user?.phone") {{ auth.user.phone }}
            p.site-header__account-meta(v-if="auth.user?.birthday") {{ auth.user.birthday }}
            button.site-header__account-logout(
              type="button"
              @click="logout"
            ) Выйти

        button.site-header__login(
          v-else
          type="button"
          @click="openLogin"
        ) Войти

        NuxtLink.site-header__cart(
          to="/cart"
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

    .site-header__drawer-auth
      template(v-if="auth.isLoggedIn")
        p.site-header__drawer-user {{ auth.fullName }}
        button.site-header__drawer-login(type="button" @click="logout") Выйти
      button.site-header__drawer-login(
        v-else
        type="button"
        @click="openLogin"
      ) Войти через Яндекс ID

    NuxtLink.site-header__drawer-cart(to="/cart" @click="closeMenu")
      | Корзина
      template(v-if="cart.totalQuantity > 0") &nbsp;({{ cart.totalQuantity }})
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

$bp-nav: 1024px;

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: $color-paper;
  border-bottom: 1px solid $color-ink-8;

  &__bar {
    position: relative;
    z-index: 102;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 4rem;
    padding-block: 0.65rem;
  }

  &__logo {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 4px;
    }
  }

  &__brand {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__tagline {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__nav--desktop {
    display: none;

    @media (min-width: $bp-nav) {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.35rem 1.25rem;
    }
  }

  &__link {
    font-size: 0.875rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    color: $color-ink;
    padding: 0.35rem 0;
    border-bottom: 1px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: $color-gold;
    }

    &.router-link-active {
      color: $color-gold;
      border-bottom-color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  &__login,
  &__account-btn {
    display: inline-flex;
    align-items: center;
    height: 2.3rem;
    padding: 0 0.8rem;
    border-radius: 999px;
    border: 1px solid $color-ink-12;
    background: transparent;
    color: $color-ink;
    font: inherit;
    font-size: 0.875rem;
    letter-spacing: 0.04em;
    cursor: pointer;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__account {
    position: relative;
  }

  &__account-label {
    max-width: 9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: #{$bp-nav - 1px}) {
      max-width: 5.5rem;
    }
  }

  &__account-menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    z-index: 110;
    min-width: 12rem;
    padding: 0.75rem 0.85rem;
    border: 1px solid $color-ink-10;
    border-radius: 0.75rem;
    background: $color-white;
    box-shadow: 0 12px 30px rgb(15 15 16 / 10%);
    display: grid;
    gap: 0.35rem;
  }

  &__account-meta {
    margin: 0;
    font-size: 0.78rem;
    color: $color-ink-55;
    word-break: break-word;
  }

  &__account-logout {
    margin-top: 0.25rem;
    padding: 0;
    border: none;
    background: transparent;
    color: $color-ink;
    font: inherit;
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: $color-gold;
    }
  }

  &__cart {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    color: $color-ink;
    padding: 0.45rem 0.65rem;
    border-radius: 999px;
    border: 1px solid $color-ink-12;
    transition:
      border-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__cart-label {
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

  &__cart-badge {
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.25rem;
    text-align: center;
    color: $color-white;
    background: $color-gold;
    border-radius: 999px;
  }

  &__burger {
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
    color: $color-ink;

    @media (min-width: $bp-nav) {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__burger-line {
    display: block;
    width: 1.35rem;
    height: 2px;
    margin-inline: auto;
    background: currentcolor;
    border-radius: 1px;
  }

  &__backdrop {
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

  &__drawer {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 101;
    display: flex;
    flex-direction: column;
    width: min(20rem, 92vw);
    max-height: 100dvh;
    padding: 1rem 1.25rem 1.5rem;
    background: $color-paper;
    box-shadow: -12px 0 40px rgb(15 15 16 / 12%);
    transform: translateX(100%);
    visibility: hidden;
    transition:
      transform 0.28s ease,
      visibility 0.28s ease;

    @media (min-width: $bp-nav) {
      display: none !important;
    }

    &--open {
      transform: translateX(0);
      visibility: visible;
    }
  }

  &__drawer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid $color-ink-10;
  }

  &__drawer-title {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__drawer-close {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    line-height: 1;
    color: $color-ink;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
  }

  &__drawer-nav {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    overflow-y: auto;
    flex: 1;
  }

  &__drawer-link {
    padding: 0.75rem 0;
    font-size: 1rem;
    text-decoration: none;
    color: $color-ink;
    border-bottom: 1px solid $color-ink-6;

    &:hover,
    &.router-link-active {
      color: $color-gold;
    }
  }

  &__drawer-auth {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $color-ink-10;
    display: grid;
    gap: 0.55rem;
  }

  &__drawer-user {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__drawer-login {
    border: none;
    background: transparent;
    padding: 0;
    font: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    color: $color-ink;
    cursor: pointer;
    text-align: left;

    &:hover {
      color: $color-gold;
    }
  }

  &__drawer-cart {
    margin-top: 0.75rem;
    padding-top: 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: center;
    text-decoration: none;
    color: $color-ink;
    border-top: 1px solid $color-ink-10;

    &:hover {
      color: $color-gold;
    }
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
</style>
