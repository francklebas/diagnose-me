export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si l'utilisateur n'est pas connecté, rediriger vers /login
  if (!user) {
    return navigateTo('/login')
  }
})



