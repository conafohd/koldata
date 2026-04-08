<template>
  <div class="Header">
    <router-link :to="{ name: 'home' }" class="Header__bannerLink" @click="appStore.activeTab = 0">
      <img src="~@/assets/img/logo.webp" alt="Logo" class="Header__logo"
    /></router-link>
    <div class="Header__content">
      <div class="Header__titleSection">
        <router-link
          :to="{ name: 'home' }"
          class="Header__bannerLink"
          @click="appStore.activeTab = 0"
        >
          <span class="Header__title">{{ $t('header.title') }}</span>
        </router-link>
        <div class="Header__langSelector">
          <span
            @click="appStore.changeLanguage('en')"
            :class="{ 'Header__langSelector--active': appStore.currentLocale === 'en' }"
            class="Header__langSelector__item"
          >
            En
          </span>
          <span class="Header__langSelector__separator">|</span>
          <span
            @click="appStore.changeLanguage('fr')"
            :class="{ 'Header__langSelector--active': appStore.currentLocale === 'fr' }"
            class="Header__langSelector__item"
          >
            Fr
          </span>
        </div>
      </div>

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
      <div v-if="authStore.userInfos?.role === UserRole.CREATOR" class="Header__creatorNotice">
        <span>{{ $t(noticeTranslationKey) }}</span>
        <button
          v-if="!newProjectSubmitted"
          type="button"
          class="Header__creatorNoticeLink"
          @click="openAssociationCreation"
        >
          {{ $t('header.creatorNotice.link') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AuthButton from '@/components/auth/AuthButton.vue'
import { UserRole } from '@/models/enums/UserRole'
import type { UserInfos } from '@/models/interfaces/UserInfos'
import { NavigationTabsService } from '@/services/NavigationService'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const appStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const router = useRouter()

const newProjectSubmitted = computed(() =>
  associationsStore.newAssociationsList.find(
    (x) => x.created_by === (authStore.userInfos as UserInfos | null)?.id,
  ),
)

const noticeTranslationKey = computed(() =>
  newProjectSubmitted.value
    ? 'header.creatorNotice.submittedMessage'
    : 'header.creatorNotice.message',
)

watch(
  () => authStore.userInfos?.role,
  async (role) => {
    if (role === UserRole.CREATOR && associationsStore.newAssociationsList.length === 0) {
      await associationsStore.getAssociationsList()
    }
  },
  { immediate: true },
)

async function openAssociationCreation() {
  if (router.currentRoute.value.name !== 'associations') {
    await router.push({ name: 'associations' })
  }

  associationsStore.associationToCreate = true
}
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
.Header__titleSection {
  display: flex;
  justify-content: space-between;
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
  align-items: center;
}
.Header__creatorNotice {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-left: 4px solid rgb(var(--v-theme-main-yellow));
  border-radius: 0.5rem;
  background: rgba(var(--v-theme-main-yellow), 0.18);
  color: rgb(var(--v-theme-main-grey));
  font-weight: 600;
}
.Header__creatorNoticeLink {
  border: none;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15rem;
  cursor: pointer;
}
.Header__creatorNoticeLink:hover {
  opacity: 0.8;
}
.Header__tabsText {
  text-transform: none;
  text-decoration: none;
}
.AdminTab {
  color: rgb(var(--v-theme-main-purple));
}
</style>
