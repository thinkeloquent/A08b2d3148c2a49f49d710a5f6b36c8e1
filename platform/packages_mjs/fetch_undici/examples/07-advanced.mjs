/**
 * 07-advanced.mjs - Advanced Usage Patterns
 *
 * This file demonstrates advanced features including
 * interceptors, mount routing, mocking, and more.
 */

import {
  AsyncClient,
  Headers,
  Response,
  MountRouter,
  createMountRouter,
  createLoggingInterceptor,
  DispatcherFactory
} from 'fetch-undici'

import { MockAgent, setGlobalDispatcher, Pool } from 'undici'

// =============================================================================
// Example 1: Logging Interceptor
// =============================================================================

export async function example1_loggingInterceptor() {
  console.log('=== Example 1: Logging Interceptor ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
    // Note: Interceptors are applied at the dispatcher level
  })

  try {
    console.log('Making request with logging...')
    const response = await client.get('/posts/1')
    console.log('Response status:', response.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 2: Custom Headers Class Usage
// =============================================================================

export async function example2_headersClass() {
  console.log('\n=== Example 2: Custom Headers Class Usage ===')

  // Create headers from object
  const headers1 = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Custom': 'value'
  })

  // Case-insensitive access
  console.log('Content-Type:', headers1.get('content-type'))
  console.log('CONTENT-TYPE:', headers1.get('CONTENT-TYPE'))

  // Append multiple values
  headers1.append('Accept-Language', 'en')
  headers1.append('Accept-Language', 'es')
  console.log('All Accept-Language:', headers1.getAll('Accept-Language'))

  // Iterate
  console.log('All headers:')
  for (const [name, value] of headers1) {
    console.log(`  ${name}: ${value}`)
  }

  // Clone and modify
  const headers2 = headers1.clone()
  headers2.set('X-New-Header', 'new-value')
  console.log('Original has X-New-Header:', headers1.has('X-New-Header'))
  console.log('Clone has X-New-Header:', headers2.has('X-New-Header'))

  // Merge headers
  const merged = headers1.merge({ 'X-Merged': 'merged-value' })
  console.log('Merged has X-Merged:', merged.has('X-Merged'))

  // Convert to different formats
  console.log('toJSON:', JSON.stringify(headers1.toJSON()))
}

// =============================================================================
// Example 3: Response Class Features
// =============================================================================

export async function example3_responseFeatures() {
  console.log('\n=== Example 3: Response Class Features ===')

  // Create response instances
  const successResponse = new Response({
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'success' })
  })

  const errorResponse = new Response({
    statusCode: 404,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ error: 'not found' })
  })

  const redirectResponse = new Response({
    statusCode: 302,
    headers: { 'location': 'https://example.com/new' }
  })

  // Status properties
  console.log('200 Response:')
  console.log('  ok:', successResponse.ok)
  console.log('  isSuccess:', successResponse.isSuccess)
  console.log('  isError:', successResponse.isError)

  console.log('404 Response:')
  console.log('  ok:', errorResponse.ok)
  console.log('  isClientError:', errorResponse.isClientError)
  console.log('  isError:', errorResponse.isError)

  console.log('302 Response:')
  console.log('  isRedirect:', redirectResponse.isRedirect)

  // Body access
  const data = await successResponse.json()
  console.log('Body data:', data)

  // Body methods (all cache the result)
  const response = new Response({
    statusCode: 200,
    body: 'Hello, World!'
  })

  const text = await response.text()
  const bytes = await response.bytes()
  console.log('Text length:', text.length)
  console.log('Bytes length:', bytes.length)
}

// =============================================================================
// Example 4: Dispatcher Factory
// =============================================================================

export async function example4_dispatcherFactory() {
  console.log('\n=== Example 4: Dispatcher Factory ===')

  const factory = new DispatcherFactory({
    http2: false
  })

  // Get dispatcher for an origin
  const dispatcher1 = factory.getDispatcher('https://example.com/path')
  const dispatcher2 = factory.getDispatcher('https://example.com/other')

  // Same origin = same dispatcher (cached)
  console.log('Same dispatcher for same origin:', dispatcher1 === dispatcher2)

  // Different origin = different dispatcher
  const dispatcher3 = factory.getDispatcher('https://other.com/path')
  console.log('Different dispatcher for different origin:', dispatcher1 !== dispatcher3)

  // Cleanup
  await factory.closeAll()
  console.log('All dispatchers closed')
}

// =============================================================================
// Example 5: Mount Router Concept
// =============================================================================

export async function example5_mountRouterConcept() {
  console.log('\n=== Example 5: Mount Router Concept ===')

  // The mount router routes requests to different dispatchers
  // based on URL patterns

  const router = createMountRouter()

  // In a real scenario, you'd mount dispatchers like this:
  // router.mount('https://api.internal.com/', internalPool)
  // router.mount('https://external.api.com/', proxyAgent)
  // router.mount('https://', defaultPool)
  // router.mount('all://', fallbackPool)

  console.log('Mount router created')
  console.log('Used for routing requests to different dispatchers by URL pattern')
}

// =============================================================================
// Example 6: Mock Testing with MockAgent
// =============================================================================

export async function example6_mockTesting() {
  console.log('\n=== Example 6: Mock Testing with MockAgent ===')

  // Create mock agent
  const mockAgent = new MockAgent()
  mockAgent.disableNetConnect() // Ensure no real requests

  // Set as global dispatcher
  setGlobalDispatcher(mockAgent)

  // Create mock pool
  const mockPool = mockAgent.get('https://api.example.com')

  // Define mock responses
  mockPool.intercept({
    path: '/users',
    method: 'GET'
  }).reply(200, [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ], {
    headers: { 'content-type': 'application/json' }
  })

  mockPool.intercept({
    path: '/users/1',
    method: 'GET'
  }).reply(200, { id: 1, name: 'Alice', email: 'alice@example.com' })

  mockPool.intercept({
    path: '/users',
    method: 'POST'
  }).reply(201, { id: 3, name: 'Charlie' })

  mockPool.intercept({
    path: '/users/999',
    method: 'GET'
  }).reply(404, { error: 'User not found' })

  // Use client with mocked backend
  const client = new AsyncClient({
    baseUrl: 'https://api.example.com'
  })

  try {
    // GET /users
    const usersResp = await client.get('/users')
    const users = await usersResp.json()
    console.log('GET /users:', users.length, 'users')

    // GET /users/1
    const userResp = await client.get('/users/1')
    const user = await userResp.json()
    console.log('GET /users/1:', user.name)

    // POST /users
    const createResp = await client.post('/users', {
      json: { name: 'Charlie' }
    })
    const created = await createResp.json()
    console.log('POST /users:', created.name, 'created')

    // GET /users/999 (not found)
    const notFoundResp = await client.get('/users/999')
    console.log('GET /users/999 status:', notFoundResp.statusCode)
  } finally {
    await client.close()
    await mockAgent.close()
  }
}

// =============================================================================
// Example 7: Request Cancellation
// =============================================================================

export async function example7_requestCancellation() {
  console.log('\n=== Example 7: Request Cancellation ===')

  const controller = new AbortController()

  // Cancel after 100ms
  setTimeout(() => {
    controller.abort()
    console.log('Request aborted!')
  }, 100)

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // This request may be cancelled before completing
    const response = await client.get('/posts', {
      signal: controller.signal
    })
    console.log('Response received:', response.statusCode)
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was successfully cancelled')
    } else {
      console.log('Error:', error.message)
    }
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 8: Parallel Requests
// =============================================================================

export async function example8_parallelRequests() {
  console.log('\n=== Example 8: Parallel Requests ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    const start = Date.now()

    // Make parallel requests
    const [postsResp, usersResp, commentsResp] = await Promise.all([
      client.get('/posts?_limit=3'),
      client.get('/users?_limit=3'),
      client.get('/comments?_limit=3')
    ])

    const duration = Date.now() - start

    const posts = await postsResp.json()
    const users = await usersResp.json()
    const comments = await commentsResp.json()

    console.log('Posts:', posts.length)
    console.log('Users:', users.length)
    console.log('Comments:', comments.length)
    console.log('Total duration:', duration, 'ms')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 9: Request Pipeline
// =============================================================================

export async function example9_requestPipeline() {
  console.log('\n=== Example 9: Request Pipeline ===')

  // Simulated request pipeline with hooks
  async function makePipelinedRequest(client, method, url, options = {}) {
    const startTime = Date.now()

    // Pre-request hook
    console.log(`[PRE] ${method} ${url}`)

    try {
      const response = await client.request(method, url, options)

      // Post-request hook
      const duration = Date.now() - startTime
      console.log(`[POST] ${response.statusCode} in ${duration}ms`)

      return response
    } catch (error) {
      // Error hook
      const duration = Date.now() - startTime
      console.log(`[ERROR] ${error.message} after ${duration}ms`)
      throw error
    }
  }

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    const response = await makePipelinedRequest(client, 'GET', '/posts/1')
    const data = await response.json()
    console.log('Post title:', data.title)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 10: Resource Aggregation
// =============================================================================

export async function example10_resourceAggregation() {
  console.log('\n=== Example 10: Resource Aggregation ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // Get a post
    const postResp = await client.get('/posts/1')
    const post = await postResp.json()

    // Get related resources in parallel
    const [userResp, commentsResp] = await Promise.all([
      client.get(`/users/${post.userId}`),
      client.get(`/posts/${post.id}/comments`)
    ])

    const user = await userResp.json()
    const comments = await commentsResp.json()

    // Aggregate
    const aggregated = {
      post: {
        id: post.id,
        title: post.title
      },
      author: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      commentCount: comments.length
    }

    console.log('Aggregated resource:')
    console.log(JSON.stringify(aggregated, null, 2))
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 11: Custom Logger Integration
// =============================================================================

export async function example11_customLogger() {
  console.log('\n=== Example 11: Custom Logger Integration ===')

  // Custom logger that mimics pino-style
  const customLogger = {
    trace: (msg, ctx) => console.log(`[TRACE] ${msg}`, ctx || ''),
    debug: (msg, ctx) => console.log(`[DEBUG] ${msg}`, ctx || ''),
    info: (msg, ctx) => console.log(`[INFO] ${msg}`, ctx || ''),
    warn: (msg, ctx) => console.log(`[WARN] ${msg}`, ctx || ''),
    error: (msg, ctx) => console.log(`[ERROR] ${msg}`, ctx || '')
  }

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    logger: customLogger
  })

  try {
    const response = await client.get('/posts/1')
    console.log('Response status:', response.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_loggingInterceptor()
    await example2_headersClass()
    await example3_responseFeatures()
    await example4_dispatcherFactory()
    await example5_mountRouterConcept()
    await example6_mockTesting()
    // await example7_requestCancellation() // May not complete predictably
    await example8_parallelRequests()
    await example9_requestPipeline()
    await example10_resourceAggregation()
    await example11_customLogger()

    console.log('\n=== All advanced examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
