e<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
      <h1 class="text-2xl font-bold mb-4">Confirmation de l'email</h1>

      <div v-if="confirming" class="space-y-4">
        <p class="text-gray-600">Vérification en cours...</p>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
        </div>
      </div>

      <div v-else-if="success" class="space-y-4">
        <p class="text-green-600 font-medium">{{ success }}</p>
        <NuxtLink
          to="/"
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Retour à l'accueil
        </NuxtLink>
      </div>

      <div v-else-if="error" class="space-y-4">
        <p class="text-red-600 font-medium">{{ error }}</p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Retourner à la connexion
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const confirming = ref(true)
const success = ref('')
const error = ref('')

const supabase = useSupabaseClient()
const route = useRoute()

onMounted(async () => {
  try {
    const hash = route.hash.substring(1)
    if (!hash) {
      error.value = 'Lien de confirmation invalide'
      confirming.value = false
      return
    }

    const { error: authError } = await supabase.auth.verifyOtp({
      token_hash: hash,
      type: 'email',
    })

    if (authError) {
      error.value = authError.message || 'Erreur lors de la confirmation'
    } else {
      success.value = 'Votre email a été confirmé avec succès !'
    }
  } catch (err) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
    console.error(err)
  } finally {
    confirming.value = false
  }
})

definePageMeta({
  layout: 'default'
})
</script>

