<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'
import type { Order } from '~~/types/order'
import {
  ORDER_STATUS_LABELS,
  YANDEX_PAYMENT_STATUS_LABELS
} from '~~/types/order'
import { deliveryLabel } from '#shared/yandexPay'

const cart = useCartStore()
const route = useRoute()
const orderId = computed(() => String(route.params.id ?? ''))
const payQuery = computed(() => String(route.query.pay ?? ''))

const {
  data: order,
  error,
  pending,
  refresh
} = await useFetch<Order>(() => `/api/orders/${orderId.value}`, {
  key: () => `order-${orderId.value}`,
  watch: [orderId]
})

useHead(() => ({
  title: order.value ? `Заказ ${order.value.id}` : 'Заказ',
  meta: [
    {
      name: 'description',
      content: 'Подтверждение заказа в ювелирной мастерской Цитадель.'
    }
  ]
}))

const createdLabel = computed(() => {
  if (!order.value?.createdAt) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(order.value.createdAt))
})

const eyebrow = computed(() => {
  if (payQuery.value === 'error' || order.value?.status === 'failed') {
    return 'Оплата не завершена'
  }
  if (order.value?.status === 'paid') return 'Заказ оплачен'
  if (order.value?.status === 'pending' || payQuery.value === 'success') {
    return 'Заказ оформлен'
  }
  return ORDER_STATUS_LABELS[order.value?.status ?? 'checkout']
})

const lead = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'paid') {
    return 'Спасибо. Мы соберём заказ и передадим его в доставку.'
  }
  if (payQuery.value === 'error' || order.value.status === 'failed') {
    return 'Оплата не прошла. Можно вернуться в корзину и оформить заказ снова.'
  }
  if (payQuery.value === 'success' || order.value.status === 'pending') {
    return 'Если оплата уже прошла, статус обновится автоматически. Это может занять несколько секунд.'
  }
  return 'Оформите доставку и оплату в чекауте Яндекса.'
})

onMounted(async () => {
  if (payQuery.value === 'success') {
    cart.clear()
  }
  if (payQuery.value !== 'success' && payQuery.value !== 'error') return
  try {
    await $fetch(`/api/orders/${orderId.value}/sync`, { method: 'POST' })
    await refresh()
    if (order.value?.status === 'paid') cart.clear()
  } catch {
    // Статус подтянется вебхуком.
  }
})
</script>

<template lang="pug">
.order-page
  .container
    .order-page__loading(v-if="pending")
      p Загружаем заказ…

    .order-page__missing(v-else-if="error || !order")
      h1.order-page__title Заказ не найден
      p.order-page__lead Возможно, ссылка устарела или номер указан неверно.
      NuxtLink.order-page__cta(to="/catalog") В каталог

    template(v-else)
      nav.order-page__breadcrumbs(aria-label="Хлебные крошки")
        NuxtLink.order-page__crumb(to="/catalog") Каталог
        span.order-page__crumb-sep /
        span.order-page__crumb-current Заказ {{ order.id }}

      header.order-page__header
        p.order-page__eyebrow {{ eyebrow }}
        h1.order-page__title {{ order.id }}
        p.order-page__lead {{ lead }}
        p.order-page__meta {{ createdLabel }}

      .order-page__layout
        section.order-page__panel
          h2.order-page__panel-title Состав
          ul.order-lines
            li.order-line(v-for="line in order.lines" :key="line.id")
              .order-line__media
                img.order-line__image(
                  v-if="line.imageUrl"
                  :src="line.imageUrl"
                  :alt="line.title"
                  width="72"
                  height="90"
                  loading="lazy"
                )
              .order-line__body
                p.order-line__title {{ line.title }}
                p.order-line__meta {{ line.quantity }} × {{ formatRubFromCents(line.unitPriceCents) }}
              p.order-line__total {{ formatRubFromCents(line.unitPriceCents * line.quantity) }}

        aside.order-page__aside
          section.order-page__panel
            h2.order-page__panel-title Детали
            dl.order-facts
              .order-facts__row(v-if="order.contact?.name || order.contact?.phone || order.contact?.email")
                dt Контакты
                dd
                  template(v-if="order.contact.name") {{ order.contact.name }}
                    br
                  template(v-if="order.contact.phone") {{ order.contact.phone }}
                    br
                  template(v-if="order.contact.email") {{ order.contact.email }}
              .order-facts__row
                dt Доставка
                dd
                  | {{ deliveryLabel(order.delivery) }}
                  template(v-if="order.delivery?.pickupPointName || order.delivery?.address")
                    br
                    | {{ order.delivery.pickupPointName || order.delivery.address }}
              .order-facts__row
                dt Оплата
                dd
                  | {{ YANDEX_PAYMENT_STATUS_LABELS[order.paymentStatus || ''] || ORDER_STATUS_LABELS[order.status] }}
                  template(v-if="order.paymentMethod")
                    br
                    | {{ order.paymentMethod }}
              .order-facts__row(v-if="order.comment")
                dt Комментарий
                dd {{ order.comment }}

          section.order-page__panel.order-page__panel--totals
            .order-totals__row
              span Товары
              span {{ formatRubFromCents(order.subtotalCents) }}
            .order-totals__row
              span Доставка
              span {{ order.deliveryCents === 0 ? 'В чекауте Яндекса' : formatRubFromCents(order.deliveryCents) }}
            .order-totals__row.order-totals__row--total
              span Итого
              strong {{ formatRubFromCents(order.totalCents) }}

          a.order-page__cta(
            v-if="order.paymentUrl && (order.status === 'checkout' || order.status === 'pending' || order.status === 'failed')"
            :href="order.paymentUrl"
          ) Вернуться в чекаут Яндекса
          NuxtLink.order-page__cta(v-else to="/catalog") Продолжить покупки
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.order-page {
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

  &__header {
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
    max-width: 40rem;
  }

  &__eyebrow {
    margin: 0 0 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-gold;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.4rem);
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

  &__meta {
    margin: 0.45rem 0 0;
    font-size: 0.88rem;
    color: $color-ink-55;
  }

  &__loading,
  &__missing {
    padding-block: clamp(2rem, 6vw, 4rem);
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 22rem);
    gap: clamp(1.25rem, 3vw, 2rem);
    align-items: start;
  }

  &__aside {
    display: grid;
    gap: 1rem;
  }

  &__panel {
    display: grid;
    gap: 0.9rem;
    padding: 1.2rem 1.3rem;
    border: 1px solid $color-ink-10;
    border-radius: 1rem;
    background: $color-white;
  }

  &__panel-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.6rem;
    padding-inline: 1.25rem;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    text-decoration: none;
    font-size: 0.9rem;
  }
}

.order-lines {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.85rem;
}

.order-line {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;

  &__media {
    overflow: hidden;
    border-radius: 0.55rem;
    border: 1px solid $color-ink-10;
    aspect-ratio: 4 / 5;
    background: $color-paper;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__title {
    margin: 0;
    font-weight: 600;
  }

  &__meta {
    margin: 0.25rem 0 0;
    font-size: 0.82rem;
    color: $color-ink-55;
  }

  &__total {
    margin: 0;
    font-weight: 600;
  }
}

.order-facts {
  margin: 0;
  display: grid;
  gap: 0.85rem;

  &__row {
    display: grid;
    gap: 0.25rem;

    dt {
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: $color-ink-55;
    }

    dd {
      margin: 0;
      line-height: 1.45;
    }
  }
}

.order-totals {
  &__row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: $color-ink-55;

    &--total {
      padding-top: 0.55rem;
      margin-top: 0.25rem;
      border-top: 1px solid $color-ink-8;
      color: $color-ink;

      strong {
        font-size: 1.2rem;
      }
    }
  }
}

@media (width <= 850px) {
  .order-page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
