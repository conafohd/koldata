import { NotificationType } from '@/models/enums/NotificationType'
import type { Notification } from '@/models/interfaces/Notifications'
import { useApplicationStore } from '@/stores/applicationStore'

export const addNotification = (
  message: string,
  notificationType = NotificationType.INFO,
  description?: string
) => {
  const appStore = useApplicationStore()
  const notification: Notification = {
    id: Date.now(),
    message,
    description,
    type: notificationType
  }
  appStore.notificationPile.push(notification)
}
