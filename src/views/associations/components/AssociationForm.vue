<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card class="fullScreenCard">
      <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
        <v-btn icon="$close" @click="associationsStore.associationToEdit = null"></v-btn>
        <v-toolbar-title>{{ $t('associations.form.title') }}</v-toolbar-title>
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
                  v-if="associationsStore.associationToEdit?.waiting_for_validation"
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
      <div class="AssociationForm">
        <div class="AssociationForm__categoryCtn">
          <span class="AssociationForm__categoryTitle">
            <v-icon icon="$selectMarker" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.location') }}</span
          >
          <div class="AssociationForm__fields">
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.province')"
              v-model="associationForm.form.province.value.value"
              :error-messages="associationForm.form.province.errorMessage.value"
              @blur="associationForm.form.province.handleBlur"
              :items="['Kinshasa', 'autre']"
              required
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.territoire')"
              v-model="associationForm.form.territoire.value.value"
              :error-messages="associationForm.form.territoire.errorMessage.value"
              @blur="associationForm.form.territoire.handleBlur"
              :items="['Kinshasa', 'autre']"
              required
            />
            <v-select
              variant="outlined"
              :label="$t('associations.form.fields.zone_sante')"
              v-model="associationForm.form.zone_sante.value.value"
              :error-messages="associationForm.form.zone_sante.errorMessage.value"
              @blur="associationForm.form.zone_sante.handleBlur"
              :items="['Biyela', 'autre']"
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
          </div>
        </div>
        <div class="AssociationForm__categoryCtn">
          <span class="AssociationForm__categoryTitle">
            <v-icon icon="$informationSlabBoxOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.organisation') }}</span
          >
          <div class="AssociationForm__fields">
            <v-text-field
              variant="outlined"
              :label="$t('associations.form.fields.nom')"
              :placeholder="$t('associations.form.placeholders.nom')"
              v-model="associationForm.form.nom.value.value"
              :error-messages="associationForm.form.nom.errorMessage.value"
              @blur="associationForm.form.nom.handleBlur"
              required
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
              v-if="associationForm.form.type_org.value.value.includes(AssociationType.OTHER)"
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
              v-model="
                associationForm.form.secteurs_interv.value.value as AssociationInterventionSector[]
              "
              :error-messages="associationForm.form.secteurs_interv.errorMessage.value"
              @blur="associationForm.form.secteurs_interv.handleBlur"
              :items="Object.values(AssociationInterventionSector)"
              :item-title="(key) => $t(`associations.form.lists.intervention_sector.${key}`)"
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
                associationForm.form.secteurs_interv.value.value.includes(
                  AssociationInterventionSector.OTHER,
                )
              "
            />
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
        <div class="AssociationForm__categoryCtn">
          <span class="AssociationForm__categoryTitle">
            <v-icon icon="$cardAccountMailOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.contacts') }}</span
          >
          <div class="AssociationForm__fields">
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
            <v-divider color="light-blue mb-6" thickness="2" opacity="1"></v-divider>

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
        <div class="AssociationForm__categoryCtn">
          <span class="AssociationForm__categoryTitle">
            <v-icon icon="$chartBoxMultipleOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.finances') }}</span
          >
          <div class="AssociationForm__fields">
            <span class="AssociationForm__fieldsTitle">{{
              $t('associations.form.hints.budgets_history')
            }}</span>
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2024')"
              :placeholder="$t('associations.form.placeholders.budget_2024')"
              v-model="associationForm.form.budget_2024.value.value"
              :error-messages="associationForm.form.budget_2024.errorMessage.value"
              @blur="associationForm.form.budget_2024.handleBlur"
              variant="outlined"
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2023')"
              :placeholder="$t('associations.form.placeholders.budget_2023')"
              v-model="associationForm.form.budget_2023.value.value"
              :error-messages="associationForm.form.budget_2023.errorMessage.value"
              @blur="associationForm.form.budget_2023.handleBlur"
              variant="outlined"
            />
            <v-number-input
              controlVariant="stacked"
              :label="$t('associations.form.fields.budget_2022')"
              :placeholder="$t('associations.form.placeholders.budget_2022')"
              v-model="associationForm.form.budget_2022.value.value"
              :error-messages="associationForm.form.budget_2022.errorMessage.value"
              @blur="associationForm.form.budget_2022.handleBlur"
              variant="outlined"
            />
            <v-divider color="light-blue mb-6" thickness="2" opacity="1"></v-divider>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { AssociationInterventionSector } from '@/models/enums/associations/AssociationInterventionSector'
import { AssociationType } from '@/models/enums/associations/AssociationType'
import { NotificationType } from '@/models/enums/NotificationType'
import type { Association, AssociationUpdate } from '@/models/interfaces/Association'
import { i18n } from '@/plugins/i18n'
import { AssociationFormService } from '@/services/forms/associations/AssociationFormService'
import { CommonFormService } from '@/services/forms/CommonFormService'
import { addNotification } from '@/services/NotificationsService'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed } from 'vue'
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const showDialog = computed(() => associationsStore.associationToEdit !== null)

const associationForm = AssociationFormService.getAssociationForm(
  associationsStore.associationToEdit,
)

const submitUpdate = associationForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    // If this association already have an update submitted, use the update id
    const associationId = (associationsStore.associationToEdit as AssociationUpdate).association_id
      ? (associationsStore.associationToEdit as AssociationUpdate).association_id
      : associationsStore.associationToEdit!.id
    const updatedAssociation: AssociationUpdate = {
      ...sanitizedData,
      association_id: associationId,
    }
    await associationsStore.submitUpdate(updatedAssociation)
  },
  ({ errors }) => {
    console.log(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)

function refuseUpdate() {
  associationsStore.refuseUpdate(associationsStore.associationToEdit!.id as unknown as number)
}

const validateUpdate = associationForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    // If this association already have an update submitted, use the update id
    const associationId = (associationsStore.associationToEdit as AssociationUpdate).association_id
      ? (associationsStore.associationToEdit as AssociationUpdate).association_id
      : associationsStore.associationToEdit!.id
    const updatedAssociation: Association = {
      ...sanitizedData,
      id: associationId,
    }
    await associationsStore.validateUpdate(updatedAssociation)
  },
  ({ errors }) => {
    console.log(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)
</script>
<style scoped lang="scss">
.AssociationForm {
  display: flex;
  flex-grow: 1;
  width: 100%;
  padding: 1rem;
  gap: 1rem;
  height: calc(100vh - 64px);
}
.AssociationForm__categoryCtn {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid rgb(var(--v-theme-light-blue));
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--v-theme-light-blue)) transparent;
}
.AssociationForm__categoryTitle {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-main-grey));
  font-size: 1.2rem;
  flex-shrink: 0;
  font-weight: bold;
}
.AssociationForm__fields {
  margin-top: 2rem;
  flex: 1;
}
.AssociationForm__fieldsTitle {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-main-grey));
  flex-shrink: 0;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
