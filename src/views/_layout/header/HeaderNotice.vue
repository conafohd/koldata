<template>
  <div v-if="authStore.userInfos?.role === UserRole.PENDING" class="HeaderNotice HeaderNotice--pending">
    <span>{{ $t('header.pendingNotice.message') }}</span>
  </div>
  <div
    v-else-if="authStore.userInfos?.role === UserRole.CREATOR"
    class="HeaderNotice HeaderNotice--creator"
  >
    <span>{{ $t(noticeTranslationKey) }}</span>
    <button
      v-if="!newAssociationSubmitted"
      type="button"
      class="HeaderNotice__link"
      @click="openAssociationCreation"
    >
      {{ $t('header.creatorNotice.link') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '@/models/enums/UserRole'
import type { UserInfos } from '@/models/interfaces/UserInfos'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const router = useRouter()

const newAssociationSubmitted = computed(() =>
  associationsStore.newAssociationsList.find(
    (x) => x.created_by === (authStore.userInfos as UserInfos | null)?.id,
  ),
)

const noticeTranslationKey = computed(() =>
  newAssociationSubmitted.value
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
.HeaderNotice {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.5rem;
  color: rgb(var(--v-theme-main-grey));
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.45;

  &--creator {
    border-left: 4px solid rgb(var(--v-theme-main-yellow));
    background: rgba(var(--v-theme-main-yellow), 0.18);
  }

  &--pending {
    border-left: 4px solid rgb(var(--v-theme-main-blue));
    background: rgba(var(--v-theme-main-blue), 0.12);
  }
}

.HeaderNotice__link {
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

.HeaderNotice__link:hover {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .HeaderNotice {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
