<template>
  <div class="Header Header--mobile">
    <v-layout>
      <v-app-bar :elevation="2">
        <template v-slot:prepend>
          <v-app-bar-nav-icon
            color="main-blue"
            @click.stop="showMobileMenu = !showMobileMenu"
          ></v-app-bar-nav-icon>
        </template>
        <v-app-bar-title>
          <div class="d-flex align-center">
            <router-link
              :to="{ name: 'home' }"
              class="Header__bannerLink"
              @click="appStore.activeTab = 0"
            >
              <img loading="lazy" src="~@/assets/img/logo.webp" class="Header__appLogo" />
              <span class="ml-4 text-main-grey">{{ $t('header.title') }}</span>
            </router-link>
          </div>
        </v-app-bar-title>
      </v-app-bar>
    </v-layout>
    <div v-if="showMobileMenu" class="Header__menu">
      <div class="Header__menu__top">
        <img loading="lazy" src="~@/assets/img/logo.webp" class="Header__menu__logo" />
        <div class="Header__menu__closer" @click="showMobileMenu = !showMobileMenu">
          <v-icon icon="$close" />
        </div>
      </div>
      <div class="Header__menu__content">
        <v-list lines="one">
          <v-list-item
            v-for="(tab, index) in NavigationTabsService.getContent()"
            @click="showMobileMenu = !showMobileMenu"
            :key="index"
          >
            <RouterLink :to="tab.route" class="Header__tabsText">
              <span
                :class="{ 'Header__tabsText--active': appStore.activeTab === tab.value }"
                @click="appStore.activeTab = tab.value"
                >{{ tab.name }}</span
              >
            </RouterLink>
          </v-list-item>
          <v-list-item>
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
          </v-list-item>
          <v-list-item>
            <AuthButton />
          </v-list-item>
        </v-list>
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const appStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const router = useRouter()
const showMobileMenu = ref(false)

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
  showMobileMenu.value = false

  if (router.currentRoute.value.name !== 'associations') {
    await router.push({ name: 'associations' })
  }

  associationsStore.associationToCreate = true
}
</script>

<style lang="scss">
.Header {
  &--mobile {
    height: $header-mobile-height;

    &::after {
      width: 100%;
      max-height: 30rem;
      height: 60vh;
    }

    .Header__appLogo {
      padding: 5px;
      height: 50px;
    }

    .Header__tabsText {
      color: rgb(var(--v-theme-main-grey));
      font-weight: 600;
      text-transform: none;
      text-decoration: none;

      &--admin {
        color: rgb(var(--v-theme-main-purple));
      }

      &--active {
        color: rgb(var(--v-theme-main-blue));
      }
    }

    .Header__menu {
      position: absolute;
      top: 0px;
      left: 0px;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      z-index: 2000;

      &__top {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background-color: white;
        height: 200px;

        img {
          height: 160px;
        }
      }

      &__closer {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 2001;
        color: rgb(var(--v-theme-main-blue));
      }

      &__content {
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: white;
        flex-grow: 1;
        padding: $mobile-side-padding;
      }
    }

    .Header__creatorNotice {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
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
      text-align: left;
      text-decoration: underline;
      text-underline-offset: 0.15rem;
      cursor: pointer;
    }
  }
}
</style>
