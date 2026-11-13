<script setup lang="ts">
import { primaryNavLinks } from '~/data/navigation'
import { socialLinks } from '~/data/contacts'

const route = useRoute()
const menuOpen = ref(false)
const drawerId = useId()

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
      NuxtLink.site-header__logo(to="/" @click="closeMenu") amateru.st

      nav.site-header__nav.site-header__nav--desktop(aria-label="Основное меню")
        NuxtLink.site-header__link(
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
        ) {{ link.label }}

      .site-header__actions
        a.site-header__social(
          v-for="link in socialLinks"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        ) {{ link.label }}

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

    nav.site-header__drawer-nav(aria-label="Разделы")
      NuxtLink.site-header__drawer-link(
        v-for="link in primaryNavLinks"
        :key="link.to"
        :to="link.to"
        @click="closeMenu"
      ) {{ link.label }}

    .site-header__drawer-social
      a.site-header__drawer-social-link(
        v-for="link in socialLinks"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        @click="closeMenu"
      ) {{ link.label }}
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
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 4px;
    }
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

  &__social {
    display: none;
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

    @media (min-width: $bp-nav) {
      display: inline-flex;
      align-items: center;
    }

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
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

  &__drawer-social {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid $color-ink-10;
    display: grid;
    gap: 0.55rem;
  }

  &__drawer-social-link {
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    color: $color-ink;

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
