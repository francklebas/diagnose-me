<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold text-green-600">S'inscrire</CardTitle>
        <CardDescription>Créez votre compte Decisional Client</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSignup" class="space-y-4">
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
              minlength="6"
              :disabled="loading"
            />
            <p class="text-xs text-gray-500">Minimum 6 caractères</p>
          </div>
          <div class="space-y-2">
            <Label for="confirm-password" class="text-sm font-medium">Confirmer le mot de passe</Label>
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
        <Alert v-if="success" variant="default" class="mt-4 border-green-200 bg-green-50">
          <AlertTitle class="text-green-900">Succès</AlertTitle>
          <AlertDescription class="text-green-800">{{ success }}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter class="flex flex-col gap-4 text-center text-sm">
        <p class="text-gray-600">
          Vous avez déjà un compte ?
          <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
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
