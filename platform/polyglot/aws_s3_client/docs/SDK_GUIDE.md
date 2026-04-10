# AWS S3 Client SDK Guide

The AWS S3 Client SDK provides a high-level API for CLI tools, LLM Agents, and Developer Tools to store and retrieve JSON data from AWS S3 with automatic TTL (Time-To-Live) support.

## Installation

### Node.js

```bash
npm install aws-s3-client
# or
yarn add aws-s3-client
```

### Python

```bash
pip install aws-s3-client
# or
poetry add aws-s3-client
```

## Usage

### Node.js

```typescript
import { createSDK, type SDKConfig } from "aws-s3-client";

// Initialize SDK
const config: SDKConfig = {
  bucketName: "my-storage-bucket",
  region: "us-east-1",
  keyPrefix: "myapp:",
  ttl: 3600, // 1 hour default TTL
  debug: true,
};

const sdk = createSDK(config);

// Save data
const saveResult = await sdk.save({
  userId: 12345,
  name: "Alice",
  email: "alice@example.com",
});

if (saveResult.success) {
  console.log(`Saved with key: ${saveResult.key}`);
  console.log(`Elapsed: ${saveResult.elapsedMs}ms`);
}

// Load data
const loadResult = await sdk.load(saveResult.key!);
if (loadResult.success) {
  console.log("Loaded:", loadResult.data);
}

// Cleanup
await sdk.close();
```

### Python

```python
from aws_s3_client import create_sdk, SDKConfig

# Initialize SDK
config = SDKConfig(
    bucket_name="my-storage-bucket",
    region="us-east-1",
    key_prefix="myapp:",
    ttl=3600,  # 1 hour default TTL
    debug=True,
)

sdk = create_sdk(config)

# Save data
save_result = await sdk.save({
    "user_id": 12345,
    "name": "Alice",
    "email": "alice@example.com",
})

if save_result.success:
    print(f"Saved with key: {save_result.key}")
    print(f"Elapsed: {save_result.elapsed_ms}ms")

# Load data
load_result = await sdk.load(save_result.key)
if load_result.success:
    print(f"Loaded: {load_result.data}")

# Cleanup
await sdk.close()
```

## Features

- **Core Operations**: `save`, `load`, `exists`, `delete`, `listKeys`
- **TTL Support**: Automatic expiration with configurable TTL
- **Deterministic Keys**: Same data produces same key (content-addressable)
- **Custom Keys**: Override auto-generated keys with custom identifiers
- **Expired Entry Management**: List and cleanup expired entries
- **Key Prefixing**: Namespace isolation with configurable prefix
- **Statistics**: Track saves, loads, hits, misses, errors
- **Debug Info**: Inspect configuration and state

## Configuration

### From Environment Variables

**Node.js**
```typescript
import { configFromEnv, createSDK } from "aws-s3-client";

const config = configFromEnv();
// Reads AWS_S3_BUCKET, AWS_REGION, AWS_ENDPOINT_URL
const sdk = createSDK(config);
```

**Python**
```python
from aws_s3_client import config_from_env, create_sdk

config = config_from_env()
# Reads AWS_S3_BUCKET_NAME, AWS_REGION, AWS_ENDPOINT_URL
if config:
    sdk = create_sdk(config)
```

### LocalStack Support

Both implementations support LocalStack for local development:

**Node.js**
```typescript
const config: SDKConfig = {
  bucketName: "local-bucket",
  region: "us-east-1",
  endpointUrl: "http://localhost:4566",
};
```

**Python**
```python
config = SDKConfig(
    bucket_name="local-bucket",
    region="us-east-1",
    endpoint_url="http://localhost:4566",
)
```

## TTL (Time-To-Live)

### Default TTL

Set a default TTL in the configuration:

```typescript
// Node.js
const config: SDKConfig = {
  bucketName: "my-bucket",
  region: "us-east-1",
  ttl: 3600, // All saves expire in 1 hour
};
```

```python
# Python
config = SDKConfig(
    bucket_name="my-bucket",
    region="us-east-1",
    ttl=3600,  # All saves expire in 1 hour
)
```

### Per-Save TTL

Override the default TTL for specific saves:

```typescript
// Node.js - 5 minute session
await sdk.save({ session: "abc123" }, { ttl: 300 });
```

```python
# Python - 5 minute session
await sdk.save({"session": "abc123"}, ttl=300)
```

### No Expiration

Omit TTL for data that should never expire:

```typescript
// Node.js - no TTL in config, no TTL in save options
const config: SDKConfig = {
  bucketName: "my-bucket",
  region: "us-east-1",
  // No ttl specified
};
```

## Deterministic Keys

The SDK generates deterministic keys based on data content:

```typescript
// Node.js
import { generateKey } from "aws-s3-client";

const data1 = { user_id: 123, action: "login" };
const data2 = { user_id: 123, action: "login" };
const data3 = { action: "login", user_id: 123 }; // Different order

console.log(generateKey(data1) === generateKey(data2)); // true
console.log(generateKey(data1) === generateKey(data3)); // true (order independent)
```

```python
# Python
from aws_s3_client import generate_key

data1 = {"user_id": 123, "action": "login"}
data2 = {"user_id": 123, "action": "login"}
data3 = {"action": "login", "user_id": 123}  # Different order

print(generate_key(data1) == generate_key(data2))  # True
print(generate_key(data1) == generate_key(data3))  # True (order independent)
```

## Custom Keys

You can bypass automatic key generation and use custom keys:

### Node.js

```typescript
// Save with custom key
await sdk.save({ session: "data" }, { customKey: "my-session-123" });

// Load with custom key
const result = await sdk.load("my-session-123");
console.log(result.data);
```

### Python

```python
# Save with custom key
await sdk.save({"session": "data"}, custom_key="my-session-123")

# Load with custom key
result = await sdk.load("my-session-123")
print(result.data)
```

## Expired Entry Management

List and cleanup expired entries:

### Node.js

```typescript
// List expired entries (without deleting)
const expiredKeys = await storage.listExpired();
console.log(`Found ${expiredKeys.length} expired entries`);

// Delete all expired entries
const deletedCount = await storage.cleanupExpired();
console.log(`Deleted ${deletedCount} expired entries`);
```

### Python

```python
# List expired entries (without deleting)
expired_keys = await storage.list_expired()
print(f"Found {len(expired_keys)} expired entries")

# Delete all expired entries
deleted_count = await storage.cleanup_expired()
print(f"Deleted {deleted_count} expired entries")
```

## Agent Interface

For LLM agents and tool use, a simplified interface is available:

### Node.js

```typescript
import { createAgentInterface } from "aws-s3-client";

const agent = createAgentInterface(config);

// Store data
const storeResult = await agent.store({ user: "alice", score: 100 });
console.log(storeResult.message); // "Data stored successfully"
console.log(storeResult.key);     // "abc123def456"

// Retrieve data
const retrieveResult = await agent.retrieve(storeResult.key!);
console.log(retrieveResult.data); // { user: "alice", score: 100 }

// Check existence
const checkResult = await agent.check(storeResult.key!);
console.log(checkResult.message); // "Key exists"

// List all keys
const listResult = await agent.listAll();
console.log(listResult.data); // ["key1", "key2", ...]

// Remove data
const removeResult = await agent.remove(storeResult.key!);
console.log(removeResult.message); // "Data removed successfully"

await agent.close();
```

### Python

```python
from aws_s3_client import create_agent_interface

agent = create_agent_interface(config)

# Store data
store_result = await agent.store({"user": "alice", "score": 100})
print(store_result.message)  # "Data stored successfully"
print(store_result.key)      # "abc123def456"

# Retrieve data
retrieve_result = await agent.retrieve(store_result.key)
print(retrieve_result.data)  # {"user": "alice", "score": 100}

# Check existence
check_result = await agent.check(store_result.key)
print(check_result.message)  # "Key exists"

# List all keys
list_result = await agent.list_all()
print(list_result.data)  # ["key1", "key2", ...]

# Remove data
remove_result = await agent.remove(store_result.key)
print(remove_result.message)  # "Data removed successfully"

await agent.close()
```

## Error Handling

The SDK uses response envelopes for error handling:

```typescript
// Node.js
const response = await sdk.save(data);

if (!response.success) {
  console.error(`Error: ${response.error}`);
  console.log(`Elapsed: ${response.elapsedMs}ms`);
} else {
  console.log(`Success! Key: ${response.key}`);
}
```

```python
# Python
response = await sdk.save(data)

if not response.success:
    print(f"Error: {response.error}")
    print(f"Elapsed: {response.elapsed_ms}ms")
else:
    print(f"Success! Key: {response.key}")
```

Configuration errors throw exceptions:

```typescript
// Node.js
import { JsonS3StorageConfigError } from "aws-s3-client";

try {
  const sdk = createSDK({ bucketName: "", region: "" }); // Invalid
} catch (e) {
  if (e instanceof JsonS3StorageConfigError) {
    console.error("Config issues:", e.issues);
  }
}
```

```python
# Python
from aws_s3_client.exceptions import JsonS3StorageConfigError

try:
    sdk = create_sdk(SDKConfig(bucket_name=""))  # Invalid
except JsonS3StorageConfigError as e:
    print(f"Config issues: {e.issues}")
```

## Statistics

Track operation metrics:

```typescript
// Node.js
const stats = await sdk.stats();
console.log(stats.data);
// { saves: 10, loads: 25, hits: 20, misses: 5, deletes: 2, errors: 0 }
```

```python
# Python
stats = await sdk.stats()
print(stats.data)
# {"saves": 10, "loads": 25, "hits": 20, "misses": 5, "deletes": 2, "errors": 0}
```

## Debug Information

Inspect SDK state for debugging:

```typescript
// Node.js
const debug = await sdk.debugInfo();
console.log(debug.data);
// { config: {...}, stats: {...}, lastError: null }
```

```python
# Python
debug = await sdk.debug_info()
print(debug.data)
# {"config": {...}, "stats": {...}, "last_error": None}
```
