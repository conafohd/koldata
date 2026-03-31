# OAuth 2.0 - KolData

> **📖 Full documentation:** [Supabase OAuth Server Guide](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows)

---

## Testing Locally

### 1. Create OAuth Client

```sql
-- Run in Supabase Studio (http://localhost:54323) SQL Editor
INSERT INTO auth.oauth_clients (
  id, name, redirect_uris, client_secret_encrypted
)
VALUES (
  gen_random_uuid(),
  'Test Client',
  ARRAY['http://localhost:4173/callback.html'],
  crypt('test-secret-123', gen_salt('bf'))
)
RETURNING id as client_id;
```

Save the `client_id`.

### 2. Run the Local PWA Test Client

```bash
# Serve the PWA client
npx vite preview --port 4173 --outDir public/pwa-client

# Or use any static file server
# python3 -m http.server 4173 --directory public/pwa-client
```

The test client will be available at `http://localhost:4173` with:
- Pre-configured OAuth endpoints
- PKCE flow implementation
- Simple UI for testing authorization

### 3. Test the Flow Manually

```javascript
// 1. Start authorization
window.location.href = 'http://127.0.0.1:3000/oauth/authorize?' + 
  new URLSearchParams({
    client_id: 'your-client-id',
    redirect_uri: 'http://localhost:4173/callback.html',
    response_type: 'code',
    scope: 'openid email profile'
  })

// 2. User signs in and approves

// 3. Handle callback - exchange code for token
const code = new URLSearchParams(window.location.search).get('code')

const response = await fetch('http://127.0.0.1:54321/auth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:4173/callback.html',
    client_id: 'your-client-id',
    client_secret: 'test-secret-123'
  })
})

const { access_token } = await response.json()

// 4. Use token
const user = await fetch('http://127.0.0.1:54321/auth/v1/user', {
  headers: { 'Authorization': `Bearer ${access_token}` }
}).then(r => r.json())
```

---

## Implementing for Your App

### PKCE Flow (Recommended for PWAs/SPAs)

```javascript
// Helper functions
function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.getRandomValues(new Uint8Array(32)))
}

async function generateCodeChallenge(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64URLEncode(new Uint8Array(hash))
}

// Implementation
class OAuthClient {
  constructor(clientId, redirectUri) {
    this.clientId = clientId
    this.redirectUri = redirectUri
  }

  async authorize() {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    
    sessionStorage.setItem('code_verifier', verifier)
    
    window.location.href = 'http://127.0.0.1:3000/oauth/authorize?' + 
      new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: challenge,
        code_challenge_method: 'S256'
      })
  }

  async handleCallback() {
    const code = new URLSearchParams(window.location.search).get('code')
    const verifier = sessionStorage.getItem('code_verifier')
    
    const response = await fetch('http://127.0.0.1:54321/auth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: verifier
      })
    })
    
    sessionStorage.removeItem('code_verifier')
    return await response.json()
  }
}

// Usage
const oauth = new OAuthClient('your-client-id', 'http://localhost:5173/oauth/callback')

// On login button
await oauth.authorize()

// On callback page
const { access_token } = await oauth.handleCallback()
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Missing authorization_id" | Restart flow from authorize endpoint |
| "State mismatch" | Clear sessionStorage and retry |
| "Invalid redirect_uri" | Check exact match in database: `SELECT redirect_uris FROM auth.oauth_clients WHERE id='...'` |
| "Invalid grant" | Code expired or already used - get new code |

---

## Database Queries

```sql
-- View clients
SELECT id, name, redirect_uris FROM auth.oauth_clients;

-- Update redirect URIs
UPDATE auth.oauth_clients 
SET redirect_uris = ARRAY['http://localhost:5173/callback'] 
WHERE id = 'your-client-id';

-- Delete client
DELETE FROM auth.oauth_clients WHERE id = 'your-client-id';
```

---

## KolData Configuration

Located in `supabase/config.toml`:

```toml
[auth.oauth_server]
enabled = true
authorization_url_path = "/oauth/consent"
allow_dynamic_registration = false
```

**Features:**
- Custom consent page at `/oauth/consent`
- Preserves redirect through password reset flow
- Bilingual support (EN/FR)
