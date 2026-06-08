import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".vite/**", "coverage/**", "src/env.d.ts"],
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.browser,
    },
  },
  {
    files: ["playwright.config.js", "vitest.config.js", "vite.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["e2e/**/*.js", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "no-self-assign": "off",
    },
  },
];
