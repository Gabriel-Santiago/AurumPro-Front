<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './store/authStore';

const auth = useAuthStore();

onMounted(() => {
  if (!auth.empresa) {
    auth.carregarEmpresa();
  }
});
</script>

<style>
body {
  margin: 0;
}
</style>
