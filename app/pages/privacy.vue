<script setup lang="ts">
import { shopContacts, socialLinks } from '~/data/contacts'

useHead({
  title: 'Политика конфиденциальности',
  meta: [
    {
      name: 'description',
      content:
        'amateru.st работает как витрина: мы не сохраняем корзину, cookie согласия и данные входа в браузере.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Политика конфиденциальности"
  lead="Сайт — витрина каталога. Мы ничего не храним в браузере и не отправляем заказы на бэкенд."
)
  section.info-block
    h2.info-block__title Данные на сайте
    p.info-block__text
      | Корзина, избранное, авторизация и баннер cookie отключены.
      | Страницы каталога открываются без учётной записи и без сохранения настроек пользователя.

  section.info-block
    h2.info-block__title Связь с продавцом
    p.info-block__text
      | Заказы и вопросы — только через мессенджеры. Переписка ведётся на стороне Telegram или VK.
    p.info-block__text
      template(v-for="link in socialLinks" :key="link.href")
        a(
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        ) {{ link.label }}
        br

  section.info-block
    h2.info-block__title Контакты
    p.info-block__text(v-if="shopContacts.email")
      a(:href="shopContacts.emailHref") {{ shopContacts.email }}
      br
      | {{ shopContacts.hours }}
</template>
