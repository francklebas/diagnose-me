/**
 * Composable for managing dark mode state
 * Dark mode is the default, light mode is toggleable
 */
export const useDarkMode = () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === "dark")

  const toggleDarkMode = () => {
    // Directly set the preference to toggle
    colorMode.preference = isDark.value ? "light" : "dark"
  }

  const setDarkMode = (dark: boolean) => {
    colorMode.preference = dark ? "dark" : "light"
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
  }
}

