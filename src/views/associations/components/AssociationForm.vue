<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card class="fullScreenCard">
      <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
        <v-btn
          icon="$close"
          @click="
            ((associationsStore.associationToEdit = null),
            (associationsStore.associationToCreate = false))
          "
        ></v-btn>
        <v-toolbar-title
          >{{
            associationsStore.associationToCreate
              ? $t('associations.form.createTitle')
              : associationsStore.associationToEdit?.newAssociation
                ? $t('associations.form.validateNewAssociationTitle')
                : $t('associations.form.updateTitle')
          }}
        </v-toolbar-title>
        <v-toolbar-items class="bg-white">
          <template v-if="authStore.isAdmin">
            <v-tooltip :text="$t('admin.refuseUpdateDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="refuseUpdate"
                  base-color="light-grey"
                  variant="flat"
                  v-bind="props"
                  :loading="associationForm.isSubmitting.value"
                  v-if="
                    associationsStore.associationToEdit?.waiting_for_validation ||
                    associationsStore.associationToEdit?.newAssociation
                  "
                  >{{ $t('admin.refuseUpdate') }}</v-btn
                >
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('admin.acceptUpdateDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="validateUpdate"
                  variant="flat"
                  color="main-purple"
                  v-bind="props"
                  :loading="associationForm.isSubmitting.value"
                  >{{
                    associationsStore.associationToEdit?.waiting_for_validation
                      ? $t('admin.acceptUpdate')
                      : $t('forms.validate')
                  }}</v-btn
                >
              </template>
            </v-tooltip>
          </template>
          <template v-else>
            <v-tooltip :text="$t('associations.form.buttons.saveDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="submitUpdate"
                  variant="flat"
                  color="light-blue"
                  v-bind="props"
                  :loading="associationForm.isSubmitting.value"
                  >{{ $t('associations.form.buttons.save') }}</v-btn
                >
              </template>
            </v-tooltip>
          </template>
        </v-toolbar-items>
      </v-toolbar>
      <div class="Form">
        <!-- Organisation Information -->
        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$informationSlabBoxOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.organisation') }}</span
          >
          <div class="Form__fields">
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.nom')"
              :placeholder="$t('associations.form.placeholders.nom')"
              v-model="associationForm.form.nom.value.value"
              :error-messages="associationForm.form.nom.errorMessage.value"
              @blur="associationForm.form.nom.handleBlur"
              required
            />
            <LogoUpload
              v-model="associationForm.form.logo_url.value.value"
              :association-id="associationsStore.associationToEdit?.id || 'temp-' + Date.now()"
              @update:model-value="associationForm.form.logo_url.handleChange"
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.acronyme')"
              :placeholder="$t('associations.form.placeholders.acronyme')"
              v-model="associationForm.form.acronyme.value.value"
              :error-messages="associationForm.form.acronyme.errorMessage.value"
              @blur="associationForm.form.acronyme.handleBlur"
              required
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.annee_creation')"
              :placeholder="$t('associations.form.placeholders.annee_creation')"
              v-model="associationForm.form.annee_creation.value.value"
              :error-messages="associationForm.form.annee_creation.errorMessage.value"
              @blur="associationForm.form.annee_creation.handleBlur"
              variant="outlined"
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.type_org')"
              v-model="associationForm.form.type_org.value.value as AssociationType"
              :error-messages="associationForm.form.type_org.errorMessage.value"
              @blur="associationForm.form.type_org.handleBlur"
              :items="Object.values(AssociationType)"
              :item-title="(key) => $t(`associations.form.lists.type_org.${key}`)"
              :item-value="(item) => item"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.type_org_autre')"
              :placeholder="$t('associations.form.placeholders.type_org_autre')"
              v-model="associationForm.form.type_org_autre.value.value"
              :error-messages="associationForm.form.type_org_autre.errorMessage.value"
              @blur="associationForm.form.type_org_autre.handleBlur"
              v-if="associationForm.form.type_org.value.value?.includes(AssociationType.OTHER)"
            />
            <v-textarea
              variant="outlined"
              :label="$t('associations.form.fields.desc')"
              :placeholder="$t('associations.form.placeholders.desc')"
              v-model="associationForm.form.desc.value.value"
              :error-messages="associationForm.form.desc.errorMessage.value"
              @blur="associationForm.form.desc.handleBlur"
              required
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.secteurs_interv')"
              v-model="associationForm.form.secteurs_interv.value.value as InterventionSector[]"
              :error-messages="associationForm.form.secteurs_interv.errorMessage.value"
              @blur="associationForm.form.secteurs_interv.handleBlur"
              :items="Object.values(InterventionSector)"
              :item-title="(key) => $t(`intervention_sector.${key}`)"
              :item-value="(item) => item"
              multiple
              chips
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.secteurs_interv_autre')"
              :placeholder="$t('associations.form.placeholders.secteurs_interv_autre')"
              v-model="associationForm.form.secteurs_interv_autre.value.value"
              :error-messages="associationForm.form.secteurs_interv_autre.errorMessage.value"
              @blur="associationForm.form.secteurs_interv_autre.handleBlur"
              v-if="
                associationForm.form.secteurs_interv.value.value?.includes(InterventionSector.OTHER)
              "
            />
            <v-divider color="light-blue mb-3" thickness="2" opacity="1"></v-divider>
            <span class="Form__fieldsTitle">{{
              $t('associations.form.hints.ressources_humaines')
            }}</span>
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.nb_salaries')"
              :placeholder="$t('associations.form.placeholders.nb_salaries')"
              v-model="associationForm.form.nb_salaries.value.value"
              :error-messages="associationForm.form.nb_salaries.errorMessage.value"
              @blur="associationForm.form.nb_salaries.handleBlur"
              variant="outlined"
            ></v-number-input>
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.nb_benevoles')"
              :placeholder="$t('associations.form.placeholders.nb_benevoles')"
              v-model="associationForm.form.nb_benevoles.value.value"
              :error-messages="associationForm.form.nb_benevoles.errorMessage.value"
              @blur="associationForm.form.nb_benevoles.handleBlur"
              variant="outlined"
            ></v-number-input>
          </div>
        </div>

        <!-- Location Information -->
        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$selectMarker" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.location') }}</span
          >
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.province')"
              v-model="associationForm.form.province.value.value"
              :error-messages="associationForm.form.province.errorMessage.value"
              @blur="associationForm.form.province.handleBlur"
              :items="adminBoundariesStore.provincesList"
              item-title="province"
              item-value="province_c"
              @update:model-value="
                ((associationForm.form.territoire.value.value = ''),
                (associationForm.form.zone_sante.value.value = ''),
                (associationForm.form.aire_sante.value.value = ''))
              "
              required
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.territoire')"
              v-model="associationForm.form.territoire.value.value"
              :error-messages="associationForm.form.territoire.errorMessage.value"
              @blur="associationForm.form.territoire.handleBlur"
              :items="territoriesList"
              item-title="territoire"
              item-value="territoire_c"
              @update:model-value="
                ((associationForm.form.zone_sante.value.value = ''),
                (associationForm.form.aire_sante.value.value = ''))
              "
              required
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.zone_sante')"
              v-model="associationForm.form.zone_sante.value.value"
              :error-messages="associationForm.form.zone_sante.errorMessage.value"
              @blur="associationForm.form.zone_sante.handleBlur"
              :items="healthZonesList"
              item-title="zone_sante"
              item-value="zone_sante_c"
              @update:model-value="associationForm.form.aire_sante.value.value = ''"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.aire_sante')"
              :placeholder="$t('associations.form.placeholders.aire_sante')"
              v-model="associationForm.form.aire_sante.value.value"
              :error-messages="associationForm.form.aire_sante.errorMessage.value"
              @blur="associationForm.form.aire_sante.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.localite')"
              :placeholder="$t('associations.form.placeholders.localite')"
              v-model="associationForm.form.localite.value.value"
              :error-messages="associationForm.form.localite.errorMessage.value"
              @blur="associationForm.form.localite.handleBlur"
              required
            />
            <v-divider color="light-blue" thickness="2" opacity="1"></v-divider>
            <span class="Form__fieldsTitle mt-3">{{
              $t('associations.form.hints.coord_gps')
            }}</span>
            <Geocoder
              :latitude="associationForm.form.latitude.value.value"
              :longitude="associationForm.form.longitude.value.value"
              :on-coordinates-change="handleCoordinatesChange"
              class="mt-4"
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$cardAccountMailOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.contacts') }}</span
          >
          <div class="Form__fields--noMargin mt-2">
            <span class="Form__fieldsTitle">{{
              $t('associations.form.hints.responsable_edition')
            }}</span>
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.nom_resp_edition')"
              :placeholder="$t('associations.form.placeholders.nom_resp_edition')"
              v-model="associationForm.form.nom_resp_edition.value.value"
              :error-messages="associationForm.form.nom_resp_edition.errorMessage.value"
              @blur="associationForm.form.nom_resp_edition.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.email_resp_edition')"
              :placeholder="$t('associations.form.placeholders.email_resp_edition')"
              v-model="associationForm.form.email_resp_edition.value.value"
              :error-messages="associationForm.form.email_resp_edition.errorMessage.value"
              @blur="associationForm.form.email_resp_edition.handleBlur"
              required
            />
            <v-divider color="light-blue mb-3" thickness="2" opacity="1"></v-divider>
            <span class="Form__fieldsTitle">{{
              $t('associations.form.hints.contact_public')
            }}</span>
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.nom_contact')"
              :placeholder="$t('associations.form.placeholders.nom_contact')"
              v-model="associationForm.form.nom_contact.value.value"
              :error-messages="associationForm.form.nom_contact.errorMessage.value"
              @blur="associationForm.form.nom_contact.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.tel_contact')"
              :placeholder="$t('associations.form.placeholders.tel_contact')"
              v-model="associationForm.form.tel_contact.value.value"
              :error-messages="associationForm.form.tel_contact.errorMessage.value"
              @blur="associationForm.form.tel_contact.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.email_contact')"
              :placeholder="$t('associations.form.placeholders.email_contact')"
              v-model="associationForm.form.email_contact.value.value"
              :error-messages="associationForm.form.email_contact.errorMessage.value"
              @blur="associationForm.form.email_contact.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.email_org')"
              :placeholder="$t('associations.form.placeholders.email_org')"
              v-model="associationForm.form.email_org.value.value"
              :error-messages="associationForm.form.email_org.errorMessage.value"
              @blur="associationForm.form.email_org.handleBlur"
              required
            />
            <v-divider color="light-blue mb-3" thickness="2" opacity="1"></v-divider>
            <span class="Form__fieldsTitle">{{ $t('associations.form.hints.social_media') }}</span>
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.website')"
              :placeholder="$t('associations.form.placeholders.website')"
              v-model="associationForm.form.website.value.value"
              :error-messages="associationForm.form.website.errorMessage.value"
              @blur="associationForm.form.website.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.facebook')"
              :placeholder="$t('associations.form.placeholders.facebook')"
              v-model="associationForm.form.facebook.value.value"
              :error-messages="associationForm.form.facebook.errorMessage.value"
              @blur="associationForm.form.facebook.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.twitter')"
              :placeholder="$t('associations.form.placeholders.twitter')"
              v-model="associationForm.form.twitter.value.value"
              :error-messages="associationForm.form.twitter.errorMessage.value"
              @blur="associationForm.form.twitter.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.instagram')"
              :placeholder="$t('associations.form.placeholders.instagram')"
              v-model="associationForm.form.instagram.value.value"
              :error-messages="associationForm.form.instagram.errorMessage.value"
              @blur="associationForm.form.instagram.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.linkedin')"
              :placeholder="$t('associations.form.placeholders.linkedin')"
              v-model="associationForm.form.linkedin.value.value"
              :error-messages="associationForm.form.linkedin.errorMessage.value"
              @blur="associationForm.form.linkedin.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.tiktok')"
              :placeholder="$t('associations.form.placeholders.tiktok')"
              v-model="associationForm.form.tiktok.value.value"
              :error-messages="associationForm.form.tiktok.errorMessage.value"
              @blur="associationForm.form.tiktok.handleBlur"
              required
            />
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.autre_social_media')"
              :placeholder="$t('associations.form.placeholders.autre_social_media')"
              v-model="associationForm.form.autre_social_media.value.value"
              :error-messages="associationForm.form.autre_social_media.errorMessage.value"
              @blur="associationForm.form.autre_social_media.handleBlur"
              required
            />
          </div>
        </div>

        <!-- Finances Information -->
        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$chartBoxMultipleOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.finances') }}</span
          >
          <div class="Form__fields--noMargin mt-2">
            <span class="Form__fieldsTitle">{{
              $t('associations.form.hints.budgets_history')
            }}</span>
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2025')"
              :placeholder="$t('associations.form.placeholders.enter_budget')"
              v-model="associationForm.form.budget_2025.value.value"
              :error-messages="associationForm.form.budget_2025.errorMessage.value"
              @blur="associationForm.form.budget_2025.handleBlur"
              variant="outlined"
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2024')"
              :placeholder="$t('associations.form.placeholders.enter_budget')"
              v-model="associationForm.form.budget_2024.value.value"
              :error-messages="associationForm.form.budget_2024.errorMessage.value"
              @blur="associationForm.form.budget_2024.handleBlur"
              variant="outlined"
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2023')"
              :placeholder="$t('associations.form.placeholders.enter_budget')"
              v-model="associationForm.form.budget_2023.value.value"
              :error-messages="associationForm.form.budget_2023.errorMessage.value"
              @blur="associationForm.form.budget_2023.handleBlur"
              variant="outlined"
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2022')"
              :placeholder="$t('associations.form.placeholders.enter_budget')"
              v-model="associationForm.form.budget_2022.value.value"
              :error-messages="associationForm.form.budget_2022.errorMessage.value"
              @blur="associationForm.form.budget_2022.handleBlur"
              variant="outlined"
            />
            <v-divider color="light-blue mb-3" thickness="2" opacity="1"></v-divider>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import Geocoder from '@/components/forms/Geocoder.vue'
import LogoUpload from '@/components/forms/LogoUpload.vue'
import { AssociationType } from '@/models/enums/associations/AssociationType'
import { InterventionSector } from '@/models/enums/InterventionSector'
import { NotificationType } from '@/models/enums/NotificationType'
import type { Association, AssociationUpdate } from '@/models/interfaces/Association'
import { i18n } from '@/plugins/i18n'
import { AssociationFormService } from '@/services/associations/AssociationFormService'
import { CommonFormService } from '@/services/forms/CommonFormService'
import { addNotification } from '@/services/NotificationsService'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, onMounted } from 'vue'
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const adminBoundariesStore = useAdminBoundariesStore()
const showDialog = computed(
  () =>
    associationsStore.associationToEdit !== null || associationsStore.associationToCreate !== null,
)

const associationForm = AssociationFormService.getAssociationForm(
  associationsStore.associationToEdit,
)

onMounted(async () => {
  await adminBoundariesStore.fetchBoundaries()
})
const territoriesList = computed(() => {
  if (!associationForm.form.province.value.value) {
    return adminBoundariesStore.territoriesList
  } else {
    return adminBoundariesStore.territoriesList.filter(
      (t) => t.province_c === associationForm.form.province.value.value,
    )
  }
})
const healthZonesList = computed(() => {
  if (!associationForm.form.territoire.value.value) {
    return adminBoundariesStore.healthZonesList
  } else {
    return adminBoundariesStore.healthZonesList.filter(
      (h) => h.territoire_c === associationForm.form.territoire.value.value,
    )
  }
})

const handleCoordinatesChange = (lat: number, lng: number) => {
  associationForm.form.latitude.value.value = lat
  associationForm.form.longitude.value.value = lng
}

const submitUpdate = associationForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    if (associationsStore.associationToEdit) {
      // If this association already have an update submitted, use the update id
      const associationId = (associationsStore.associationToEdit as AssociationUpdate)
        .association_id
        ? (associationsStore.associationToEdit as AssociationUpdate).association_id
        : associationsStore.associationToEdit!.id
      const updatedAssociation: AssociationUpdate = {
        ...sanitizedData,
        association_id: associationId,
      }
      await associationsStore.submitUpdate(updatedAssociation)
    } else {
      sanitizedData.created_by = authStore.userInfos?.id as string
      await associationsStore.createAssociation(sanitizedData)
    }
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)

function refuseUpdate() {
  if (associationsStore.associationToEdit?.newAssociation) {
    associationsStore.refuseNewAssociation(
      associationsStore.associationToEdit!.id as unknown as number,
    )
  } else {
    associationsStore.refuseUpdate(associationsStore.associationToEdit!.id as unknown as number)
  }
}

const validateUpdate = associationForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    if (associationsStore.associationToEdit?.newAssociation) {
      sanitizedData.created_by = (associationsStore.associationToEdit as Association).created_by
      await associationsStore.validateNewAssociation(sanitizedData)
    } else if (associationsStore.associationToEdit) {
      // If this association already have an update submitted, use the update id
      const associationId = (associationsStore.associationToEdit as AssociationUpdate)
        .association_id
        ? (associationsStore.associationToEdit as AssociationUpdate).association_id
        : associationsStore.associationToEdit!.id
      const updatedAssociation: Association = {
        ...sanitizedData,
        id: associationId,
      }
      await associationsStore.validateUpdate(updatedAssociation)
    } else if (associationsStore.associationToCreate) {
      sanitizedData.created_by = authStore.userInfos?.id as string
      await associationsStore.createAssociation(sanitizedData)
    }
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)
</script>
<style scoped lang="scss"></style>
