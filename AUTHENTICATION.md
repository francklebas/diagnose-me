# Guide d'Authentification - Decisional Client

## Pages d'Authentification

### 1. **Page de Connexion** (`/app/pages/login.vue`)
Permet aux utilisateurs existants de se connecter avec leur email et mot de passe.

**URL**: `/login`

**Fonctionnalités**:
- Formulaire email/password
- Messages d'erreur en cas d'authentification échouée
- Redirection vers `/` après connexion réussie
- Lien vers la page `/signup` pour les nouveaux utilisateurs

### 2. **Page d'Inscription** (`/app/pages/signup.vue`)
Permet aux nouveaux utilisateurs de créer un compte.

**URL**: `/signup`

**Fonctionnalités**:
- Formulaire email/password avec confirmation
- Validation que les mots de passe correspondent
- Message de succès après inscription
- Lien vers la page `/login` pour les utilisateurs existants
- Email de confirmation automatique envoyé par Supabase

### 3. **Page de Confirmation** (`/app/pages/confirm.vue`)
Gère la confirmation de l'email après inscription.

**URL**: `/confirm`

**Fonctionnalités**:
- Traite automatiquement le hash du lien de confirmation
- Affiche un spinner pendant la vérification
- Message de succès après confirmation
- Redirection vers `/login` en cas d'erreur

## Middleware d'Authentification

### **Middleware Auth** (`/app/middleware/auth.ts`)
Protège les routes nécessitant une authentification.

**Fonctionnement**:
- Vérifie si l'utilisateur est connecté avant d'accéder à la page
- Redirige automatiquement vers `/login` si non authentifié
- Valide le token d'authentification

**Utilisation dans une page**:
```typescript
definePageMeta({
  middleware: ['auth']
})
```

## Page Protégée: Admin

### **Page Admin** (`/app/pages/admin.vue`)
Tableau de bord administrateur protégé par middleware.

**URL**: `/admin`

**Accès**: Réservé aux utilisateurs authentifiés

**Fonctionnalités**:
- Affiche l'email de l'utilisateur connecté
- Bouton de déconnexion
- Redirige vers `/login` si l'utilisateur n'est pas authentifié

## Composable d'Authentification

### **useAuth Composable** (`/app/composables/useAuth.ts`)
Composable réutilisable pour gérer l'authentification dans l'application.

**Utilisation**:
```typescript
const { user, loading, login, signup, logout } = useAuth()
```

**Méthodes**:
- `login(email, password)`: Connecte un utilisateur
- `signup(email, password)`: Crée un nouvel utilisateur
- `logout()`: Déconnecte l'utilisateur

**Propriétés**:
- `user`: Ref<User | null> - Utilisateur actuellement connecté
- `loading`: Ref<boolean> - État de chargement des opérations d'auth

## Configuration Supabase

Les paramètres d'authentification sont configurés dans `nuxt.config.ts`:

```typescript
supabase: {
  redirect: false,
  redirectOptions: {
    login: "/login",      // Redirection pour utilisateurs non authentifiés
    callback: "/confirm"  // Redirection après confirmation OAuth
  },
}
```

## Variables d'Environnement

Configurez dans `.env`:
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=votre_cle_publique
SUPABASE_KEY=votre_cle_service
SUPABASE_ANON_KEY=votre_cle_anon
```

## Flux d'Authentification

```
┌─────────────────┐
│  Visiteur       │
└────────┬────────┘
         │
         ├──→ [/] Accueil → Affiche lien "Se connecter/S'inscrire"
         │
         ├──→ [/login] Connexion
         │    │
         │    ├──→ Succès → Redirection vers [/]
         │    └──→ Erreur → Affiche message
         │
         ├──→ [/signup] Inscription
         │    │
         │    ├──→ Succès → Email de confirmation envoyé
         │    └──→ Erreur → Affiche message
         │
         └──→ [/admin] ✗ Accès refusé → Redirection vers [/login]

┌──────────────────┐
│ Utilisateur Auth │
└────────┬─────────┘
         │
         ├──→ [/] Accueil → Affiche email et boutons "Admin" et "Déconnecter"
         │
         ├──→ [/admin] ✓ Accès autorisé → Tableau de bord
         │
         └──→ Clic "Déconnecter" → Redirection vers [/]
```

## Sécurité

- Les tokens d'authentification sont stockés de manière sécurisée par Supabase
- Le middleware `auth` empêche l'accès aux pages protégées sans authentification
- Les mots de passe sont minimum 6 caractères (configurable)
- Les emails doivent être confirmés avant activation du compte

