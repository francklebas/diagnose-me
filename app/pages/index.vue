<template>
  <div
    class="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white"
  >
    <!-- Navigation Bar -->
    <nav
      class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <Icon name="lucide:rocket" class="h-8 w-8 text-blue-500 dark:text-blue-400" />
          <span class="text-xl font-bold text-slate-900 dark:text-white">Decisional Client</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle - Prominent Position -->
          <div class="pl-3 border-l border-slate-300 dark:border-slate-600">
            <DarkModeToggle />
          </div>

          <template v-if="user">
            <Badge class="bg-green-500/20 text-green-200 border-green-500/50">
              {{ user.email }}
            </Badge>
            <NuxtLink to="/admin">
              <Button size="sm" class="gap-2">
                <Icon name="lucide:shield-alert" class="h-4 w-4" />
                Admin
              </Button>
            </NuxtLink>
            <Button variant="outline" size="sm" class="gap-2" @click="handleLogout">
              <Icon name="lucide:log-out" class="h-4 w-4" />
              Déconnecter
            </Button>
          </template>
          <template v-else>
            <NuxtLink to="/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </NuxtLink>
            <NuxtLink to="/signup">
              <Button size="sm" class="gap-2">
                <Icon name="lucide:user-plus" class="h-4 w-4" />
                S'inscrire
              </Button>
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <div class="text-center space-y-6">
        <h1 class="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white">
          Bienvenue sur
          <span
            class="bg-gradient-to-r from-blue-600 dark:from-blue-400 to-blue-600 dark:to-cyan-400 bg-clip-text text-transparent"
          >
            Decisional Client
          </span>
        </h1>
        <div v-if="!user" class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <NuxtLink to="/signup">
            <Button size="lg" class="gap-2 px-8">
              <Icon name="lucide:user-plus" class="h-5 w-5" />
              Créer un compte
            </Button>
          </NuxtLink>
          <NuxtLink to="/login">
            <Button size="lg" variant="outline" class="gap-2 px-8">
              <Icon name="lucide:log-in" class="h-5 w-5" />
              Se connecter
            </Button>
          </NuxtLink>
        </div>

        <div v-else class="flex justify-center pt-4">
          <NuxtLink to="/admin">
            <Button size="lg" class="gap-2 px-8">
              <Icon name="lucide:shield-alert" class="h-5 w-5" />
              Aller au tableau de bord admin
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-200 dark:border-slate-700 mt-16 py-8">
      <div class="max-w-7xl mx-auto px-4 text-center text-slate-600 dark:text-slate-400 text-sm">
        <p>Decisional Client © 2026 - Nuxt 4 + Supabase + Reka UI</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue"
  import type { User } from "@supabase/supabase-js"

  const user = ref<User | null>(null)
  const supabase = useSupabaseClient()
  const router = useRouter()

  onMounted(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user.value = currentUser
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    user.value = null
    await router.push("/")
  }
</script>
