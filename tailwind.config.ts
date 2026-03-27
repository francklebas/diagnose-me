import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme.js"

export default {
  darkMode: "class", // Use class-based dark mode for explicit control
  content: [
    "./app.vue",
    "./app/**/*.{js,ts,vue}",
    "./app/**/*.vue",
    "./components/**/*.{js,ts,vue}",
    "./pages/**/*.{js,ts,vue}",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Ensure proper contrast for text in dark mode
        foreground: {
          light: "#ffffff",
          dark: "#f1f5f9",
        },
        background: {
          light: "#ffffff",
          dark: "#0f172a",
        },
      },
      textColor: {
        DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
      },
    },
  },
  plugins: [
    // CSS variables for text colors to ensure proper contrast
    function ({ addBase }: any) {
      addBase({
        "@layer base": {
          ":root": {
            "--color-text": "0 0 0", // Black for light mode
          },
          "html.dark": {
            "--color-text": "241 245 249", // Slate-100 for dark mode
          },
        },
      })
    },
  ],
} satisfies Config


