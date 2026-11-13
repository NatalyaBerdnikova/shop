<script setup lang="ts">
import { socialLinks } from '~/data/contacts'

useHead({
  title: 'Доставка',
  meta: [
    {
      name: 'description',
      content:
        'Как заказать и получить изделие amateru.st: напишите в Telegram или VK — условия доставки согласуем лично.'
    }
  ]
})
</script>

<template lang="pug">
.delivery-page
  .container
    header.delivery-page__header
      h1.delivery-page__title Доставка
      p.delivery-page__lead
        | Сейчас сайт работает как витрина: заказ оформляется напрямую у продавца
        | в Telegram или VK. Условия и стоимость доставки согласуем при переписке.

    .delivery-page__sections
      section.delivery-block
        h2.delivery-block__title Как заказать
        p.delivery-block__text
          | Выберите изделие в каталоге и напишите нам. Уточним наличие, цену и способ получения.

      section.delivery-block
        h2.delivery-block__title Доставка
        p.delivery-block__text
          | Варианты и сроки зависят от города и объёма заказа — обсуждаем индивидуально.
        p.delivery-block__text Самовывоз из мастерской по согласованию.

      section.delivery-block
        h2.delivery-block__title Оплата
        p.delivery-block__text
          | Способ оплаты согласуем при заказе. Онлайн-оплата на сайте пока отключена.

      .delivery-page__cta-row
        NuxtLink.delivery-page__cta(to="/catalog") Перейти в каталог
        a.delivery-page__ghost(
          v-for="link in socialLinks"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        ) {{ link.label }}
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.delivery-page {
  padding-block: clamp(1.5rem, 4vw, 2.5rem) clamp(2.5rem, 6vw, 4.5rem);

  &__header {
    max-width: 40rem;
    margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
  }

  &__title {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }

  &__lead {
    margin: 0.7rem 0 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: $color-ink-55;
  }

  &__sections {
    display: grid;
    gap: 1rem;
    max-width: 46rem;
  }

  &__cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    margin-top: 0.75rem;
  }

  &__cta,
  &__ghost {
    display: inline-flex;
    align-items: center;
    height: 2.5rem;
    padding-inline: 1.2rem;
    border-radius: 999px;
    text-decoration: none;
    font-size: 0.9rem;
    letter-spacing: 0.03em;
  }

  &__cta {
    background: $color-gold;
    color: $color-white;
  }

  &__ghost {
    border: 1px solid $color-ink-12;
    color: $color-ink;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }
  }
}

.delivery-block {
  padding: 1.25rem 1.35rem;
  border: 1px solid $color-ink-10;
  border-radius: 1rem;
  background: $color-white;

  &__title {
    margin: 0 0 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__text {
    margin: 0 0 0.7rem;
    font-size: 0.98rem;
    line-height: 1.55;
    color: $color-ink;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
