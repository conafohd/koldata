<template>
  <v-dialog v-model="authStore.showAuthModal" max-width="400">
    <template #default>
      <v-card>
        <v-tabs v-model="activeTab" align-tabs="center" color="main-purple">
          <v-tab :value="1">
            <span class="Tabs--text">{{ $t('auth.signIn') }}</span>
          </v-tab>
          <v-tab :value="2">
            <span class="Tabs--text">{{ $t('auth.signUp') }}</span>
          </v-tab>
        </v-tabs>

        <!-- Sign In -->
        <template v-if="activeTab === 1">
          <v-card-text>
            <v-form @submit.prevent="onSignIn">
              <v-text-field
                :label="$t('auth.forms.labels.email')"
                v-model="signInForm.form.email.value.value"
                :error-messages="signInForm.form.email.errorMessage.value"
                @blur="signInForm.form.email.handleBlur"
                type="email"
                autocomplete="email"
              />
              <v-text-field
                :label="$t('auth.forms.labels.password')"
                v-model="signInForm.form.password.value.value"
                :error-messages="signInForm.form.password.errorMessage.value"
                @blur="signInForm.form.password.handleBlur"
                type="password"
                autocomplete="current-password"
              />
            </v-form>
            <span class="cursor-pointer" @click="showForgotPassword">{{
              $t('auth.forgotPassword')
            }}</span>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="authStore.showAuthModal = false">
              {{ $t('forms.cancel') }}
            </v-btn>
            <v-btn
              @click="onSignIn"
              :loading="signInForm.isSubmitting.value"
              :disabled="!signInForm.isValid.value"
              color="main-purple"
            >
              {{ $t('auth.signIn') }}
            </v-btn>
          </v-card-actions>
        </template>

        <!-- Sign Up -->
        <template v-else>
          <v-card-text>
            <v-form @submit.prevent="onSignUp">
              <v-text-field
                :label="$t('auth.forms.labels.email')"
                v-model="signUpForm.form.email.value.value"
                :error-messages="signUpForm.form.email.errorMessage.value"
                @blur="signUpForm.form.email.handleBlur"
                type="email"
                autocomplete="email"
              />
              <v-text-field
                :label="$t('auth.forms.labels.firstName')"
                v-model="signUpForm.form.firstName.value.value"
                :error-messages="signUpForm.form.firstName.errorMessage.value"
                @blur="signUpForm.form.firstName.handleBlur"
                autocomplete="given-name"
              />
              <v-text-field
                :label="$t('auth.forms.labels.lastName')"
                v-model="signUpForm.form.lastName.value.value"
                :error-messages="signUpForm.form.lastName.errorMessage.value"
                @blur="signUpForm.form.lastName.handleBlur"
                autocomplete="family-name"
              />
              <v-text-field
                :label="$t('auth.forms.labels.password')"
                v-model="signUpForm.form.password.value.value"
                :error-messages="signUpForm.form.password.errorMessage.value"
                @blur="signUpForm.form.password.handleBlur"
                type="password"
                autocomplete="new-password"
              />
              <v-text-field
                :label="$t('auth.forms.labels.confirmPassword')"
                v-model="signUpForm.form.confirmPassword.value.value"
                :error-messages="signUpForm.form.confirmPassword.errorMessage.value"
                @blur="signUpForm.form.confirmPassword.handleBlur"
                type="password"
                autocomplete="new-password"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="authStore.showAuthModal = false">
              {{ $t('forms.cancel') }}
            </v-btn>
            <v-btn
              @click="onSignUp"
              :loading="signUpForm.isSubmitting.value"
              :disabled="!signUpForm.isValid.value"
              color="main-purple"
            >
              {{ $t('auth.signUp') }}
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { AuthFormValidator } from '@/services/AuthFormService'
import { useAuthenticationStore } from '@/stores/authStore'
import { ref } from 'vue'

const authStore = useAuthenticationStore()
const activeTab = ref(1)

const signInForm = AuthFormValidator.getSignInForm()
const signUpForm = AuthFormValidator.getSignUpForm()

const onSignIn = signInForm.handleSubmit(async (values) => {
  const sanitizedData = AuthFormValidator.sanitizeFormData(values)
  await authStore.signIn({
    email: sanitizedData.email,
    password: sanitizedData.password,
  })
})

const onSignUp = signUpForm.handleSubmit(async (values) => {
  const sanitizedData = AuthFormValidator.sanitizeFormData(values)
  await authStore.signUp({
    email: sanitizedData.email,
    first_name: sanitizedData.firstName,
    last_name: sanitizedData.lastName,
    password: sanitizedData.password,
  })
})

function showForgotPassword() {
  authStore.showAuthModal = false
  authStore.showForgotPasswordModal = true
}
</script>
