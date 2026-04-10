/**
 * 03-authentication.mjs - Authentication Examples
 *
 * This file demonstrates various authentication methods
 * available in fetch-undici.
 */

import {
  AsyncClient,
  BasicAuth,
  BearerAuth,
  DigestAuth,
  Auth,
  Request
} from 'fetch-undici'

// =============================================================================
// Example 1: Basic Authentication
// =============================================================================

export async function example1_basicAuth() {
  console.log('=== Example 1: Basic Authentication ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new BasicAuth('testuser', 'testpass')
  })

  try {
    // Authorization header automatically added
    const response = await client.get('/basic-auth/testuser/testpass')

    console.log('Status:', response.statusCode)
    console.log('Authenticated:', response.ok)

    if (response.ok) {
      const data = await response.json()
      console.log('User:', data.user)
    }
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 2: Bearer Token Authentication
// =============================================================================

export async function example2_bearerAuth() {
  console.log('\n=== Example 2: Bearer Token Authentication ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new BearerAuth('my-jwt-token-here')
  })

  try {
    // Authorization: Bearer my-jwt-token-here
    const response = await client.get('/bearer')

    console.log('Status:', response.statusCode)

    if (response.ok) {
      const data = await response.json()
      console.log('Token accepted:', data.authenticated)
    }
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 3: Digest Authentication
// =============================================================================

export async function example3_digestAuth() {
  console.log('\n=== Example 3: Digest Authentication ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new DigestAuth('user', 'passwd')
  })

  try {
    // Handles 401 challenge automatically
    const response = await client.get('/digest-auth/auth/user/passwd')

    console.log('Status:', response.statusCode)
    console.log('Authenticated:', response.ok)
  } catch (error) {
    console.log('Note: Digest auth requires server challenge support')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 4: Per-Request Auth Override
// =============================================================================

export async function example4_perRequestAuth() {
  console.log('\n=== Example 4: Per-Request Auth Override ===')

  // Client with default auth
  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new BasicAuth('default-user', 'default-pass')
  })

  try {
    // Uses default auth
    const response1 = await client.get('/headers')
    console.log('Request 1 status:', response1.statusCode)

    // Override auth for specific request
    const response2 = await client.get('/headers', {
      auth: new BearerAuth('special-token')
    })
    console.log('Request 2 status:', response2.statusCode)
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 5: Custom API Key Authentication
// =============================================================================

/**
 * Custom authentication class for API Key auth
 */
class APIKeyAuth extends Auth {
  constructor(apiKey, headerName = 'X-API-Key') {
    super()
    this._apiKey = apiKey
    this._headerName = headerName
  }

  apply(request) {
    // Clone request with new header
    const newHeaders = request.headers.clone()
    newHeaders.set(this._headerName, this._apiKey)

    return new Request(request.method, request.url, {
      headers: newHeaders,
      body: request.body
    })
  }
}

export async function example5_customApiKeyAuth() {
  console.log('\n=== Example 5: Custom API Key Authentication ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new APIKeyAuth('my-secret-api-key')
  })

  try {
    const response = await client.get('/headers')
    console.log('Status:', response.statusCode)

    const data = await response.json()
    console.log('API Key header sent:', data.headers['X-Api-Key'] || data.headers['x-api-key'])
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 6: Custom Header-Based Authentication
// =============================================================================

/**
 * Custom authentication for services that use custom headers
 */
class CustomHeaderAuth extends Auth {
  constructor(credentials) {
    super()
    this._credentials = credentials
  }

  apply(request) {
    const newHeaders = request.headers.clone()

    // Add multiple custom headers
    for (const [name, value] of Object.entries(this._credentials)) {
      newHeaders.set(name, value)
    }

    return new Request(request.method, request.url, {
      headers: newHeaders,
      body: request.body
    })
  }
}

export async function example6_customHeaderAuth() {
  console.log('\n=== Example 6: Custom Header-Based Authentication ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org',
    auth: new CustomHeaderAuth({
      'X-Client-ID': 'my-client-id',
      'X-Client-Secret': 'my-client-secret',
      'X-Timestamp': Date.now().toString()
    })
  })

  try {
    const response = await client.get('/headers')
    console.log('Status:', response.statusCode)

    const data = await response.json()
    console.log('Custom headers sent:', Object.keys(data.headers).filter(k => k.startsWith('X-')))
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 7: Auth with Convenience Functions
// =============================================================================

import { get, post } from 'fetch-undici'

export async function example7_authWithConvenience() {
  console.log('\n=== Example 7: Auth with Convenience Functions ===')

  try {
    // Basic auth with convenience function
    const response = await get('https://httpbin.org/headers', {
      auth: new BearerAuth('my-token')
    })

    console.log('Status:', response.statusCode)

    const data = await response.json()
    const authHeader = data.headers['Authorization'] || data.headers['authorization']
    console.log('Authorization header:', authHeader ? 'Bearer ...' : 'not sent')
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  }
}

// =============================================================================
// Example 8: Examining Auth Headers
// =============================================================================

export async function example8_examineAuthHeaders() {
  console.log('\n=== Example 8: Examining Auth Headers ===')

  // Create auth instances
  const basicAuth = new BasicAuth('user', 'pass')
  const bearerAuth = new BearerAuth('jwt-token-here')

  // Apply to requests and examine
  const request1 = new Request('GET', 'https://example.com/api')
  const request2 = new Request('GET', 'https://example.com/api')

  const authRequest1 = basicAuth.apply(request1)
  const authRequest2 = bearerAuth.apply(request2)

  console.log('BasicAuth header:', authRequest1.headers.get('Authorization'))
  console.log('BearerAuth header:', authRequest2.headers.get('Authorization'))
}

// =============================================================================
// Example 9: Auth Token Refresh Pattern
// =============================================================================

/**
 * Example of an auth class that could refresh tokens
 * (simplified - actual implementation would need async support)
 */
class RefreshableTokenAuth extends Auth {
  constructor(options) {
    super()
    this._accessToken = options.accessToken
    this._refreshToken = options.refreshToken
    this._tokenExpiry = options.expiresAt
  }

  isExpired() {
    return Date.now() > this._tokenExpiry
  }

  apply(request) {
    // In a real implementation, you'd check expiry and refresh
    const newHeaders = request.headers.clone()
    newHeaders.set('Authorization', `Bearer ${this._accessToken}`)

    return new Request(request.method, request.url, {
      headers: newHeaders,
      body: request.body
    })
  }
}

export async function example9_refreshableToken() {
  console.log('\n=== Example 9: Refreshable Token Auth Pattern ===')

  const auth = new RefreshableTokenAuth({
    accessToken: 'current-access-token',
    refreshToken: 'refresh-token-for-renewal',
    expiresAt: Date.now() + 3600000 // 1 hour from now
  })

  console.log('Token expired:', auth.isExpired())

  // Apply to a request
  const request = new Request('GET', 'https://api.example.com/data')
  const authRequest = auth.apply(request)

  console.log('Authorization header set:', authRequest.headers.has('Authorization'))
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    // These require httpbin.org
    // await example1_basicAuth()
    // await example2_bearerAuth()
    // await example3_digestAuth()
    // await example4_perRequestAuth()
    // await example5_customApiKeyAuth()
    // await example6_customHeaderAuth()
    // await example7_authWithConvenience()

    // These work locally
    await example8_examineAuthHeaders()
    await example9_refreshableToken()

    console.log('\n=== Authentication examples completed! ===')
    console.log('Note: Some examples require httpbin.org to be available')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
