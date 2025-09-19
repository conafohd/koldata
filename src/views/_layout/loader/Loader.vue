<template>
  <div class="loader">
    <div class="loader-spinner"></div>
    <p>{{ $t('loading.message') }}</p>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.loader {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-direction: column;
  height: 70vh;
}

.loader-spinner {
  border: 4px solid rgb(var(--v-theme-main-blue));
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
