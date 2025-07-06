<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card class="fullScreenCard">
      <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
        <v-btn icon="$close" @click="cancelEdition"></v-btn>
        <v-toolbar-title>{{ $t('associations.form.title') }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn text="Save" variant="text" @click="cancelEdition"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="AssociationForm">
        <div class="AssociationForm__categoryCtn">
          <span class="AssociationForm__categoryTitle">
            <v-icon icon="$selectMarker" class="mr-1" color="light-blue"></v-icon>
            {{ $t('associations.form.categories.location') }}</span
          >
          <div class="AssociationForm__field">
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
          <div class="AssociationForm__field">
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

          <div class="AssociationForm__field">
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
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { AssociationInterventionSector } from '@/models/enums/associations/AssociationInterventionSector'
import { AssociationType } from '@/models/enums/associations/AssociationType'
import { AssociationFormService } from '@/services/forms/AssociationFormService'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, onMounted } from 'vue'
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const showDialog = computed(() => associationsStore.editStatus !== null)
function cancelEdition() {
  associationsStore.editStatus = null
  associationsStore.associationToEdit = null
}

const associationForm = AssociationFormService.getAssociationForm(
  associationsStore.associationToEdit,
)
onMounted(() => {
  console.log('associationForm', associationForm)
})
const onSubmit = associationForm.handleSubmit((values) => {
  console.log('values', values)
})
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
.AssociationForm__field {
  margin-top: 2rem;
  flex: 1;
}
</style>
