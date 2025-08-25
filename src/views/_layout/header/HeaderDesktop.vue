<template>
  <div class="Header">
    <img src="~@/assets/img/logo.webp" alt="Logo" class="Header__logo" />
    <div class="Header__content">
      <span class="Header__title">{{ $t('header.title') }}</span>
      <div class="Header__actions">
        <v-tabs v-model="appStore.activeTab" align-tabs="start" color="main-blue">
          <v-tab
            v-for="(tab, index) in NavigationTabsService.getContent()"
            :value="tab.value"
            :to="tab.route"
            :key="index"
          >
            <v-icon :icon="tab.icon" class="mr-1"></v-icon>
            {{ tab.name }}
          </v-tab>
          <v-tab
            v-if="authStore.authSession && authStore.userInfos?.role === UserRole.ADMIN"
            :value="4"
            :to="{ name: 'admin' }"
            class="AdminTab"
          >
            <v-icon icon="$security" class="mr-1"></v-icon>
            {{ $t('header.tabs.admin') }}
          </v-tab>
        </v-tabs>
        <AuthButton />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AuthButton from '@/components/auth/AuthButton.vue'
import { UserRole } from '@/models/enums/UserRole'
import { NavigationTabsService } from '@/services/NavigationService'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthenticationStore } from '@/stores/authStore'
const appStore = useApplicationStore()
const authStore = useAuthenticationStore()
</script>
<style scoped lang="scss">
.Header {
  display: flex;
  align-items: center;

  &__logo {
    width: 10rem;
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
  padding-left: 1rem;
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
.AdminTab {
  color: rgb(var(--v-theme-main-purple));
}
</style>
