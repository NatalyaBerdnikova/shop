// https://nuxt.com/docs/api/configuration/nuxt-config
import { staticPrerenderRoutes } from './shared/staticRoutes'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/global.scss'],

  app: {
    head: {
      title: 'amateru.st',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [{ name: 'theme-color', content: '#ffffff' }]
    }
  },

  // Чтобы Vue Language Tools / ts-plugin видел использование переменных в Pug-шаблонах
  typescript: {
    tsConfig: {
      vueCompilerOptions: {
        plugins: ['@vue/language-plugin-pug']
      }
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/svg-sprite'
  ],

  // Страница-список спрайта (`/_icons`) модулем задумана для dev и в статике не нужна.
  svgSprite: {
    iconsPath: false
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [...staticPrerenderRoutes]
    }
  },

  routeRules: {
    '/api/**': { prerender: false },
    '/v1/**': { prerender: false },
    '/metrics': { prerender: false },
    '/health': { prerender: false },
    '/cart': { redirect: '/catalog' },
    '/wishlist': { redirect: '/catalog' },
    '/checkout': { redirect: '/catalog' },
    '/order/**': { redirect: '/catalog' }
  },

  runtimeConfig: {
    databaseUrl: '',
    public: {
      siteUrl: ''
    }
  }
})
