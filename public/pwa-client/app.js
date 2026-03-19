const STORAGE_KEY = 'koldatra-oauth-pkce'
const TOKENS_KEY = 'koldatra-oauth-tokens'

const byId = (id) => document.getElementById(id)

function base64UrlEncode(bytes) {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function randomString(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => chars[x % chars.length]).join('')
}

async function sha256(input) {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(digest)
}

async function buildPkce() {
  const codeVerifier = randomString(96)
  const digest = await sha256(codeVerifier)
  const codeChallenge = base64UrlEncode(digest)
  const state = randomString(32)
  return { codeVerifier, codeChallenge, state }
}

function savePkce(payload) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function loadPkce() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function saveTokens(tokenData) {
  const tokensWithExpiry = {
    ...tokenData,
    expires_at: Date.now() + (tokenData.expires_in * 1000),
    stored_at: Date.now()
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokensWithExpiry))
}

function loadTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null')
  } catch {
    return null
  }
}

function clearTokens() {
  localStorage.removeItem(TOKENS_KEY)
}

function isTokenExpired(tokens) {
  if (!tokens || !tokens.expires_at) return true
  // Refresh 1 minute before expiry to be safe
  return Date.now() >= (tokens.expires_at - 60000)
}

async function refreshToken(refreshToken, clientId) {
  const tokenUrl = new URL('/auth/v1/oauth/token', 'http://127.0.0.1:54331')
  const payload = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })

  try {
    const response = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    })

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

async function getValidTokens(clientId) {
  let tokens = loadTokens()
  
  // If no tokens or expired, try to refresh
  if (!tokens || isTokenExpired(tokens)) {
    if (tokens && tokens.refresh_token) {
      try {
        const newTokens = await refreshToken(tokens.refresh_token, clientId)
        saveTokens(newTokens)
        tokens = { ...newTokens, expires_at: Date.now() + (newTokens.expires_in * 1000) }
      } catch (error) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens()
        return null
      }
    } else {
      return null
    }
  }
  
  return tokens
}

function setStatus(message, isError = false) {
  const status = byId('status')
  if (!status) return
  status.textContent = message
  status.className = `status ${isError ? 'error' : ''}`
}

function getLoginConfig() {
  return {
    supabaseUrl: byId('supabase-url')?.value.trim(),
    clientId: byId('client_id')?.value.trim(),
    redirectUri: byId('redirect-uri')?.value.trim(),
    scope: byId('scope')?.value.trim() || 'openid profile email',
  }
}

async function startLogin() {
  const { supabaseUrl, clientId, redirectUri, scope } = getLoginConfig()
  if (!supabaseUrl || !clientId || !redirectUri) {
    setStatus('Missing Supabase URL, client_id, or redirect_uri.', true)
    return
  }

  const { codeVerifier, codeChallenge, state } = await buildPkce()
  savePkce({ codeVerifier, state, clientId, redirectUri, supabaseUrl })

  const authorizeUrl = new URL('/auth/v1/oauth/authorize', supabaseUrl)
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', scope)
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  window.location.href = authorizeUrl.toString()
}

async function exchangeCode() {
  const resultEl = byId('result')
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')
  const oauthErrorDescription = url.searchParams.get('error_description')

  if (oauthError) {
    resultEl.textContent = `OAuth error: ${oauthError}\n${oauthErrorDescription || ''}`
    return
  }

  if (!code) {
    resultEl.textContent = 'No authorization code found in callback URL.'
    return
  }

  const pkce = loadPkce()
  if (!pkce) {
    resultEl.textContent = 'Missing PKCE session data. Start login again.'
    return
  }

  if (returnedState !== pkce.state) {
    resultEl.textContent = 'State mismatch. Possible CSRF or stale login session.'
    return
  }

  const tokenUrl = new URL('/auth/v1/oauth/token', pkce.supabaseUrl)
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: pkce.clientId,
    redirect_uri: pkce.redirectUri,
    code_verifier: pkce.codeVerifier,
  })

  try {
    const response = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    })

    const data = await response.json()
    
    if (response.ok && data.access_token) {
      // Save tokens for future use
      saveTokens(data)
      
      resultEl.textContent = JSON.stringify(
        {
          ok: response.ok,
          status: response.status,
          token_type: data.token_type,
          expires_in: data.expires_in,
          scope: data.scope,
          access_token: data.access_token ? `${data.access_token.slice(0, 24)}...` : null,
          refresh_token: data.refresh_token ? `${data.refresh_token.slice(0, 24)}...` : null,
          expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
          stored: true,
          raw: data,
        },
        null,
        2,
      )
    } else {
      resultEl.textContent = JSON.stringify(
        {
          ok: response.ok,
          status: response.status,
          error: data.error_description || data.error || 'Token exchange failed',
          raw: data,
        },
        null,
        2,
      )
    }
  } catch (err) {
    resultEl.textContent = `Token exchange failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

function setupPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  }
}

function bootstrap() {
  setupPwa()

  const page = document.body.dataset.page
  if (page === 'login') {
    byId('login-btn')?.addEventListener('click', startLogin)
  }

  if (page === 'callback') {
    exchangeCode()
    
    // Add refresh token testing handlers
    byId('test-refresh')?.addEventListener('click', async () => {
      const refreshResult = byId('refresh-result')
      refreshResult.style.display = 'block'
      refreshResult.textContent = 'Testing refresh token...'
      
      const tokens = loadTokens()
      if (!tokens || !tokens.refresh_token) {
        refreshResult.textContent = 'No refresh token available. Please complete OAuth flow first.'
        return
      }
      
      try {
        const newTokens = await refreshToken(tokens.refresh_token, tokens.client_id || 'ca665a9e-5e98-4606-9bd0-dfde596e69a4')
        saveTokens(newTokens)
        
        refreshResult.textContent = JSON.stringify({
          success: true,
          message: 'Token refreshed successfully',
          old_expires_at: new Date(tokens.expires_at).toISOString(),
          new_expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
          access_token: newTokens.access_token ? `${newTokens.access_token.slice(0, 24)}...` : null,
          refresh_token: newTokens.refresh_token ? `${newTokens.refresh_token.slice(0, 24)}...` : null,
          raw: newTokens
        }, null, 2)
      } catch (error) {
        refreshResult.textContent = JSON.stringify({
          success: false,
          error: error.message,
          tokens_still_valid: !isTokenExpired(tokens)
        }, null, 2)
      }
    })
    
    byId('check-tokens')?.addEventListener('click', () => {
      const refreshResult = byId('refresh-result')
      refreshResult.style.display = 'block'
      
      const tokens = loadTokens()
      if (!tokens) {
        refreshResult.textContent = 'No tokens stored'
        return
      }
      
      refreshResult.textContent = JSON.stringify({
        stored: true,
        expired: isTokenExpired(tokens),
        expires_at: new Date(tokens.expires_at).toISOString(),
        stored_at: new Date(tokens.stored_at).toISOString(),
        time_until_expiry: tokens.expires_at - Date.now(),
        access_token: tokens.access_token ? `${tokens.access_token.slice(0, 24)}...` : null,
        refresh_token: tokens.refresh_token ? `${tokens.refresh_token.slice(0, 24)}...` : null,
        raw: tokens
      }, null, 2)
    })
    
    byId('clear-tokens')?.addEventListener('click', () => {
      clearTokens()
      const refreshResult = byId('refresh-result')
      refreshResult.style.display = 'block'
      refreshResult.textContent = 'Tokens cleared from storage'
    })
  }
}

bootstrap()
