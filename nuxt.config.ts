// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  pages: true,
  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      pages: {
        defaultRoutes: {
          exclude: [],
        },
      },
    },
    compatibilityFlags: ["nodejs_compat"],
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
    "@nuxtjs/color-mode",
    "@nuxtjs/turnstile",
    "@nuxt/icon",
    "nuxt-lucide-icons",
  ],
  colorMode: {
    preference: "system", // Use system preference as initial value
    fallback: "dark", // Default to dark mode if system preference is not available
    classSuffix: "", // Remove suffix to get 'dark' instead of 'dark-mode'
    classPrefix: "", // Remove prefix
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
    },
  },
});

