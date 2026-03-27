<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header Navigation -->
    <div class="border-b border-slate-200 bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <Icon name="lucide:shield-alert" class="h-8 w-8 text-blue-600" />
          <h1 class="text-2xl font-bold text-slate-900">Administration</h1>
        </div>
        <div class="flex items-center gap-3">
          <Badge>{{ user?.email }}</Badge>
          <Button
            variant="outline"
            size="sm"
            @click="handleLogout"
            class="gap-2"
          >
            <Icon name="lucide:log-out" class="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <Tabs default-value="users" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="users" class="gap-2">
            <Icon name="lucide:users" class="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="stats" class="gap-2">
            <Icon name="lucide:bar-chart-2" class="h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="settings" class="gap-2">
            <Icon name="lucide:settings" class="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <!-- Users Tab -->
        <TabsContent value="users" class="space-y-4">
          <Card>
            <CardHeader>
              <div class="flex justify-between items-center">
                <div>
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Gérez et visualisez tous les utilisateurs du système</CardDescription>
                </div>
                <Button @click="openCreateUserDialog" size="sm" class="gap-2">
                  <Icon name="lucide:plus" class="h-4 w-4" />
                  Nouvel utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div v-if="loadingUsers" class="flex items-center justify-center py-8">
                <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-600" />
              </div>

              <div v-else-if="users.length === 0" class="text-center py-8">
                <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">Aucun utilisateur trouvé</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="u in users"
                  :key="u.id"
                  class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <div class="flex-1">
                    <p class="font-medium text-slate-900">{{ u.email }}</p>
                    <p class="text-sm text-slate-500">
                      Créé le {{ formatDate(u.created_at) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge :variant="u.email_confirmed_at ? 'default' : 'secondary'">
                      {{ u.email_confirmed_at ? 'Confirmé' : 'En attente' }}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="deleteUser(u.id)"
                      class="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Stats Tab -->
        <TabsContent value="stats" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-slate-600">Utilisateurs Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold">{{ users.length }}</div>
                <p class="text-xs text-slate-500 mt-2">Utilisateurs enregistrés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-slate-600">Emails Confirmés</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-green-600">{{ confirmedCount }}</div>
                <p class="text-xs text-slate-500 mt-2">{{ confirmedCount }} / {{ users.length }}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-slate-600">En Attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-orange-600">{{ pendingCount }}</div>
                <p class="text-xs text-slate-500 mt-2">En attente de confirmation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Settings Tab -->
        <TabsContent value="settings" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Système</CardTitle>
              <CardDescription>Gérez les paramètres globaux de l'application</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label>Supabase URL</Label>
                <Input type="text" disabled :value="supabaseUrl" />
              </div>
              <div class="space-y-2">
                <Label>Mode de Maintenance</Label>
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-10 flex items-center px-3 bg-slate-100 rounded-md text-slate-600 text-sm">
                    {{ maintenanceMode ? 'Activé' : 'Désactivé' }}
                  </div>
                  <Button @click="toggleMaintenance" :variant="maintenanceMode ? 'destructive' : 'default'">
                    {{ maintenanceMode ? 'Désactiver' : 'Activer' }}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteDialog = false">Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

interface UserData {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
}

const supabase = useSupabaseClient()
const router = useRouter()
const user = ref<User | null>(null)
const users = ref<UserData[]>([])
const loadingUsers = ref(false)
const maintenanceMode = ref(false)
const showDeleteDialog = ref(false)
const userToDelete = ref<string | null>(null)

const supabaseUrl = computed(() => {
  return useRuntimeConfig().public.supabaseUrl || 'http://127.0.0.1:54321'
})

const confirmedCount = computed(() => {
  return users.value.filter(u => u.email_confirmed_at).length
})

const pendingCount = computed(() => {
  return users.value.filter(u => !u.email_confirmed_at).length
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  await router.push('/login')
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) throw error
    users.value = data?.users.map(u => ({
      id: u.id,
      email: u.email || '',
      created_at: u.created_at,
      email_confirmed_at: u.email_confirmed_at,
    })) || []
  } catch (err) {
    console.error('Erreur lors du chargement des utilisateurs:', err)
  } finally {
    loadingUsers.value = false
  }
}

const deleteUser = (userId: string) => {
  userToDelete.value = userId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    await supabase.auth.admin.deleteUser(userToDelete.value)
    users.value = users.value.filter(u => u.id !== userToDelete.value)
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
  } finally {
    showDeleteDialog.value = false
    userToDelete.value = null
  }
}

const openCreateUserDialog = () => {
  // À implémenter: dialog pour créer un nouvel utilisateur
  console.log('Ouvrir dialog de création')
}

const toggleMaintenance = () => {
  maintenanceMode.value = !maintenanceMode.value
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadUsers()
})

definePageMeta({
  middleware: ['auth']
})
</script>

