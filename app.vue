<template>
  <div :class="{ dark: isDark }">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const { isDark } = useDarkMode()

// Apply dark class to html element for Tailwind dark mode
const colorMode = useColorMode()

watch(
  () => colorMode.value,
  (value) => {
    if (import.meta.client) {
      const html = document.documentElement
      if (value === "dark") {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* Ensure proper text colors for dark and light modes */
:global(html.dark) {
  @apply bg-slate-950 text-slate-100;
}

:global(html) {
  @apply bg-white text-slate-900;
}
</style>


