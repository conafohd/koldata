<template>
  <v-dialog v-model="authStore.showAuthModal" max-width="400">
    <template #default>
      <v-card>
        <v-tabs v-model="activeTab" align-tabs="center" color="deep-purple-accent-4">
          <v-tab :value="1">Sign In</v-tab>
          <v-tab :value="2">Sign Up</v-tab>
        </v-tabs>
        <template v-if="activeTab === 1">
          <v-card-title>Se connecter</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field label="Email" v-model="email" />
              <v-text-field label="Mot de passe" type="password" v-model="password" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="authStore.showAuthModal = false">Annuler</v-btn>
            <v-btn @click.prevent.stop="authStore.signIn({ email: email, password: password })"
              >Se connecter</v-btn
            >
          </v-card-actions>
        </template>
        <template v-else>
          <v-card-title>Créer un compte</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field label="Email" v-model="email" />
              <v-text-field label="Mot de passe" type="password" v-model="password" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="authStore.showAuthModal = false">Annuler</v-btn>
            <v-btn @click="authStore.signUp({ email: email, password: password })"
              >Créer un compte</v-btn
            >
          </v-card-actions>
        </template>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authStore'
import { ref } from 'vue'

const authStore = useAuthenticationStore()
const email = ref('')
const password = ref('')
const activeTab = ref(1)
</script>
