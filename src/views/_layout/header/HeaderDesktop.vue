<template>
  <div class="Header">
    <img src="~@/assets/img/logo.webp" alt="Logo" class="Header__logo" />
    <div class="Header__content">
      <span class="Header__title">{{ $t('header.title') }}</span>
      <div class="Header__actions">
        <v-tabs v-model="appStore.activeTab" align-tabs="end" color="main-blue">
          <v-tab
            v-for="(tab, index) in NavigationTabsService.getContent()"
            :value="tab.value"
            :to="tab.route"
            :key="index"
          >
            <span class="Tabs--text">{{ tab.name }}</span>
          </v-tab>
        </v-tabs>
        <AuthButton />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AuthButton from '@/components/auth/AuthButton.vue'
import { NavigationTabsService } from '@/services/NavigationService'
import { useApplicationStore } from '@/stores/applicationStore'
const appStore = useApplicationStore()
</script>
<style scoped lang="scss">
.Header {
  display: flex;
  align-items: center;

  &__logo {
    width: 7.5rem;
  }
}

.Header__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 1rem;
}
.Header__title {
  font-size: 1.5rem;
  font-weight: bold;
}
.Header__actions {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
}
.Header__tabsText {
  text-transform: none;
  text-decoration: none;
}
</style>
