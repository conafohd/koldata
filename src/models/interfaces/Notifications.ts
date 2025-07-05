import type { NotificationType } from '@/models/enums/NotificationType'

export interface Notification {
  id: number
  message: string
  description?: string
  type: NotificationType
}
