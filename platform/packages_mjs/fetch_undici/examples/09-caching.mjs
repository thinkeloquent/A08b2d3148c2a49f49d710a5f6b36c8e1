/**
 * 09-caching.mjs - Response Caching Examples
 *
 * This file demonstrates response caching patterns:
 * - CachingClient wrapper
 * - withCache HOF
 * - Custom key strategies with dot notation
 * - Cache middleware
 */

import {
  CachingClient,
  AsyncClient,
  withCache,
  createDotNotationKeyStrategy,
  createCacheHooks,
  CacheManager,
  MemoryStorage
} from 'fetch-undici'

// =============================================================================
// Example 1: CachingClient Basic Usage
// =============================================================================

export async function example1_cachingClient() {
  console.log('=== Example 1: CachingClient Basic Usage ===')

  const client = new CachingClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    cache: {
      ttl: 60000, // 1 minute
      methods: ['GET', 'HEAD']
    }
  })

  try {
    // First request - cache miss
    console.log('First request (cache miss)...')
    const start1 = Date.now()
    const response1 = await client.get('/posts/1')
    console.log('  Status:', response1.statusCode)
    console.log('  Duration:', Date.now() - start1, 'ms')

    // Second request - cache hit
    console.log('Second request (cache hit)...')
    const start2 = Date.now()
    const response2 = await client.get('/posts/1')
    console.log('  Status:', response2.statusCode)
    console.log('  Duration:', Date.now() - start2, 'ms')

    // Check cache stats
    const stats = await client.cache.stats()
    console.log('Cache stats:', stats)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 2: Cache Invalidation
// =============================================================================

export async function example2_cacheInvalidation() {
  console.log('\n=== Example 2: Cache Invalidation ===')

  const client = new CachingClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    cache: { ttl: 60000 }
  })

  try {
    // Populate cache
    await client.get('/posts/1')
    await client.get('/posts/2')
    await client.get('/users/1')

    console.log('Cache keys:', await client.cache.keys())

    // Invalidate single key
    const deleted = await client.cache.invalidate(
      'GET:https://jsonplaceholder.typicode.com/posts/1'
    )
    console.log('Invalidated single key:', deleted)

    // Invalidate by pattern
    const count = await client.cache.invalidatePattern('GET:*posts*')
    console.log('Invalidated by pattern:', count, 'keys')

    console.log('Remaining keys:', await client.cache.keys())

    // Clear all
    await client.cache.clear()
    console.log('After clear:', await client.cache.keys())
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 3: Per-Request Cache Options
// =============================================================================

export async function example3_perRequestOptions() {
  console.log('\n=== Example 3: Per-Request Cache Options ===')

  const client = new CachingClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    cache: { ttl: 60000 }
  })

  try {
    // Normal cached request
    await client.get('/posts/1')
    console.log('First request cached')

    // Skip cache for this request
    const response1 = await client.get('/posts/1', {
      cache: { noCache: true }
    })
    console.log('noCache: fetched from network, status:', response1.statusCode)

    // Force refresh (bypass read, still write)
    const response2 = await client.get('/posts/1', {
      cache: { forceRefresh: true }
    })
    console.log('forceRefresh: fetched fresh, status:', response2.statusCode)

    // Custom TTL for this request
    await client.get('/posts/2', {
      cache: { ttl: 5000 } // 5 seconds
    })
    console.log('Custom TTL set for /posts/2')

    // Custom cache key
    await client.get('/posts/3', {
      cache: { cacheKey: 'my-custom-key' }
    })
    console.log('Custom cache key set')
    console.log('Keys:', await client.cache.keys())
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 4: withCache HOF
// =============================================================================

export async function example4_withCacheHOF() {
  console.log('\n=== Example 4: withCache HOF ===')

  // Import the request function
  const { request } = await import('fetch-undici')

  // Wrap with caching
  const cachedRequest = withCache(request, { ttl: 60000 })

  try {
    // First request - cache miss
    console.log('First request...')
    const response1 = await cachedRequest(
      'GET',
      'https://jsonplaceholder.typicode.com/posts/1'
    )
    console.log('  Status:', response1.statusCode)

    // Second request - cache hit
    console.log('Second request...')
    const response2 = await cachedRequest(
      'GET',
      'https://jsonplaceholder.typicode.com/posts/1'
    )
    console.log('  Status:', response2.statusCode)

    // Access cache manager
    const stats = await cachedRequest.cache.stats()
    console.log('Cache stats:', stats)
  } finally {
    await cachedRequest.cache.close()
  }
}

// =============================================================================
// Example 5: Dot Notation Key Strategy
// =============================================================================

export async function example5_dotNotationKeyStrategy() {
  console.log('\n=== Example 5: Dot Notation Key Strategy ===')

  // Create key strategy that includes headers and params
  const keyStrategy = createDotNotationKeyStrategy([
    'headers.Authorization',
    'params.page',
    'params.limit'
  ])

  const client = new CachingClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    cache: {
      ttl: 60000,
      keyStrategy
    }
  })

  try {
    // Request with specific params
    await client.get('/posts', {
      params: { page: 1, limit: 10 },
      headers: { Authorization: 'Bearer user1-token' }
    })

    // Different params = different cache key
    await client.get('/posts', {
      params: { page: 2, limit: 10 },
      headers: { Authorization: 'Bearer user1-token' }
    })

    // Different auth = different cache key
    await client.get('/posts', {
      params: { page: 1, limit: 10 },
      headers: { Authorization: 'Bearer user2-token' }
    })

    console.log('Cache keys:')
    const keys = await client.cache.keys()
    keys.forEach((key) => console.log('  ', key))
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 6: Cache Middleware with Event Hooks
// =============================================================================

export async function example6_cacheMiddleware() {
  console.log('\n=== Example 6: Cache Middleware with Event Hooks ===')

  // Create cache hooks
  const { cacheManager, requestHook, responseHook } = createCacheHooks({
    ttl: 60000
  })

  // Create client with hooks
  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    eventHooks: {
      request: [requestHook],
      response: [responseHook]
    }
  })

  try {
    // Responses are automatically cached
    await client.get('/posts/1')
    await client.get('/posts/2')

    console.log('Cached responses:', await cacheManager.keys())

    // Access cache directly
    const cached = await cacheManager.get(
      'GET:https://jsonplaceholder.typicode.com/posts/1'
    )
    if (cached) {
      console.log('Cached data:', cached.data?.title)
    }
  } finally {
    await cacheManager.close()
    await client.close()
  }
}

// =============================================================================
// Example 7: Custom Storage Backend
// =============================================================================

export async function example7_customStorage() {
  console.log('\n=== Example 7: Custom Storage Backend ===')

  // Use custom memory storage with different options
  const customStorage = new MemoryStorage({
    maxEntries: 100,
    cleanupInterval: 30000 // 30 seconds
  })

  const client = new CachingClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    cache: {
      ttl: 60000,
      storage: customStorage
    }
  })

  try {
    await client.get('/posts/1')
    await client.get('/posts/2')

    const stats = await client.cache.stats()
    console.log('Custom storage stats:', stats)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 8: Cache Manager Standalone
// =============================================================================

export async function example8_standaloneManager() {
  console.log('\n=== Example 8: Cache Manager Standalone ===')

  const manager = new CacheManager({
    ttl: 60000,
    methods: ['GET']
  })

  try {
    // Generate cache key
    const key = manager.generateKey('GET', 'https://api.example.com/users')
    console.log('Generated key:', key)

    // Check if method should be cached
    console.log('Should cache GET:', manager.shouldCache('GET'))
    console.log('Should cache POST:', manager.shouldCache('POST'))

    // Get stats
    const stats = await manager.stats()
    console.log('Stats:', stats)
  } finally {
    await manager.close()
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_cachingClient()
    await example2_cacheInvalidation()
    await example3_perRequestOptions()
    await example4_withCacheHOF()
    await example5_dotNotationKeyStrategy()
    await example6_cacheMiddleware()
    await example7_customStorage()
    await example8_standaloneManager()

    console.log('\n=== All caching examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
