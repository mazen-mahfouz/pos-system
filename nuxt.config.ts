// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path'
export default defineNuxtConfig({
  alias: {
    '@': resolve(__dirname, '/'),
  },

  css: [
    '~/assets/css/main.scss',
    'notivue/notification.css',
    'notivue/animations.css'
  ],

  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-swiper', '@pinia/nuxt','notivue/nuxt'],

  swiper: {
    prefix: 'Swiper',
    styleLang: 'css',
  },

  runtimeConfig: {
    // Keys within public, will be also exposed to the client-side
    public: {
        apiBase: "https://resturant-pos-production.up.railway.app/api",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    },
},

  notivue: {
    limit: 4,
    enqueue: true,
    notifications: {
        global: {
            duration: 4000,
        },
    },
  },

  ui: {
    theme: {
      default: 'light', // Set the default theme to 'light'
    },
  },

  build: {
    transpile: ['@nuxt/ui']
  },

  colorModel: {
    preference: 'light',
  },

  compatibilityDate: '2024-10-15',
})