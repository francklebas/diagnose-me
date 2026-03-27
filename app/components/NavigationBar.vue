<template>
  <nav class="border-b border-slate-700 dark:border-slate-200 bg-slate-900 dark:bg-white sticky top-0 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <!-- Logo/Brand -->
      <div class="flex items-center gap-3">
        <Icon name="lucide:rocket" class="h-8 w-8 text-blue-500 dark:text-blue-600" />
        <span class="text-xl font-bold text-white dark:text-slate-900">Decisional Client</span>
      </div>

      <!-- Right Side: Dark Mode Toggle + Auth Buttons -->
      <div class="flex items-center gap-4">
        <!-- Dark Mode Toggle - Highly Visible -->
        <div class="border-r border-slate-700 dark:border-slate-300 pr-4">
          <DarkModeToggle />
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-3">
          <slot name="auth">
            <!-- Default auth content slot -->
            <NuxtLink to="/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </NuxtLink>
            <NuxtLink to="/signup">
              <Button size="sm" class="gap-2">
                <Icon name="lucide:user-plus" class="h-4 w-4" />
                S'inscrire
              </Button>
            </NuxtLink>
          </slot>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// This component accepts a slot for custom auth content
</script>

