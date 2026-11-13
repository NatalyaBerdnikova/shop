<script setup lang="ts">
import { shopContacts, socialLinks } from '~/data/contacts'

useHead({
  title: 'Публичная оферта',
  meta: [
    {
      name: 'description',
      content:
        'amateru.st — витрина каталога. Актуальные условия заказа и доставки уточняйте у продавца.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Публичная оферта"
  lead="Сайт показывает каталог. Заказ, доставка и оплата согласуются напрямую с продавцом."
)
  section.info-block
    h2.info-block__title Товары и цены
    p.info-block__text
      | Названия и описания указаны в каталоге. Цена может уточняться при заказе.
    p.info-block__text
      NuxtLink(to="/catalog") Открыть каталог

  section.info-block
    h2.info-block__title Заказ и доставка
    p.info-block__text
      | Онлайн-оплата и корзина на сайте отключены. Напишите в Telegram или VK —
      | подтвердим наличие и обсудим доставку.
    p.info-block__text
      NuxtLink(to="/delivery") Подробнее о доставке

  section.info-block
    h2.info-block__title Связаться
    p.info-block__text
      template(v-for="link in socialLinks" :key="link.href")
        a(
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        ) {{ link.label }}
        br
      a(v-if="shopContacts.email" :href="shopContacts.emailHref") {{ shopContacts.email }}
</template>
