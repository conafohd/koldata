<template>
  <div class="OAuthConsent">
    <div class="OAuthConsent__card">
      <header class="OAuthConsent__header">
        <div class="OAuthConsent__brand">
          <div class="OAuthConsent__brandIcon">
            <v-icon icon="$database" size="18" color="main-blue" />
          </div>
          <h2>{{ $t('auth.brand') }}</h2>
        </div>
        <RouterLink class="OAuthConsent__close" :to="{ name: 'auth-sign-in' }">
          <v-icon icon="$close" size="20" />
        </RouterLink>
      </header>

      <div class="OAuthConsent__body">
        <template v-if="loading">
          <div class="OAuthConsent__loading">
            <v-progress-circular indeterminate color="main-blue" size="24" />
            <span>{{ $t('auth.pages.oauthConsent.loading') }}</span>
          </div>
        </template>

        <template v-else-if="error">
          <v-alert type="error" variant="tonal">{{ error }}</v-alert>
          
          <!-- Add restart button for state mismatch errors -->
          <div v-if="error.toLowerCase().includes('session has expired') || error.toLowerCase().includes('session a expiré')" class="OAuthConsent__restart">
            <v-btn 
              color="main-blue" 
              variant="outlined" 
              @click="restartOAuthFlow"
              class="mt-4"
            >
              {{ $t('auth.pages.oauthConsent.restartFlow') }}
            </v-btn>
          </div>
        </template>

        <template v-else-if="!authDetails">
          <v-alert type="warning" variant="tonal">{{ $t('auth.pages.oauthConsent.notFound') }}</v-alert>
        </template>

        <template v-else>
          <div class="OAuthConsent__visual">
            <div class="OAuthConsent__appIcon">
              <v-icon icon="$apps" size="30" color="#64748b" />
            </div>
            <v-icon icon="$swapHorizontal" size="24" color="#cbd5e1" />
            <div class="OAuthConsent__kolIcon">
              <v-icon icon="$database" size="30" color="main-blue" />
            </div>
          </div>

          <div class="OAuthConsent__titleBlock">
            <h3>{{ $t('auth.pages.oauthConsent.title', { client: authDetails.client?.name ?? $t('auth.pages.oauthConsent.defaultClient') }) }}</h3>
            <p>
              <strong>{{ authDetails.client?.name ?? $t('auth.pages.oauthConsent.thisApp') }}</strong>
              {{ $t('auth.pages.oauthConsent.requestingAccess') }}
            </p>
          </div>

          <div class="OAuthConsent__permissions">
            <h4>{{ $t('auth.pages.oauthConsent.permissionsTitle') }}</h4>
            <div class="OAuthConsent__permissionsList">
              <div class="OAuthConsent__permissionItem">
                <v-icon icon="$linkVariant" size="18" color="main-blue" />
                <div>
                  <strong>{{ $t('auth.pages.oauthConsent.redirectUri') }}</strong>
                  <p>{{ authDetails.redirect_uri ?? '-' }}</p>
                </div>
              </div>

              <div v-for="scopeItem in scopeItems" :key="scopeItem" class="OAuthConsent__permissionItem">
                <v-icon icon="$checkCircleOutline" size="18" color="main-blue" />
                <div>
                  <strong>{{ scopeItem }}</strong>
                  <p>{{ $t('auth.pages.oauthConsent.requestedScope') }}</p>
                </div>
              </div>

              <div v-if="!scopeItems.length" class="OAuthConsent__permissionItem">
                <v-icon icon="$accountCircleOutline" size="18" color="main-blue" />
                <div>
                  <strong>{{ $t('auth.pages.oauthConsent.basicProfile') }}</strong>
                  <p>{{ $t('auth.pages.oauthConsent.noScope') }}</p>
                </div>
              </div>
            </div>
          </div>

          <p class="OAuthConsent__disclaimer">
            {{ $t('auth.pages.oauthConsent.disclaimer') }}
          </p>

          <div class="OAuthConsent__actions">
            <v-btn 
              variant="outlined" 
              :disabled="isApproving"
              :loading="isApproving"
              @click="handleDeny"
            >
              {{ $t('auth.pages.oauthConsent.cancel') }}
            </v-btn>
            <v-btn 
              color="main-blue" 
              :disabled="isApproving"
              :loading="isApproving"
              @click="handleApprove"
            >
              {{ $t('auth.pages.oauthConsent.allow') }}
            </v-btn>
          </div>
        </template>
      </div>

      <footer class="OAuthConsent__footer">
        <span><v-icon icon="$lockOutline" size="12" /> {{ $t('auth.pages.oauthConsent.secureConnection') }}</span>
        <small>KOL v2.4.0</small>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supabase } from '@/plugins/supabase'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

type AuthorizationDetails = {
  client?: {
    name?: string
    id?: string
  }
  user?: {
    id?: string
    email?: string
  }
  redirect_uri?: string
  redirect_url?: string
  state?: string
  code?: string
  status?: string
  auto_approved?: boolean
  scope?: string
  authorization_id?: string
}

type OAuthAuthorizationResponse = {
  redirect_to?: string
}

type OAuthApi = {
  getAuthorizationDetails: (authorizationId: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>
  approveAuthorization: (authorizationId: string) => Promise<{ data: OAuthAuthorizationResponse | null; error: { message: string } | null }>
  denyAuthorization: (authorizationId: string) => Promise<{ data: OAuthAuthorizationResponse | null; error: { message: string } | null }>
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const authDetails = ref<AuthorizationDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isApproving = ref(false)

const authorizationId = computed(() => {
  const queryParam = route.query.authorization_id
  return typeof queryParam === 'string' ? queryParam : null
})

const inferredClientId = computed(() => {
  const clientIdQuery = route.query.client_id
  if (typeof clientIdQuery === 'string' && clientIdQuery.trim()) {
    return clientIdQuery.trim()
  }

  const authId = authorizationId.value
  if (authId && authId.length < 20) {
    return authId
  }

  return null
})

const scopeItems = computed(() => {
  const scope = authDetails.value?.scope?.trim()
  return scope ? scope.split(/\s+/) : []
})

function getOAuthErrorMessage(rawMessage?: string) {
  const message = rawMessage ?? ''
  const normalized = message.toLowerCase()

  if (normalized.includes('404') || normalized.includes('not found') || normalized.includes('json.parse')) {
    return t('auth.pages.oauthConsent.notFound')
  }

  // Handle state mismatch error by providing a user-friendly message and restart option
  if (normalized.includes('state mismatch') || normalized.includes('csrf') || normalized.includes('stale')) {
    return t('auth.pages.oauthConsent.errors.stateMismatch')
  }

  return message || t('auth.pages.oauthConsent.errors.oauthUnavailable')
}

async function redirectToOAuthAuthorize(clientId: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  if (!supabaseUrl) {
    error.value = t('auth.pages.oauthConsent.errors.oauthUnavailable')
    loading.value = false
    return
  }

  const authorizeUrl = new URL('/auth/v1/oauth/authorize', supabaseUrl)
  const redirectUriQuery = route.query.redirect_uri
  const responseTypeQuery = route.query.response_type
  const scopeQuery = route.query.scope
  const stateQuery = route.query.state
  const codeChallengeQuery = route.query.code_challenge
  const codeChallengeMethodQuery = route.query.code_challenge_method

  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('response_type', typeof responseTypeQuery === 'string' ? responseTypeQuery : 'code')
  authorizeUrl.searchParams.set(
    'redirect_uri',
    typeof redirectUriQuery === 'string' ? redirectUriQuery : `${window.location.origin}/auth/callback`,
  )

  if (typeof scopeQuery === 'string' && scopeQuery.trim()) {
    authorizeUrl.searchParams.set('scope', scopeQuery)
  }

  if (typeof stateQuery === 'string' && stateQuery.trim()) {
    authorizeUrl.searchParams.set('state', stateQuery)
  }

  if (typeof codeChallengeQuery === 'string' && codeChallengeQuery.trim()) {
    authorizeUrl.searchParams.set('code_challenge', codeChallengeQuery)
  }

  if (typeof codeChallengeMethodQuery === 'string' && codeChallengeMethodQuery.trim()) {
    authorizeUrl.searchParams.set('code_challenge_method', codeChallengeMethodQuery)
  }

  window.location.href = authorizeUrl.toString()
}

async function loadAuthDetails() {
  const currentAuthorizationId = authorizationId.value
  const clientId = inferredClientId.value

  if (!currentAuthorizationId && clientId) {
    await redirectToOAuthAuthorize(clientId)
    return
  }

  if (!currentAuthorizationId) {
    error.value = t('auth.pages.oauthConsent.errors.missingAuthorizationId')
    loading.value = false
    return
  }

  if (clientId && currentAuthorizationId === clientId) {
    await redirectToOAuthAuthorize(clientId)
    return
  }

  loading.value = true
  error.value = null

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    await router.push({
      name: 'auth-sign-in',
      query: { redirect: `/oauth/consent?authorization_id=${currentAuthorizationId}` },
    })
    return
  }

  const oauthApi = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth
  if (!oauthApi?.getAuthorizationDetails) {
    error.value = t('auth.pages.oauthConsent.errors.oauthUnavailable')
    loading.value = false
    return
  }

  try {
    const { data, error: detailsError } = await oauthApi.getAuthorizationDetails(currentAuthorizationId)

    if (detailsError) {
      error.value = getOAuthErrorMessage(detailsError.message)
      loading.value = false
      return
    }
    
    authDetails.value = data
    
    // Check if authorization already has a redirect URL (already approved)
    // The API returns redirect_url for auto-approved authorizations
    if (data?.redirect_url) {
      window.location.href = data.redirect_url
      return
    }
    
    // Check if this is an auto-approved authorization
    if (!data?.user || data?.auto_approved) {
      // For auto-approved authorizations, redirect to complete the flow
      const clientId = data?.client?.id || inferredClientId.value
      if (clientId) {
        const redirectUri = data?.redirect_uri || 'http://localhost:4173/callback.html'
        const state = data?.state || ''
        
        const redirectUrl = new URL('/auth/v1/oauth/authorize', window.location.origin)
        redirectUrl.searchParams.set('client_id', clientId)
        redirectUrl.searchParams.set('response_type', 'code')
        redirectUrl.searchParams.set('redirect_uri', redirectUri)
        redirectUrl.searchParams.set('state', state)
        window.location.href = redirectUrl.toString()
        return
      }
    }
  } catch (detailsException) {
    const detailsMessage = detailsException instanceof Error ? detailsException.message : undefined
    error.value = getOAuthErrorMessage(detailsMessage)
  }

  loading.value = false
}

async function handleApprove() {
  const currentAuthorizationId = authorizationId.value
  if (!currentAuthorizationId || isApproving.value) {
    return
  }

  isApproving.value = true

  const oauthApi = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth
  if (!oauthApi?.approveAuthorization) {
    error.value = t('auth.pages.oauthConsent.errors.oauthUnavailable')
    isApproving.value = false
    return
  }
  try {
    const { data, error: approveError } = await oauthApi.approveAuthorization(currentAuthorizationId)

    if (approveError) {
      error.value = getOAuthErrorMessage(approveError.message)
    } else if (data?.redirect_to) {
      window.location.href = data.redirect_to
    }
  } catch (approveException) {
    const approveMessage = approveException instanceof Error ? approveException.message : undefined
    error.value = getOAuthErrorMessage(approveMessage)
  } finally {
    isApproving.value = false
  }
}

async function handleDeny() {
  const currentAuthorizationId = authorizationId.value
  if (!currentAuthorizationId || isApproving.value) {
    return
  }

  isApproving.value = true

  const oauthApi = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth
  if (!oauthApi?.denyAuthorization) {
    error.value = t('auth.pages.oauthConsent.errors.oauthUnavailable')
    isApproving.value = false
    return
  }
  try {
    const { data, error: denyError } = await oauthApi.denyAuthorization(currentAuthorizationId)

    if (denyError) {
      error.value = getOAuthErrorMessage(denyError.message)
    } else if (data?.redirect_to) {
      window.location.href = data.redirect_to
    }
  } catch (denyException) {
    const denyMessage = denyException instanceof Error ? denyException.message : undefined
    error.value = getOAuthErrorMessage(denyMessage)
  } finally {
    isApproving.value = false
  }
}

function restartOAuthFlow() {
  // Redirect back to sign-in to restart the OAuth flow
  router.push({ name: 'auth-sign-in' })
}

watch(
  authorizationId,
  () => {
    void loadAuthDetails()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.OAuthConsent {
  min-height: 100vh;
  background: linear-gradient(160deg, #f6f7f8 0%, #ecf1f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.OAuthConsent__card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 45px -28px rgba(51, 92, 142, 0.45);
}

.OAuthConsent__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #e2e8f0;
}

.OAuthConsent__brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.OAuthConsent__brand h2 {
  font-size: 1rem;
}

.OAuthConsent__brandIcon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(51, 92, 142, 0.1);
}

.OAuthConsent__close {
  color: #64748b;
  text-decoration: none;
}

.OAuthConsent__body {
  padding: 1.5rem;
}

.OAuthConsent__loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.OAuthConsent__visual {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.OAuthConsent__appIcon,
.OAuthConsent__kolIcon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
}

.OAuthConsent__appIcon {
  background: #f1f5f9;
}

.OAuthConsent__kolIcon {
  background: rgba(51, 92, 142, 0.1);
}

.OAuthConsent__titleBlock {
  text-align: center;
  margin-bottom: 1.2rem;
}

.OAuthConsent__titleBlock h3 {
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
}

.OAuthConsent__titleBlock p {
  color: #64748b;
  font-size: 0.88rem;
}

.OAuthConsent__permissions h4 {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.OAuthConsent__permissionsList {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.OAuthConsent__permissionItem {
  display: flex;
  gap: 0.6rem;
}

.OAuthConsent__permissionItem strong {
  display: block;
  font-size: 0.87rem;
}

.OAuthConsent__permissionItem p {
  color: #64748b;
  font-size: 0.75rem;
}

.OAuthConsent__disclaimer {
  color: #94a3b8;
  font-size: 0.72rem;
  text-align: center;
  margin: 1rem 0;
}

.OAuthConsent__actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.OAuthConsent__footer {
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1.2rem;
  color: #94a3b8;
  font-size: 0.68rem;
}

.OAuthConsent__footer span {
  display: inline-flex;
  gap: 0.2rem;
  align-items: center;
}

@media (min-width: 640px) {
  .OAuthConsent__actions {
    flex-direction: row;
  }

  .OAuthConsent__actions .v-btn {
    flex: 1;
  }
}
</style>
