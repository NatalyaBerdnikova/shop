<script setup lang="ts">
import { shopContacts, socialLinks } from '~/data/contacts'
import { footerLegalLinks, footerServiceLinks } from '~/data/navigation'
</script>

<template lang="pug">
footer.site-footer(role="contentinfo")
  .site-footer__main
    .container.site-footer__grid
      .site-footer__brand-block
        NuxtLink.site-footer__logo(to="/") amateru.st
        p.site-footer__about
          | Витрина amateru.st. Чтобы заказать или уточнить детали —
          | напишите в Telegram или VK.

      .site-footer__col
        h2.site-footer__heading Покупателям
        nav.site-footer__nav(aria-label="Покупателям")
          NuxtLink.site-footer__link.holographic-link(
            v-for="link in footerServiceLinks"
            :key="link.to"
            :to="link.to"
          ) {{ link.label }}

      address.site-footer__col.site-footer__contacts
        h2.site-footer__heading Связаться
        p(v-for="link in socialLinks" :key="link.href")
          a.site-footer__contact-link.holographic-link(
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
          ) {{ link.label }}
        p(v-if="shopContacts.email")
          a.site-footer__contact-link.holographic-link(:href="shopContacts.emailHref") {{ shopContacts.email }}
        p.site-footer__hours {{ shopContacts.hours }}

  .site-footer__bottom
    .container.site-footer__bottom-inner
      p.site-footer__copy © {{ new Date().getFullYear() }} amateru.st. Все права защищены.
      p.site-footer__legal
        template(v-for="(link, index) in footerLegalLinks" :key="link.to")
          span.site-footer__dot(v-if="index > 0" aria-hidden="true") ·
          NuxtLink.site-footer__mini-link.holographic-link(:to="link.to") {{ link.label }}
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
