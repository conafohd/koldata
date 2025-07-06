<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card>
      <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
        <v-btn icon="$close" @click="cancelEdition"></v-btn>
        <v-toolbar-title>{{ $t('associations.form.title') }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn text="Save" variant="text" @click="cancelEdition"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="AssociationForm">
        <v-form @submit.prevent="onSubmit">
          <v-row>
            <!-- Informations générales -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.generalInfo') }}</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.nom')"
                v-model="associationForm.form.nom.value.value"
                :error-messages="associationForm.form.nom.errorMessage.value"
                @blur="associationForm.form.nom.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.acronyme')"
                v-model="associationForm.form.acronyme.value.value"
                :error-messages="associationForm.form.acronyme.errorMessage.value"
                @blur="associationForm.form.acronyme.handleBlur"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                :label="$t('associations.forms.labels.desc')"
                v-model="associationForm.form.desc.value.value"
                :error-messages="associationForm.form.desc.errorMessage.value"
                @blur="associationForm.form.desc.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :label="$t('associations.forms.labels.type_org')"
                v-model="associationForm.form.type_org.value.value"
                :error-messages="associationForm.form.type_org.errorMessage.value"
                @blur="associationForm.form.type_org.handleBlur"
                :items="[]"
                required
              />
            </v-col>

            <v-col cols="12" md="6" v-if="associationForm.form.type_org.value.value === 'Autre'">
              <v-text-field
                :label="$t('associations.forms.labels.type_org_autre')"
                v-model="associationForm.form.type_org_autre.value.value"
                :error-messages="associationForm.form.type_org_autre.errorMessage.value"
                @blur="associationForm.form.type_org_autre.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.annee_creation')"
                v-model.number="associationForm.form.annee_creation.value.value"
                :error-messages="associationForm.form.annee_creation.errorMessage.value"
                @blur="associationForm.form.annee_creation.handleBlur"
                type="number"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :label="$t('associations.forms.labels.secteurs_interv')"
                v-model="associationForm.form.secteurs_interv.value.value"
                :error-messages="associationForm.form.secteurs_interv.errorMessage.value"
                @blur="associationForm.form.secteurs_interv.handleBlur"
                :items="[]"
                multiple
                chips
                required
              />
            </v-col>

            <!-- Localisation -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.locationInfo') }}</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.province')"
                v-model="associationForm.form.province.value.value"
                :error-messages="associationForm.form.province.errorMessage.value"
                @blur="associationForm.form.province.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.territoire')"
                v-model="associationForm.form.territoire.value.value"
                :error-messages="associationForm.form.territoire.errorMessage.value"
                @blur="associationForm.form.territoire.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.zone_sante')"
                v-model="associationForm.form.zone_sante.value.value"
                :error-messages="associationForm.form.zone_sante.errorMessage.value"
                @blur="associationForm.form.zone_sante.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.aire_sante')"
                v-model="associationForm.form.aire_sante.value.value"
                :error-messages="associationForm.form.aire_sante.errorMessage.value"
                @blur="associationForm.form.aire_sante.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.localite')"
                v-model="associationForm.form.localite.value.value"
                :error-messages="associationForm.form.localite.errorMessage.value"
                @blur="associationForm.form.localite.handleBlur"
                required
              />
            </v-col>

            <!-- Coordonnées géographiques -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.coordinates') }}</h3>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.latitude')"
                v-model.number="associationForm.form.latitude.value.value"
                :error-messages="associationForm.form.latitude.errorMessage.value"
                @blur="associationForm.form.latitude.handleBlur"
                type="number"
                step="any"
                required
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.longitude')"
                v-model.number="associationForm.form.longitude.value.value"
                :error-messages="associationForm.form.longitude.errorMessage.value"
                @blur="associationForm.form.longitude.handleBlur"
                type="number"
                step="any"
                required
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.altitude')"
                v-model.number="associationForm.form.altitude.value.value"
                :error-messages="associationForm.form.altitude.errorMessage.value"
                @blur="associationForm.form.altitude.handleBlur"
                type="number"
              />
            </v-col>

            <!-- Budgets -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.budgetInfo') }}</h3>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.budget_2022')"
                v-model.number="associationForm.form.budget_2022.value.value"
                :error-messages="associationForm.form.budget_2022.errorMessage.value"
                @blur="associationForm.form.budget_2022.handleBlur"
                type="number"
                min="0"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.budget_2023')"
                v-model.number="associationForm.form.budget_2023.value.value"
                :error-messages="associationForm.form.budget_2023.errorMessage.value"
                @blur="associationForm.form.budget_2023.handleBlur"
                type="number"
                min="0"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :label="$t('associations.forms.labels.budget_2024')"
                v-model.number="associationForm.form.budget_2024.value.value"
                :error-messages="associationForm.form.budget_2024.errorMessage.value"
                @blur="associationForm.form.budget_2024.handleBlur"
                type="number"
                min="0"
              />
            </v-col>

            <!-- Ressources humaines -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.humanResources') }}</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.nb_salaries')"
                v-model.number="associationForm.form.nb_salaries.value.value"
                :error-messages="associationForm.form.nb_salaries.errorMessage.value"
                @blur="associationForm.form.nb_salaries.handleBlur"
                type="number"
                min="0"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.nb_benevoles')"
                v-model.number="associationForm.form.nb_benevoles.value.value"
                :error-messages="associationForm.form.nb_benevoles.errorMessage.value"
                @blur="associationForm.form.nb_benevoles.handleBlur"
                type="number"
                min="0"
                required
              />
            </v-col>

            <!-- Contacts -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.contactInfo') }}</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.nom_resp_edition')"
                v-model="associationForm.form.nom_resp_edition.value.value"
                :error-messages="associationForm.form.nom_resp_edition.errorMessage.value"
                @blur="associationForm.form.nom_resp_edition.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.email_resp_edition')"
                v-model="associationForm.form.email_resp_edition.value.value"
                :error-messages="associationForm.form.email_resp_edition.errorMessage.value"
                @blur="associationForm.form.email_resp_edition.handleBlur"
                type="email"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.email_org')"
                v-model="associationForm.form.email_org.value.value"
                :error-messages="associationForm.form.email_org.errorMessage.value"
                @blur="associationForm.form.email_org.handleBlur"
                type="email"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.nom_contact')"
                v-model="associationForm.form.nom_contact.value.value"
                :error-messages="associationForm.form.nom_contact.errorMessage.value"
                @blur="associationForm.form.nom_contact.handleBlur"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.tel_contact')"
                v-model="associationForm.form.tel_contact.value.value"
                :error-messages="associationForm.form.tel_contact.errorMessage.value"
                @blur="associationForm.form.tel_contact.handleBlur"
                type="tel"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.email_contact')"
                v-model="associationForm.form.email_contact.value.value"
                :error-messages="associationForm.form.email_contact.errorMessage.value"
                @blur="associationForm.form.email_contact.handleBlur"
                type="email"
                required
              />
            </v-col>

            <!-- Réseaux sociaux -->
            <v-col cols="12">
              <h3 class="section-title">{{ $t('associations.socialMedia') }}</h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.website')"
                v-model="associationForm.form.website.value.value"
                :error-messages="associationForm.form.website.errorMessage.value"
                @blur="associationForm.form.website.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.facebook')"
                v-model="associationForm.form.facebook.value.value"
                :error-messages="associationForm.form.facebook.errorMessage.value"
                @blur="associationForm.form.facebook.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.twitter')"
                v-model="associationForm.form.twitter.value.value"
                :error-messages="associationForm.form.twitter.errorMessage.value"
                @blur="associationForm.form.twitter.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.instagram')"
                v-model="associationForm.form.instagram.value.value"
                :error-messages="associationForm.form.instagram.errorMessage.value"
                @blur="associationForm.form.instagram.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.linkedin')"
                v-model="associationForm.form.linkedin.value.value"
                :error-messages="associationForm.form.linkedin.errorMessage.value"
                @blur="associationForm.form.linkedin.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :label="$t('associations.forms.labels.tiktok')"
                v-model="associationForm.form.tiktok.value.value"
                :error-messages="associationForm.form.tiktok.errorMessage.value"
                @blur="associationForm.form.tiktok.handleBlur"
                type="url"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                :label="$t('associations.forms.labels.autre_social_media')"
                v-model="associationForm.form.autre_social_media.value.value"
                :error-messages="associationForm.form.autre_social_media.errorMessage.value"
                @blur="associationForm.form.autre_social_media.handleBlur"
              />
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { AssociationFormService } from '@/services/forms/AssociationFormService'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed } from 'vue'
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
const onSubmit = associationForm.handleSubmit((values) => {
  console.log('values', values)
})
</script>
<style scoped lang="scss">
.AssociationForm {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
</style>
