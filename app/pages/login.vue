<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <!-- Header with Dark Mode Toggle -->
    <div class="flex justify-end mb-8">
      <DarkModeToggle />
    </div>

    <!-- Login Card -->
    <div class="flex items-center justify-center flex-1">
      <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold text-blue-600">Se connecter</CardTitle>
        <CardDescription>Accédez à votre compte Decisional Client</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="votre.email@example.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Mot de passe</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </Button>
        </form>

        <Alert v-if="error" variant="destructive" class="mt-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter class="flex flex-col gap-4 text-center text-sm">
        <p class="text-gray-600">
          Pas encore de compte ?
          <NuxtLink to="/signup" class="text-blue-600 hover:text-blue-700 font-medium">
            S'inscrire
          </NuxtLink>
        </p>
      </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const supabase = useSupabaseClient()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (authError) {
      error.value = authError.message
      return
    }

    // Redirect to home page on successful login
    await router.push('/')
  } catch (err) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'default'
})
</script>


