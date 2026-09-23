<template lang="pug">
div
  NuxtRouteAnnouncer
  NuxtLayout
    NuxtPage
  CookieControl(locale="ru")
    template(#bar)
      h2 Мы используем cookie
      p
        | Нужны для работы сайта и входа в аккаунт. Подробнее —
        |
        NuxtLink(to="/privacy") в политике конфиденциальности
        | .
</template>
