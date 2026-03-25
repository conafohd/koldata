<template>
  <div class="AuthPageLayoutShell">
    <v-container class="AuthPageLayout" :class="{ 'AuthPageLayout--full': fullWidth }">
      <div class="AuthPageLayout__logoArea">
        <RouterLink class="AuthPageLayout__logoBox" :to="{ name: 'home' }">
          <!-- <v-icon icon="$database" size="30" color="main-blue" /> -->
          <v-img :src="faviconPath" :width="30" alt="Kongo Local Data" />
        </RouterLink>
        <h2 class="AuthPageLayout__brand">{{ $t('auth.brandShort') }}</h2>
      </div>

      <v-card class="AuthPageLayout__card" elevation="0">
        <v-card-text class="AuthPageLayout__cardContent">
          <div v-if="icon" class="AuthPageLayout__icon">
            <v-icon :icon="icon" size="34" color="main-blue" />
          </div>

          <v-card-title class="AuthPageLayout__title">{{ title }}</v-card-title>
          <v-card-subtitle v-if="subtitle" class="AuthPageLayout__subtitle">{{ subtitle }}</v-card-subtitle>

          <div class="AuthPageLayout__content">
            <slot />
          </div>
        </v-card-text>
      </v-card>

      <div v-if="$slots.footer" class="AuthPageLayout__footer">
        <slot name="footer" />
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPublicPath } from '@/services/utils/ImageService'

defineProps<{
  title: string
  subtitle?: string
  icon?: string
  fullWidth?: boolean
}>()

const faviconPath = computed(() => getPublicPath('favicon.ico'))
</script>

<style scoped lang="scss">
.AuthPageLayoutShell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.AuthPageLayout {
  width: 500px;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  max-width: 100%;
}

.AuthPageLayout--full {
  max-width: 900px;
}

.AuthPageLayout__logoArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.6rem;
  animation: AuthPageLayout-fade-up 0.38s ease both;
}

.AuthPageLayout__logoBox {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.AuthPageLayout__brand {
  color: rgb(var(--v-theme-main-blue));
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.AuthPageLayout__card {
  width: 100%;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 45px -28px rgba(51, 92, 142, 0.45) !important;
  animation: AuthPageLayout-fade-up 0.42s ease 0.04s both;
}

.AuthPageLayout__cardContent {
  padding: 2rem;
}

.AuthPageLayout__icon {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: rgba(51, 92, 142, 0.1);
  display: grid;
  place-items: center;
  margin-bottom: 0.8rem;
}

.AuthPageLayout__title {
  white-space: normal;
  line-height: 1.2;
  padding: 0;
  padding-inline: 0;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.AuthPageLayout__subtitle {
  white-space: normal;
  color: #64748b;
  font-size: 0.9rem;
  padding-inline: 0;
  padding: 0;
  margin-bottom: 1.4rem;
}

.AuthPageLayout__content {
  margin-top: 0;
}

.AuthPageLayout__footer {
  margin-top: 1rem;
  text-align: center;
  animation: AuthPageLayout-fade-up 0.46s ease 0.08s both;
}

@keyframes AuthPageLayout-fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
