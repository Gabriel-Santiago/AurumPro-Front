import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (dark) => {
    isDark.value = dark
  }

  const theme = computed(() => {
    return isDark.value ? 'dark' : 'light'
  })

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme
  }
})