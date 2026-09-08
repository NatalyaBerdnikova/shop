import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser } from '~~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const ready = ref(false)
  const loginModalOpen = ref(false)

  const isLoggedIn = computed(() => Boolean(user.value))

  const fullName = computed(() => {
    if (!user.value) return ''
    const name = `${user.value.firstName} ${user.value.lastName}`.trim()
    return name || user.value.displayName
  })

  function openLoginModal() {
    loginModalOpen.value = true
  }

  function closeLoginModal() {
    loginModalOpen.value = false
  }

  async function fetchMe() {
    try {
      const res = await $fetch<{ user: AuthUser | null }>('/api/auth/me')
      user.value = res.user
    } catch {
      user.value = null
    } finally {
      ready.value = true
    }
  }

  async function startYandexLogin(redirect = '/') {
    const res = await $fetch<{ url: string }>('/api/auth/yandex/url', {
      query: { redirect }
    })
    if (!import.meta.client) return
    window.location.assign(res.url)
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user,
    ready,
    loginModalOpen,
    isLoggedIn,
    fullName,
    openLoginModal,
    closeLoginModal,
    fetchMe,
    startYandexLogin,
    logout
  }
})
