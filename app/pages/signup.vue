<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gradient-to-br dark:from-green-50 dark:to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-4">
    <!-- Header with Dark Mode Toggle -->
    <div class="flex justify-end mb-8">
      <DarkModeToggle />
    </div>

    <!-- Signup Card -->
    <div class="flex items-center justify-center flex-1">
      <Card class="w-full max-w-md">
        <CardHeader class="text-center">
          <CardTitle class="text-3xl font-bold text-green-600 dark:text-green-400">S'inscrire</CardTitle>
          <CardDescription class="text-slate-600 dark:text-slate-400">Créez votre compte Decisional Client</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSignup" class="space-y-4">
            <div class="space-y-2">
              <Label for="email" class="text-sm font-medium text-slate-900 dark:text-white">Email</Label>
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
              <Label for="password" class="text-sm font-medium text-slate-900 dark:text-white">Mot de passe</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                minlength="6"
                :disabled="loading"
              />
              <p class="text-xs text-slate-600 dark:text-slate-400">Minimum 6 caractères</p>
            </div>
            <div class="space-y-2">
              <Label for="confirm-password" class="text-sm font-medium text-slate-900 dark:text-white">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minlength="6"
                :disabled="loading"
              />
            </div>
            <Button type="submit" class="w-full" :disabled="loading || password !== confirmPassword">
              <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Inscription en cours...' : 'S\'inscrire' }}
            </Button>
          </form>
          <Alert v-if="error" variant="destructive" class="mt-4">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
          <Alert v-if="success" variant="default" class="mt-4 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
            <AlertTitle class="text-green-900 dark:text-green-300">Succès</AlertTitle>
            <AlertDescription class="text-green-800 dark:text-green-200">{{ success }}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter class="flex flex-col gap-4 text-center text-sm">
          <p class="text-slate-600 dark:text-slate-400">
            Vous avez déjà un compte ?
            <NuxtLink to="/login" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Se connecter
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
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const supabase = useSupabaseClient()
const router = useRouter()
const handleSignup = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (authError) {
      error.value = authError.message
      return
    }
    success.value = 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
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
