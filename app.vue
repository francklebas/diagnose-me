<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

// Watch colorMode changes and apply the 'dark' class for Tailwind
watch(
  () => colorMode.value,
  (value) => {
    if (process.client) {
      const html = document.documentElement

      // Remove the 'dark-mode' class that color-mode adds by default
      html.classList.remove("dark-mode")
      html.classList.remove("light-mode")

      // Add our custom 'dark' class for Tailwind
      if (value === "dark") {
        html.classList.add("dark")
        html.style.colorScheme = "dark"
      } else {
        html.classList.remove("dark")
        html.style.colorScheme = "light"
      }
    }
  },
  { immediate: true }
)

// Also watch preference changes
watch(
  () => colorMode.preference,
  () => {
    console.log("Dark mode preference changed to:", colorMode.preference)
    console.log("Current value:", colorMode.value)
  }
)
</script>





