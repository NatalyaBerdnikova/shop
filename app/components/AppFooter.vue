<script setup lang="ts">
import { footerServiceLinks } from '~/data/navigation'
</script>

<template lang="pug">
footer.site-footer(role="contentinfo")
  .site-footer__main
    .container.site-footer__grid
      .site-footer__brand-block
        NuxtLink.site-footer__logo(to="/") amateru.st
        p.site-footer__about
          | Украшения из полимерной смолы: кольца, подвески, серьги и браслеты.
          | Ручная работа и внимание к деталям.

      .site-footer__col
        h2.site-footer__heading Покупателям
        nav.site-footer__nav(aria-label="Покупателям")
          NuxtLink.site-footer__link(
            v-for="link in footerServiceLinks"
            :key="link.to"
            :to="link.to"
          ) {{ link.label }}

      address.site-footer__col.site-footer__contacts
        h2.site-footer__heading Контакты
        p
          a.site-footer__contact-link(href="tel:+78001234567") +7 (800) 123-45-67
        p
          a.site-footer__contact-link(href="mailto:hello@siyanie.example") hello@siyanie.example
        p.site-footer__hours Ежедневно, 10:00–21:00

  .site-footer__bottom
    .container.site-footer__bottom-inner
      p.site-footer__copy © {{ new Date().getFullYear() }} amateru.st. Все права защищены.
      p.site-footer__legal
        NuxtLink.site-footer__mini-link(to="/privacy") Политика конфиденциальности
        span.site-footer__dot(aria-hidden="true") ·
        NuxtLink.site-footer__mini-link(to="/offer") Публичная оферта
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.site-footer {
  margin-top: auto;
  background: $color-bg-dark;
  color: $color-white-88;

  &__main {
    padding-block: clamp(2.5rem, 6vw, 4rem);
  }

  &__grid {
    display: grid;
    gap: clamp(2rem, 4vw, 3rem);

    @media (min-width: 640px) {
      grid-template-columns: 1.6fr 1fr 1fr;
    }
  }

  &__logo {
    display: inline-block;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    color: $color-paper;

    &:hover {
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 4px;
    }
  }

  &__about {
    margin: 0;
    max-width: 28ch;
    font-size: 0.9rem;
    line-height: 1.55;
    color: $color-ink-58;
  }

  &__heading {
    margin: 0 0 1rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-white-45;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  &__link {
    font-size: 0.9rem;
    text-decoration: none;
    color: $color-white-88;
    transition: color 0.2s ease;

    &:hover {
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__contacts {
    margin: 0;
    font-size: 0.9rem;
    font-style: normal;
    line-height: 1.6;

    p {
      margin: 0 0 0.5rem;
    }
  }

  &__contact-link {
    color: $color-white;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__hours {
    margin-top: 0.35rem !important;
    font-size: 0.85rem;
    color: $color-white-45;
  }

  &__bottom {
    border-top: 1px solid $color-white-8;
  }

  &__bottom-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 1.25rem;
    font-size: 0.8rem;
    color: $color-white-45;
  }

  &__copy {
    margin: 0;
  }

  &__legal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }

  &__mini-link {
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

  &__dot {
    opacity: 0.5;
  }
}
</style>
