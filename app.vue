<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
  // Initialize dark mode on app startup
  onMounted(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    const prefersDark = !window.matchMedia("(prefers-color-scheme: light)").matches

    const isDark = savedDarkMode !== null ? savedDarkMode === "true" : prefersDark

    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  })
</script>





