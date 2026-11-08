<script setup lang="ts">
import { shopContacts } from '~/data/contacts'

useHead({
  title: 'Политика конфиденциальности',
  meta: [
    {
      name: 'description',
      content:
        'Какие данные браузер хранит на amateru.st: cookie согласия, корзина, избранное и вход через Яндекс ID.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Политика конфиденциальности"
  lead="Витрина хранит в браузере только то, что нужно для согласия на cookie, корзины, избранного и входа."
)
  section.info-block
    h2.info-block__title Файлы cookie
    p.info-block__text
      | Необходимые cookie: согласие на баннер (ncc_c, ncc_e) и, если вы входите через Яндекс ID, сессия (amateru_auth_v1, amateru_oauth_state).
    p.info-block__text Дополнительные cookie не используются.

  section.info-block
    h2.info-block__title На этом устройстве
    p.info-block__text
      | Корзина (amateru:cart:v1) и избранное (amateru:wishlist:v1) лежат в localStorage браузера.
      | На сервер они не отправляются, пока вы сами не переходите к оформлению заказа.

  section.info-block
    h2.info-block__title Заказ и сервисы Яндекса
    p.info-block__text
      | Контакты, доставка и оплата обрабатываются в чекауте Яндекса (Яндекс Пэй, Яндекс Доставка, СДЭК), когда заказ создаётся через сервер магазина.
      |
      NuxtLink(to="/delivery") Как устроены доставка и оплата

  section.info-block
    h2.info-block__title Контакты
    p.info-block__text
      a(:href="shopContacts.phoneHref") {{ shopContacts.phoneDisplay }}
      br
      a(:href="shopContacts.emailHref") {{ shopContacts.email }}
      br
      | {{ shopContacts.hours }}
</template>
