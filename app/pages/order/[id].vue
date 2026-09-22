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
  title: order.value ? `Заказ ${order.value.id} оформлен` : 'Заказ оформлен',
  meta: [
    {
      name: 'description',
      content: 'Подтверждение заказа в amateru.st: номер, состав и статус.'
    }
  ]
}))

const isFailed = computed(
  () => payQuery.value === 'error' || order.value?.status === 'failed'
)

const isPlaced = computed(() => {
  if (!order.value || isFailed.value) return false
  return (
    order.value.status === 'paid' ||
    order.value.status === 'pending' ||
    payQuery.value === 'success'
  )
})

const pageTitle = computed(() => {
  if (isFailed.value) return 'Оплата не завершена'
  if (isPlaced.value) return 'Заказ оформлен'
  return ORDER_STATUS_LABELS[order.value?.status ?? 'checkout']
})

const lead = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'paid') {
    return 'Спасибо. Мы соберём заказ и передадим его в доставку.'
  }
  if (isFailed.value) {
    return 'Оплата не прошла. Можно вернуться к оформлению и попробовать снова.'
  }
  if (isPlaced.value) {
    return 'Сохраните номер заказа — по нему можно уточнить статус.'
  }
  return 'Завершите доставку и оплату в чекауте Яндекса.'
})

const createdLabel = computed(() => {
  if (!order.value?.createdAt) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(order.value.createdAt))
})

const itemsCountLabel = computed(() => {
  const n = order.value?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} товаров`
  if (mod10 === 1) return `${n} товар`
  if (mod10 >= 2 && mod10 <= 4) return `${n} товара`
  return `${n} товаров`
})

const paymentLabel = computed(() => {
  if (!order.value) return ''
  return (
    YANDEX_PAYMENT_STATUS_LABELS[order.value.paymentStatus || ''] ||
    ORDER_STATUS_LABELS[order.value.status]
  )
})

const deliverySummary = computed(() => {
  if (!order.value) return ''
  const label = deliveryLabel(order.value.delivery)
  const place =
    order.value.delivery?.pickupPointName || order.value.delivery?.address
  return place ? `${label} · ${place}` : label
})

const showResumeCheckout = computed(() => {
  if (!order.value?.paymentUrl) return false
  return (
    order.value.status === 'checkout' ||
    order.value.status === 'pending' ||
    order.value.status === 'failed'
  )
})

onMounted(async () => {
  if (payQuery.value === 'success') cart.clear()
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
.order-done
  .container
    .order-done__loading(v-if="pending")
      p Загружаем заказ…

    .order-done__missing(v-else-if="error || !order")
      p.order-done__eyebrow Заказ
      h1.order-done__title Заказ не найден
      p.order-done__lead Возможно, ссылка устарела или номер указан неверно.
      NuxtLink.order-done__cta(to="/catalog") В каталог

    template(v-else)
      nav.order-done__breadcrumbs(aria-label="Хлебные крошки")
        NuxtLink.order-done__crumb(to="/catalog") Каталог
        span.order-done__crumb-sep /
        span.order-done__crumb-current {{ order.id }}

      header.order-done__header
        p.order-done__eyebrow(
          :class="{ 'order-done__eyebrow--alert': isFailed }"
        ) {{ pageTitle }}
        h1.order-done__title Номер заказа
        p.order-done__number {{ order.id }}
        p.order-done__lead {{ lead }}
        p.order-done__meta(v-if="createdLabel") {{ createdLabel }}

      .order-done__summary
        h2.order-done__summary-title Краткое резюме
        dl.order-done__facts
          .order-done__fact
            dt Статус
            dd {{ paymentLabel }}
          .order-done__fact
            dt Состав
            dd {{ itemsCountLabel }}
          .order-done__fact
            dt Доставка
            dd {{ deliverySummary }}
          .order-done__fact(
            v-if="order.contact?.name || order.contact?.phone || order.contact?.email"
          )
            dt Получатель
            dd
              template(v-if="order.contact.name") {{ order.contact.name }}
              template(v-if="order.contact.phone")
                br
                | {{ order.contact.phone }}
              template(v-if="order.contact.email")
                br
                | {{ order.contact.email }}
          .order-done__fact(v-if="order.comment")
            dt Комментарий
            dd {{ order.comment }}

        ul.order-done__lines(aria-label="Товары в заказе")
          li.order-done__line(v-for="line in order.lines" :key="line.id")
            span.order-done__line-title {{ line.title }}
            span.order-done__line-meta ×{{ line.quantity }}
            span.order-done__line-price {{ formatRubFromCents(line.unitPriceCents * line.quantity) }}

        .order-done__totals
          .order-done__totals-row
            span Товары
            span {{ formatRubFromCents(order.subtotalCents) }}
          .order-done__totals-row
            span Доставка
            span {{ order.deliveryCents === 0 ? 'Считает Яндекс' : formatRubFromCents(order.deliveryCents) }}
          .order-done__totals-row.order-done__totals-row--total
            span Итого
            strong {{ formatRubFromCents(order.totalCents) }}

      .order-done__actions
        a.order-done__cta(
          v-if="showResumeCheckout"
          :href="order.paymentUrl"
        ) Вернуться в чекаут Яндекса
        NuxtLink.order-done__cta(v-else to="/catalog") Продолжить покупки
        NuxtLink.order-done__secondary(to="/cart") В корзину
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.order-done {
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

  &__crumb-sep {
    opacity: 0.55;
  }

  &__header {
    max-width: 36rem;
    margin-bottom: clamp(1.5rem, 3vw, 2.25rem);
  }

  &__eyebrow {
    margin: 0 0 0.45rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-gold;

    &--alert {
      color: #8a3a32;
    }
  }

  &__title {
    margin: 0;
    font-size: clamp(1.15rem, 2.5vw, 1.35rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: $color-ink-55;
  }

  &__number {
    margin: 0.35rem 0 0;
    font-size: clamp(2rem, 5vw, 2.75rem);
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.1;
    color: $color-ink;
  }

  &__lead {
    margin: 0.85rem 0 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: $color-ink-55;
    max-width: 36ch;
  }

  &__meta {
    margin: 0.5rem 0 0;
    font-size: 0.88rem;
    color: $color-ink-55;
  }

  &__loading,
  &__missing {
    padding-block: clamp(2rem, 6vw, 4rem);
    max-width: 28rem;
  }

  &__summary {
    display: grid;
    gap: 1.1rem;
    max-width: 36rem;
    padding: 1.3rem 1.4rem 1.45rem;
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

  &__facts {
    margin: 0;
    display: grid;
    gap: 0.85rem;
  }

  &__fact {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: start;

    dt {
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: $color-ink-55;
      padding-top: 0.1rem;
    }

    dd {
      margin: 0;
      line-height: 1.45;
      font-size: 0.98rem;
    }
  }

  &__lines {
    margin: 0;
    padding: 0.85rem 0 0;
    list-style: none;
    display: grid;
    gap: 0.55rem;
    border-top: 1px solid $color-ink-8;
  }

  &__line {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  &__line-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__line-meta {
    color: $color-ink-55;
  }

  &__line-price {
    font-weight: 600;
  }

  &__totals {
    display: grid;
    gap: 0.45rem;
    padding-top: 0.85rem;
    border-top: 1px solid $color-ink-8;
  }

  &__totals-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
    color: $color-ink-55;

    &--total {
      padding-top: 0.45rem;
      margin-top: 0.15rem;
      border-top: 1px solid $color-ink-8;
      color: $color-ink;

      strong {
        font-size: 1.2rem;
      }
    }
  }

  &__actions {
    margin-top: 1.35rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.1rem;
    align-items: center;
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
    letter-spacing: 0.03em;
  }

  &__secondary {
    font-size: 0.9rem;
    color: $color-ink-55;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }
}

@media (width <= 560px) {
  .order-done__fact {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}
</style>
