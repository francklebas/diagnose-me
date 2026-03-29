/**
 * Composable for managing dark mode state
 * Dark mode is the default, light mode is toggleable
 * Directly manages the 'dark' class on the HTML element
 */
export const useDarkMode = () => {
  const isDark = ref(true) // Default to dark mode

  onMounted(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode !== null) {
      isDark.value = savedMode === "true"
    } else {
      // Default to dark, or check system preference
      isDark.value = !window.matchMedia("(prefers-color-scheme: light)").matches
    }
    applyDarkMode()
  })

  const applyDarkMode = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    // Persist the preference
    localStorage.setItem("darkMode", isDark.value.toString())
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    applyDarkMode()
  }

  const setDarkMode = (dark: boolean) => {
    isDark.value = dark
    applyDarkMode()
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
  }
}

