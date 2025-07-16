<!-- components/forms/LogoUpload.vue -->
<template>
  <div class="LogoUpload">
    <div class="logo-preview" v-if="currentLogoUrl">
      <img :src="currentLogoUrl" alt="Logo actuel" class="LogoUpload_image" />
      <v-btn
        icon="$delete"
        size="small"
        color="error"
        @click="removeLogo"
        class="LogoUpload_removeBtn"
      />
    </div>

    <v-file-input
      variant="outlined"
      :label="$t('associations.form.fields.logo')"
      accept="image/jpeg,image/png,image/webp"
      prepend-icon="$imagePlus"
      @change="onFileSelected"
      :loading="isUploading"
      :error-messages="errorMessage"
      show-size
    />

    <div class="LogoUpload_uploadHints">
      <v-chip size="small" color="main-blue">Max 1MB</v-chip>
      <v-chip size="small" color="main-blue">JPG, PNG, WebP</v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NotificationType } from '@/models/enums/NotificationType'
import { i18n } from '@/plugins/i18n'
import { addNotification } from '@/services/NotificationsService'
import { LogoUploadService } from '@/services/storage/LogoUploadService'
import { ref, watch } from 'vue'

interface Props {
  modelValue: string | null
  associationId: string
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentLogoUrl = ref<string | null>(props.modelValue)
const isUploading = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.modelValue,
  (newValue) => {
    currentLogoUrl.value = newValue
  },
)

const onFileSelected = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const file = files[0]
  errorMessage.value = null
  isUploading.value = true

  try {
    if (currentLogoUrl.value) {
      await LogoUploadService.deleteLogo(currentLogoUrl.value)
    }

    const logoUrl = await LogoUploadService.uploadLogo(file, props.associationId)
    currentLogoUrl.value = logoUrl
    emit('update:modelValue', logoUrl)

    addNotification(i18n.t('logoStorage.uploadSuccess'), NotificationType.SUCCESS)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : i18n.t('logoStorage.uploadFailed')
    addNotification(i18n.t('logoStorage.uploadFailed'), NotificationType.ERROR)
  } finally {
    isUploading.value = false
  }
}

const removeLogo = async () => {
  if (!currentLogoUrl.value) return

  try {
    await LogoUploadService.deleteLogo(currentLogoUrl.value)
    currentLogoUrl.value = null
    emit('update:modelValue', null)
    addNotification(i18n.t('logoStorage.deleteSuccess'), NotificationType.SUCCESS)
  } catch (error) {
    console.error(error)
    addNotification(i18n.t('logoStorage.deleteFailed'), NotificationType.ERROR)
  }
}
</script>

<style scoped lang="scss">
.LogoUpload {
  .logo-preview {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;

    .LogoUpload_image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
    }

    .LogoUpload_removeBtn {
      position: absolute;
      top: -8px;
      right: -8px;
    }
  }

  .LogoUpload_uploadHints {
    display: flex;
    gap: 8px;
    margin-top: -1rem;
    margin-bottom: 1rem;
    margin-left: 4rem;
  }
}
</style>
