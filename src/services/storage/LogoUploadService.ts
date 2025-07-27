// services/storage/FileUploadService.ts
import { NotificationType } from '@/models/enums/NotificationType'
import { UserRole } from '@/models/enums/UserRole'
import { i18n } from '@/plugins/i18n'
import { supabase } from '@/plugins/supabase'
import { useAuthenticationStore } from '@/stores/authStore'
import { v4 as uuidv4 } from 'uuid'
import { addNotification } from '../NotificationsService'

export class LogoUploadService {
  private static readonly BUCKET_NAME = 'association-logos'
  private static readonly MAX_FILE_SIZE = 1024 * 1024 // 1MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  static async uploadLogo(file: File, associationId: string): Promise<string> {

    await this.checkUserPermissions()
    
    this.validateFile(file)
    
    const fileExtension = file.name.split('.').pop()
    const fileName = `${associationId}-${uuidv4()}.${fileExtension}`
    const filePath = `logos/${fileName}`

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      if (error.message.includes('policy')) {
        addNotification(i18n.t('logoStorage.permissionDenied'), NotificationType.ERROR)
        throw new Error(i18n.t('logoStorage.permissionDenied'))
      }
      throw new Error(i18n.t('logoStorage.uploadFailed') + `: ${error.message}`)
    }

    return this.getPublicUrl(data.path)
  }

  static async deleteLogo(logoUrl: string): Promise<void> {
    await this.checkUserPermissions()

    const path = this.extractPathFromUrl(logoUrl)
    if (!path) return

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path])

    if (error) {
      if (error.message.includes('policy')) {
        addNotification(i18n.t('logoStorage.permissionDenied'), NotificationType.ERROR)
        throw new Error(i18n.t('logoStorage.permissionDenied', NotificationType.ERROR))
      }
      console.error('Failed to delete logo:', error)
      addNotification(i18n.t('logoStorage.deleteFailed'), NotificationType.ERROR)
    }
  }

  private static async checkUserPermissions(): Promise<void> {
    const authStore = useAuthenticationStore()

    if (!authStore.authSession) {
      console.log('User not authenticated')
      addNotification(i18n.t('logoStorage.permissionDenied'), NotificationType.ERROR)
      throw new Error(i18n.t('logoStorage.permissionDenied', NotificationType.ERROR))
    }

    if (authStore.userInfos?.role !== UserRole.EDITOR && !authStore.isAdmin) {
      console.log('User does not have permission to upload logos')
      console.log(authStore.isAdmin)
      addNotification(i18n.t('logoStorage.permissionDenied'), NotificationType.ERROR)
      throw new Error(i18n.t('logoStorage.permissionDenied', NotificationType.ERROR))
    }
  }

  private static validateFile(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      addNotification(i18n.t('logoStorage.invalidType'), NotificationType.ERROR)
      throw new Error(i18n.t('logoStorage.invalidType', NotificationType.ERROR))
    }

    if (file.size > this.MAX_FILE_SIZE) {
      addNotification(i18n.t('logoStorage.sizeExceeded'), NotificationType.ERROR)
      throw new Error(i18n.t('logoStorage.sizeExceeded', NotificationType.ERROR))
    }
  }

  private static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  private static extractPathFromUrl(url: string): string | null {
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
    return match ? match[1] : null
  }
}
