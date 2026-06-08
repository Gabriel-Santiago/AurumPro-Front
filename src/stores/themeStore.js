import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

const THEME_STORAGE_KEY = "aurumpro-theme";

export const useThemeStore = defineStore("theme", () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  const isDark = ref(savedTheme ? savedTheme === "dark" : true);

  const theme = computed(() => {
    return isDark.value ? "dark" : "light";
  });

  function applyTheme() {
    document.documentElement.dataset.theme = theme.value;

    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  function setTheme(dark) {
    isDark.value = dark;
  }

  watch(
    isDark,
    () => {
      localStorage.setItem(THEME_STORAGE_KEY, theme.value);
      applyTheme();
    },
    { immediate: true }
  );

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
    applyTheme,
  };
});
