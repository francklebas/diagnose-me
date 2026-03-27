<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Navigation Bar -->
    <nav class="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <Icon name="lucide:rocket" class="h-8 w-8 text-blue-500" />
          <span class="text-xl font-bold text-white">Decisional Client</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle - Prominent Position -->
          <div class="pl-3 border-l border-slate-600">
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
            <Button
              variant="outline"
              size="sm"
              @click="handleLogout"
              class="gap-2"
            >
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
        <h1 class="text-5xl sm:text-6xl font-bold text-white">
          Bienvenue sur
          <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Decisional Client
          </span>
        </h1>
        <p class="text-xl text-slate-300 max-w-2xl mx-auto">
          Une application Nuxt 4 avec authentification Supabase, interface Reka UI et tableau de bord administrateur complet
        </p>

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

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Feature 1 -->
        <Card class="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 bg-blue-500/20 rounded-lg">
                <Icon name="lucide:lock" class="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle class="text-white">Authentification Sécurisée</CardTitle>
            </div>
            <CardDescription class="text-slate-400">
              Connexion et inscription avec Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-300">
              Middleware de protection, confirmation d'email, gestion des tokens sécurisée
            </p>
          </CardContent>
        </Card>

        <!-- Feature 2 -->
        <Card class="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 bg-green-500/20 rounded-lg">
                <Icon name="lucide:palette" class="h-6 w-6 text-green-400" />
              </div>
              <CardTitle class="text-white">Interface Reka UI</CardTitle>
            </div>
            <CardDescription class="text-slate-400">
              Composants modernes et accessibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-300">
              Cards, Buttons, Inputs, Dialogs, Tabs avec TailwindCSS et Lucide Icons
            </p>
          </CardContent>
        </Card>

        <!-- Feature 3 -->
        <Card class="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 bg-purple-500/20 rounded-lg">
                <Icon name="lucide:gauge" class="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle class="text-white">Tableau de Bord Admin</CardTitle>
            </div>
            <CardDescription class="text-slate-400">
              Gestion complète des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-300">
              Visualisation, statistiques, suppression d'utilisateurs avec Supabase Admin API
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Status Section -->
    <div v-if="user" class="max-w-7xl mx-auto px-4 py-12">
      <Card class="border-slate-700 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle class="text-white flex items-center gap-2">
            <Icon name="lucide:check-circle-2" class="h-6 w-6 text-green-400" />
            Vous êtes connecté
          </CardTitle>
        </CardHeader>
        <CardContent class="text-slate-300">
          <p>Bienvenue, {{ user.email }}! Vous avez accès au tableau de bord administrateur.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-700 mt-16 py-8">
      <div class="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
        <p>Decisional Client © 2026 - Nuxt 4 + Supabase + Reka UI</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const supabase = useSupabaseClient()
const router = useRouter()

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  await router.push('/')
}
</script>
