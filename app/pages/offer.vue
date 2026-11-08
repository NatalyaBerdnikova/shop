<script setup lang="ts">
import { shopContacts } from '~/data/contacts'

useHead({
  title: 'Публичная оферта',
  meta: [
    {
      name: 'description',
      content:
        'Как устроена покупка на amateru.st: цены в каталоге, оформление, доставка и оплата в чекауте Яндекса.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Публичная оферта"
  lead="Цены и описание изделий указаны в каталоге. Доставку и оплату выбираете в чекауте Яндекса."
)
  section.info-block
    h2.info-block__title Товары и цены
    p.info-block__text
      | Актуальные названия, описания и цены — на страницах каталога.
      | Цена в карточке — цена изделия до доставки.
    p.info-block__text
      NuxtLink(to="/catalog") Открыть каталог

  section.info-block
    h2.info-block__title Заказ, доставка и оплата
    p.info-block__text
      | В чекауте Яндекса доступны Яндекс Доставка и СДЭК, оплата картой, через СБП или Сплитом.
      | Стоимость доставки считает Яндекс после выбора города.
    p.info-block__text
      NuxtLink(to="/delivery") Подробнее о доставке и оплате

  section.info-block
    h2.info-block__title Реквизиты
    p.info-block__text
      | Полные реквизиты продавца на сайте не опубликованы. Вопросы по заказу — по телефону и почте.
    p.info-block__text
      a(:href="shopContacts.phoneHref") {{ shopContacts.phoneDisplay }}
      br
      a(:href="shopContacts.emailHref") {{ shopContacts.email }}
      br
      | {{ shopContacts.hours }}
</template>
