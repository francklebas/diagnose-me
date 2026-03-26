// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  pages: true,
  nitro: {
    preset: "cloudflare-pages",
  },
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/devtools",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "reka-ui",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "nuxt-security",
    "@nuxtjs/turnstile",
    "@nuxt/icon",
    "nuxt-lucide-icons",
  ],
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
    },
  },
});

