# Dark Mode Integration Examples

## Adding Dark Mode Toggle to Navigation

Here's how to add the `<DarkModeToggle />` component to your navigation bar:

### Example: Index Page with Dark Mode Toggle

```vue
<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <!-- Navigation Bar -->
    <nav class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <Icon name="lucide:rocket" class="h-8 w-8 text-blue-500" />
          <span class="text-xl font-bold">Decisional Client</span>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <DarkModeToggle />
          
          <!-- Other navigation items -->
          <NuxtLink v-if="user" to="/admin">
            <Button size="sm">Admin</Button>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-5xl font-bold mb-6">Welcome</h1>
      <p class="text-lg text-slate-600 dark:text-slate-400">
        Your content here
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth() // Example composable
</script>
```

## Key Classes for Dark Mode

### Background Colors
```vue
<!-- Light: white, Dark: slate-950 -->
<div class="bg-white dark:bg-slate-950"></div>

<!-- Light: gray-50, Dark: slate-900 -->
<div class="bg-gray-50 dark:bg-slate-900"></div>
```

### Text Colors
```vue
<!-- Light: slate-900 (dark text), Dark: slate-100 (light text) -->
<p class="text-slate-900 dark:text-slate-100">Content</p>

<!-- Light: slate-600, Dark: slate-400 -->
<p class="text-slate-600 dark:text-slate-400">Muted text</p>

<!-- Light: slate-500, Dark: slate-500 -->
<p class="text-slate-500 dark:text-slate-500">Secondary text</p>
```

### Border Colors
```vue
<!-- Light: slate-200, Dark: slate-700 -->
<div class="border border-slate-200 dark:border-slate-700"></div>
```

### Component Patterns

#### Card Component
```vue
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
  <h2 class="text-slate-900 dark:text-slate-100 font-semibold">Title</h2>
  <p class="text-slate-600 dark:text-slate-400">Description</p>
</div>
```

#### Button States
```vue
<!-- Primary Button -->
<Button class="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800">
  Action
</Button>

<!-- Ghost Button -->
<Button variant="ghost" class="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
  Minimal
</Button>
```

#### Form Input
```vue
<input 
  type="text" 
  class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2"
  placeholder="Enter text..."
/>
```

## Programmatic Dark Mode Control

Use the `useDarkMode()` composable in any component:

```typescript
const { isDark, toggleDarkMode, setDarkMode } = useDarkMode()

// Check current mode
if (isDark.value) {
  console.log("Dark mode is active")
}

// Toggle mode
toggleDarkMode()

// Set specific mode
setDarkMode(true)  // Enable dark mode
setDarkMode(false) // Enable light mode
```

## Testing Dark Mode

1. Click the `<DarkModeToggle />` button in your navigation
2. Verify all text colors are visible and readable
3. Check that borders and backgrounds have sufficient contrast
4. Ensure icons and images look good in both modes

## Accessibility Considerations

- **Contrast Ratios**: Dark mode text (slate-100 on slate-950) meets WCAG AA standards
- **Light mode text** (slate-900 on white) also meets WCAG AA standards
- **Avoid pure white/black**: Use slate color palette for better readability
- **Test with real users**: Some users may have color vision deficiencies

## Performance

Dark mode preference is:
- Automatically saved to localStorage
- Restored on page reload
- Applied without layout shift (class applied before render)
- No additional bundle size (uses native CSS)

