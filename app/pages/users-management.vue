<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <div class="border-b border-slate-200 bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center gap-3 mb-2">
          <Icon name="lucide:users-cog" class="h-8 w-8 text-blue-600" />
          <h1 class="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
        </div>
        <p class="text-slate-600">Gérez les utilisateurs via l'API Admin de Supabase</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Create User Card -->
      <Card class="mb-8">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="lucide:user-plus" class="h-5 w-5" />
            Créer un nouvel utilisateur
          </CardTitle>
          <CardDescription>Ajouter un utilisateur manuellement via l'API Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="createUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="new-email">Email</Label>
                <Input
                  id="new-email"
                  v-model="newUserForm.email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  :disabled="creatingUser"
                />
              </div>
              <div class="space-y-2">
                <Label for="new-password">Mot de passe</Label>
                <Input
                  id="new-password"
                  v-model="newUserForm.password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minlength="6"
                  :disabled="creatingUser"
                />
              </div>
            </div>

            <div class="flex gap-2">
              <Button type="submit" :disabled="creatingUser" class="gap-2">
                <Icon v-if="creatingUser" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                {{ creatingUser ? 'Création en cours...' : 'Créer l\'utilisateur' }}
              </Button>
              <Button
                type="button"
                variant="outline"
                @click="resetNewUserForm"
                :disabled="creatingUser"
              >
                Réinitialiser
              </Button>
            </div>

            <Alert v-if="createError" variant="destructive" class="mt-4">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{{ createError }}</AlertDescription>
            </Alert>

            <Alert v-if="createSuccess" variant="default" class="mt-4 border-green-200 bg-green-50">
              <AlertTitle class="text-green-900">Succès</AlertTitle>
              <AlertDescription class="text-green-800">{{ createSuccess }}</AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>

      <!-- Users List -->
      <Card>
        <CardHeader>
          <div class="flex justify-between items-center">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Icon name="lucide:list" class="h-5 w-5" />
                Liste des utilisateurs
              </CardTitle>
              <CardDescription>Total: {{ users.length }} utilisateur(s)</CardDescription>
            </div>
            <Button @click="refreshUsers" :disabled="loadingUsers" size="sm" variant="outline" class="gap-2">
              <Icon name="lucide:refresh-cw" class="h-4 w-4" :class="{ 'animate-spin': loadingUsers }" />
              Rafraîchir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="loadingUsers" class="flex items-center justify-center py-12">
            <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-600" />
          </div>

          <div v-else-if="users.length === 0" class="text-center py-12">
            <Icon name="lucide:inbox" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Aucun utilisateur trouvé</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="u in users"
              :key="u.id"
              class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition group"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon name="lucide:user" class="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ u.email }}</p>
                    <p class="text-xs text-slate-500">
                      ID: {{ u.id.slice(0, 8) }}... | Créé: {{ formatDate(u.created_at) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Badge :variant="u.email_confirmed_at ? 'default' : 'secondary'">
                  <Icon
                    :name="u.email_confirmed_at ? 'lucide:check' : 'lucide:clock'"
                    class="mr-1 h-3 w-3"
                  />
                  {{ u.email_confirmed_at ? 'Confirmé' : 'En attente' }}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" class="opacity-0 group-hover:opacity-100 transition">
                      <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="copyToClipboard(u.id)">
                      <Icon name="lucide:copy" class="mr-2 h-4 w-4" />
                      Copier l'ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      @click="deleteUser(u.id)"
                      class="text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Dialog -->
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
            :disabled="deletingUser"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            <Icon v-if="deletingUser" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ deletingUser ? 'Suppression...' : 'Supprimer' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface UserData {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
}

const supabase = useSupabaseClient()
const users = ref<UserData[]>([])
const loadingUsers = ref(false)
const creatingUser = ref(false)
const deletingUser = ref(false)
const showDeleteDialog = ref(false)
const userToDelete = ref<string | null>(null)

const newUserForm = ref({
  email: '',
  password: '',
})

const createError = ref('')
const createSuccess = ref('')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
    console.error('Erreur:', err)
  } finally {
    loadingUsers.value = false
  }
}

const createUser = async () => {
  createError.value = ''
  createSuccess.value = ''
  creatingUser.value = true

  try {
    const { error } = await supabase.auth.admin.createUser({
      email: newUserForm.value.email,
      password: newUserForm.value.password,
      email_confirm: true,
    })

    if (error) throw error

    createSuccess.value = `Utilisateur ${newUserForm.value.email} créé avec succès!`
    resetNewUserForm()
    await loadUsers()
  } catch (err: any) {
    createError.value = err.message || 'Erreur lors de la création'
  } finally {
    creatingUser.value = false
  }
}

const resetNewUserForm = () => {
  newUserForm.value = { email: '', password: '' }
  createSuccess.value = ''
  createError.value = ''
}

const deleteUser = (userId: string) => {
  userToDelete.value = userId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  deletingUser.value = true
  try {
    await supabase.auth.admin.deleteUser(userToDelete.value)
    users.value = users.value.filter(u => u.id !== userToDelete.value)
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
  } finally {
    showDeleteDialog.value = false
    deletingUser.value = false
    userToDelete.value = null
  }
}

const refreshUsers = async () => {
  await loadUsers()
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

onMounted(async () => {
  await loadUsers()
})

definePageMeta({
  middleware: ['auth']
})
</script>

