<template>
  <Button
    size="sm"
    class="gap-2"
    :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    @click="toggleDarkMode"
  >
    <Icon v-if="isDark" name="lucide:sun" class="h-4 w-4" />
    <Icon v-else name="lucide:moon" class="h-4 w-4" />
    <span class="hidden sm:inline">{{ isDark ? "Mode clair" : "Mode sombre" }}</span>
  </Button>
</template>

<script setup lang="ts">
const { isDark, toggleDarkMode } = useDarkMode()
</script>


