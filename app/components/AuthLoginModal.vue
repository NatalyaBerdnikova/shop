<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()

const loading = ref(false)
const error = ref('')

const configured = computed(
  () => Boolean(config.public.yandexOauthClientId)
)

const callbackUri = computed(() => {
  if (!import.meta.client) return '/api/auth/yandex/callback'
  return `${window.location.origin}/api/auth/yandex/callback`
})

const titleId = useId()

watch(
  () => auth.loginModalOpen,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) error.value = ''
  }
)

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && auth.loginModalOpen) auth.closeLoginModal()
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
  if (import.meta.client) document.body.style.overflow = ''
})

async function loginWithYandex() {
  error.value = ''
  loading.value = true
  try {
    await auth.startYandexLogin(route.fullPath || '/')
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string }; statusMessage?: string }
    error.value =
      fetchError.data?.message ||
      fetchError.statusMessage ||
      'Не удалось начать вход через Яндекс ID'
    loading.value = false
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  Transition(name="auth-modal")
    .auth-modal(v-if="auth.loginModalOpen" role="presentation")
      button.auth-modal__backdrop(
        type="button"
        tabindex="-1"
        aria-label="Закрыть"
        @click="auth.closeLoginModal()"
      )
      .auth-modal__dialog(
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      )
        button.auth-modal__close(
          type="button"
          aria-label="Закрыть"
          @click="auth.closeLoginModal()"
        ) ×

        p.auth-modal__eyebrow Аккаунт
        h2.auth-modal__title(:id="titleId") Вход в Цитадель
        p.auth-modal__text
          | Войдите через Яндекс ID — подтянем имя, фамилию, телефон, почту
          | и дату рождения, если вы разрешите доступ.

        .auth-modal__unconfigured(v-if="!configured")
          p Чтобы включить вход, добавьте в&nbsp;
            code .env
            | :
          ul
            li NUXT_YANDEX_OAUTH_CLIENT_ID
            li NUXT_YANDEX_OAUTH_CLIENT_SECRET
            li NUXT_PUBLIC_YANDEX_OAUTH_CLIENT_ID
          p
            | Redirect URI в кабинете OAuth:
            |
            code {{ callbackUri }}

        button.auth-modal__yandex(
          type="button"
          :disabled="loading || !configured"
          @click="loginWithYandex"
        )
          span.auth-modal__yandex-mark(aria-hidden="true") Я
          span {{ loading ? 'Переходим в Яндекс…' : 'Войти с Яндекс ID' }}

        p.auth-modal__error(v-if="error" role="alert") {{ error }}

        p.auth-modal__note
          | Запрашиваем права: имя и фамилия, email, телефон, дата рождения.
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 1rem;

  &__backdrop {
    position: absolute;
    inset: 0;
    margin: 0;
    border: none;
    background: rgb(15 15 16 / 48%);
    cursor: pointer;
  }

  &__dialog {
    position: relative;
    z-index: 1;
    width: min(100%, 26rem);
    padding: 1.6rem 1.45rem 1.45rem;
    border-radius: 1.1rem;
    border: 1px solid $color-ink-10;
    background: $color-paper;
    box-shadow: 0 24px 60px rgb(15 15 16 / 18%);
  }

  &__close {
    position: absolute;
    top: 0.55rem;
    right: 0.55rem;
    width: 2.4rem;
    height: 2.4rem;
    border: none;
    border-radius: 0.6rem;
    background: transparent;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: $color-ink;
  }

  &__eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-gold;
  }

  &__title {
    margin: 0;
    font-size: 1.55rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__text,
  &__note,
  &__unconfigured {
    margin: 0.75rem 0 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: $color-ink-55;
  }

  &__unconfigured {
    padding: 0.85rem 0.95rem;
    border-radius: 0.75rem;
    background: $color-white;
    border: 1px solid $color-ink-8;

    ul {
      margin: 0.5rem 0;
      padding-left: 1.1rem;
    }

    code {
      font-size: 0.8rem;
      word-break: break-all;
    }
  }

  &__yandex {
    margin-top: 1.25rem;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    height: 2.75rem;
    border: none;
    border-radius: 999px;
    background: #000;
    color: #fff;
    font: inherit;
    font-size: 0.92rem;
    letter-spacing: 0.02em;
    cursor: pointer;

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 3px;
    }
  }

  &__yandex-mark {
    display: grid;
    place-items: center;
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 0.3rem;
    background: #fc3f1d;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__error {
    margin: 0.75rem 0 0;
    font-size: 0.85rem;
    color: #8a3a32;
  }

  &__note {
    margin-top: 0.9rem;
    font-size: 0.8rem;
  }
}

.auth-modal-enter-active,
.auth-modal-leave-active {
  transition: opacity 0.2s ease;

  .auth-modal__dialog {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.auth-modal-enter-from,
.auth-modal-leave-to {
  opacity: 0;

  .auth-modal__dialog {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.98);
  }
}
</style>
