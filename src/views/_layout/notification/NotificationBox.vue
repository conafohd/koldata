<template>
  <v-snackbar
    class="NotificationBox"
    v-model="isNotificationShown"
    :timeout="notificationTime"
    :bg-color="color"
    :color="color"
  >
    <span class="NotificationBox__message font-weight-bold">{{ activeNotification?.message }}</span>
    <p class="NotificationBox__desc" v-if="activeNotification?.description">
      {{ activeNotification?.description }}
    </p>
  </v-snackbar>
</template>

<script setup lang="ts">
import { NotificationType } from '@/models/enums/NotificationType'
import type { Notification } from '@/models/interfaces/Notifications'
import { useApplicationStore } from '@/stores/applicationStore'
import { computed, ref, watch, type Ref } from 'vue'

const appStore = useApplicationStore()
const activeNotification: Ref<Notification | null | undefined> = ref(null)
const isNotificationShown = ref(false)
const notificationTime = computed(() =>
  activeNotification.value?.type === NotificationType.ERROR ? 7000 : 2500,
)
let processingNotifications = false
const color = computed(() => {
  switch (activeNotification.value?.type) {
    case NotificationType.SUCCESS:
      return '#29a322'
    case NotificationType.ERROR:
      return '#e81313'
    case NotificationType.INFO:
    default:
      return 'main-purple'
  }
})

const processNotifications = async () => {
  if (processingNotifications) return
  processingNotifications = true

  while (appStore.notificationPile.length > 0) {
    activeNotification.value = appStore.notificationPile[0]
    isNotificationShown.value = true

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, notificationTime.value + 300)
    })

    appStore.notificationPile.shift()
    isNotificationShown.value = false
  }

  activeNotification.value = null
  processingNotifications = false
}

watch(
  () => appStore.notificationPile,
  async () => {
    processNotifications()
  },
  { deep: true },
)
</script>

<style lang="scss">
.NotificationBox {
  margin: 1.5rem;
  display: flex;
  align-self: flex-end;
  justify-content: flex-end;
}
</style>
