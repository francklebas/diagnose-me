import { ref, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const supabase = useSupabaseClient()

  onMounted(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
  })

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    login,
    signup,
    logout,
  }
}

