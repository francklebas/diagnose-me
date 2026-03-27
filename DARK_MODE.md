# Dark Mode Implementation Guide

## Overview

Dark mode is now the **default** for the Decisional Client application. Users can toggle between dark and light modes, with dark mode being the fallback preference.

## Configuration

### Modules & Dependencies

- **@nuxtjs/color-mode**: Manages color mode state (dark/light)
- **TailwindCSS**: Provides dark mode utilities with class-based strategy

### Settings (nuxt.config.ts)

```typescript
colorMode: {
  preference: "system",     // Respects system preference
  fallback: "dark",         // Default to dark if system preference unavailable
  classSuffix: "",          // Uses 'dark' class on html element
}
```

## Usage

### Composable: `useDarkMode()`

Available in all components:

```typescript
import { useDarkMode } from '#app'

export default {
  setup() {
    const { isDark, toggleDarkMode, setDarkMode, colorMode } = useDarkMode()

    return {
      isDark,           // Computed boolean: true if dark mode
      toggleDarkMode,   // Function: toggle between dark/light
      setDarkMode,      // Function: set specific mode (bool)
      colorMode,        // Ref: access raw color mode value
    }
  }
}
```

### Component: `<DarkModeToggle />`

Auto-imported toggle button component:

```vue
<template>
  <DarkModeToggle />
</template>
```

Displays sun/moon icon with responsive label.

### TailwindCSS Dark Mode

Use Tailwind's dark mode prefix for conditional styling:

```vue
<template>
  <!-- Light mode: white background, dark text -->
  <!-- Dark mode: dark background, light text -->
  <div class="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    Content
  </div>
</template>
```

## Color Palette

### Light Mode
- **Background**: `#ffffff` (white)
- **Text**: `#000000` (black)

### Dark Mode
- **Background**: `#0f172a` (slate-950)
- **Text**: `#f1f5f9` (slate-100)

## Font Color Handling

Font colors are automatically adjusted based on the current mode:

- Light mode text is dark (`slate-900` or black)
- Dark mode text is light (`slate-100` or white)

Always use semantic classes for text instead of hardcoding colors:

```vue
<!-- ✅ Good: Adaptive text -->
<p class="text-slate-900 dark:text-slate-100">Content</p>

<!-- ✅ Better: Use inherited text color -->
<p>Content</p>

<!-- ❌ Avoid: Hardcoded colors that don't adapt -->
<p class="text-white">Content</p>
```

## Persistence

The user's mode preference is automatically saved to localStorage and restored on next visit.

## Adding Dark Mode Support to Existing Components

1. **Add dark mode variants** to all color-dependent classes:
   ```vue
   class="bg-white dark:bg-slate-900 text-black dark:text-white"
   ```

2. **Use Tailwind's dark prefix** for conditional styling
3. **Test both modes** to ensure contrast and readability

## Testing

To test dark mode locally:
1. Access the `<DarkModeToggle />` component in the UI
2. Check that styles properly switch between modes
3. Verify text contrast meets accessibility standards (WCAG AA minimum)

## References

- [TailwindCSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [@nuxtjs/color-mode](https://color-mode.nuxtjs.org/)

