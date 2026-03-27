<template>
  <button
    :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    @click="toggleDarkMode"
    class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer
      bg-slate-700 hover:bg-slate-600 dark:bg-slate-200 dark:hover:bg-slate-300
      text-slate-100 dark:text-slate-900
      shadow-md hover:shadow-lg hover:scale-105
      border border-slate-600 dark:border-slate-300"
  >
    <Icon
      :name="isDark ? 'lucide:sun' : 'lucide:moon'"
      class="h-5 w-5 transition-transform duration-300 hover:rotate-180"
    />
    <span class="hidden sm:inline text-sm font-semibold">
      {{ isDark ? "☀️ Clair" : "🌙 Sombre" }}
    </span>
  </button>
</template>

<script setup lang="ts">
const { isDark, toggleDarkMode } = useDarkMode()
</script>


