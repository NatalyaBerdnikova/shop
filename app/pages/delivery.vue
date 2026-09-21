<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'
import { FREE_DELIVERY_MIN_CENTS } from '~~/types/order'

const config = useRuntimeConfig()
const freeFrom = computed(() =>
  formatRubFromCents(
    Number(config.public.freeDeliveryMinCents) || FREE_DELIVERY_MIN_CENTS
  )
)

useHead({
  title: 'Доставка и оплата',
  meta: [
    {
      name: 'description',
      content:
        'Доставка украшений Цитадель по России: Яндекс Доставка и СДЭК через чекаут Яндекса. Оплата картой, СБП и Сплитом.'
    }
  ]
})
</script>

<template lang="pug">
.delivery-page
  .container
    header.delivery-page__header
      h1.delivery-page__title Доставка и оплата
      p.delivery-page__lead
        | Заказ оформляется в чекауте Яндекса: там же выбираете доставку и оплачиваете.

    .delivery-page__sections
      section.delivery-block
        h2.delivery-block__title Способы доставки
        p.delivery-block__text
          | Самовывоза из мастерской нет. В чекауте Яндекса доступны
          |
          strong Яндекс Доставка
          |
          | и
          |
          strong СДЭК
          | : пункт выдачи или постамат выбирается на их карте.
        p.delivery-block__text
          | Курьер до двери появится, если его включат в кабинете Яндекса.

      section.delivery-block
        h2.delivery-block__title Стоимость и сроки
        p.delivery-block__text
          | Стоимость и срок считает Яндекс после выбора города и способа доставки.
        p.delivery-block__text
          | Для заказов от {{ freeFrom }} доставка бесплатная — этот порог должен совпадать с настройкой в кабинете Яндекс Пэй / KIT.

      section.delivery-block
        h2.delivery-block__title Оплата
        ul.delivery-block__list
          li Картой любого российского банка
          li СБП
          li Сплит — оплата частями, если способ включён в кабинете

      section.delivery-block
        h2.delivery-block__title Отправка и отслеживание
        p.delivery-block__text
          | Заказ передаём в доставку после оплаты и комплектации.
          | После отправки придёт уведомление и, если перевозчик его выдаёт, трек-номер.

      section.delivery-block
        h2.delivery-block__title Получение заказа
        p.delivery-block__text
          | При получении проверьте упаковку и комплектность.
          | Если есть повреждения — зафиксируйте это с сотрудником ПВЗ и напишите нам,
          | приложив фото и номер заказа.
        p.delivery-block__text
          | Если заказ не забрали в срок хранения, повторная отправка согласовывается отдельно.

      .delivery-page__cta-row
        NuxtLink.delivery-page__cta(to="/catalog") Перейти в каталог
        NuxtLink.delivery-page__ghost(to="/cart") Открыть корзину
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

  &__list {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.4rem;
    font-size: 0.98rem;
    line-height: 1.5;
  }
}
</style>
