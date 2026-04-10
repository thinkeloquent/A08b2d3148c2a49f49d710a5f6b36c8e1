# proxy_url_builder — Usage

Build authenticated proxy URLs from separate credentials and a proxy host/URL.
Produces identical output in both TypeScript and Python.

## Install

**TypeScript**

```bash
cd platform/polyglot/proxy_url_builder/mjs
pnpm install && pnpm build
```

**Python**

```bash
cd platform/polyglot/proxy_url_builder/py
pip install -e .
```

## API

### `buildProxyUrl` / `build_proxy_url`

Combines a username, password, and proxy host into a single authenticated proxy URL.

| Parameter   | Type   | Description                                                                 |
|-------------|--------|-----------------------------------------------------------------------------|
| `user`      | string | Proxy username (special characters are percent-encoded automatically)       |
| `password`  | string | Proxy password (special characters are percent-encoded automatically)       |
| `proxyUrl`  | string | Bare hostname, hostname:port, or full URL (existing credentials are replaced) |

**Returns** a fully-qualified proxy URL with encoded credentials.

**Behavior:**

- If the input has no scheme (`://`), `http://` is prepended.
- Default ports are stripped (80 for http, 443 for https).
- Trailing paths on the proxy URL are stripped.
- Existing credentials in the proxy URL are replaced.

### `encodeCredential` / `encode_credential`

Percent-encodes a single credential value for use in URL userinfo.
Encodes all special characters including `@`, `:`, `#`, `!`, `'`, `(`, `)`, `*`, `+`, `=`, `&`, and spaces.

## Examples

### TypeScript

```typescript
import { buildProxyUrl, encodeCredential } from '@internal/proxy-url-builder';

// Bare hostname
buildProxyUrl('admin', 'secret', 'proxy.example.com');
// => 'http://admin:secret@proxy.example.com'

// Hostname with port
buildProxyUrl('admin', 'secret', 'proxy.example.com:8080');
// => 'http://admin:secret@proxy.example.com:8080'

// Full URL (existing creds replaced)
buildProxyUrl('newuser', 'newpass', 'http://old:creds@proxy:8080');
// => 'http://newuser:newpass@proxy:8080'

// Special characters in credentials
buildProxyUrl('user@domain', 'p@ss:word', 'proxy.example.com:3128');
// => 'http://user%40domain:p%40ss%3Aword@proxy.example.com:3128'

// HTTPS with default port stripped
buildProxyUrl('user', 'p#ss!', 'https://secure.proxy.com:443');
// => 'https://user:p%23ss%21@secure.proxy.com'

// Encode a single credential
encodeCredential('user@domain');
// => 'user%40domain'
```

### Python

```python
from proxy_url_builder import build_proxy_url, encode_credential

# Bare hostname
build_proxy_url('admin', 'secret', 'proxy.example.com')
# => 'http://admin:secret@proxy.example.com'

# Hostname with port
build_proxy_url('admin', 'secret', 'proxy.example.com:8080')
# => 'http://admin:secret@proxy.example.com:8080'

# Full URL (existing creds replaced)
build_proxy_url('newuser', 'newpass', 'http://old:creds@proxy:8080')
# => 'http://newuser:newpass@proxy:8080'

# Special characters in credentials
build_proxy_url('user@domain', 'p@ss:word', 'proxy.example.com:3128')
# => 'http://user%40domain:p%40ss%3Aword@proxy.example.com:3128'

# HTTPS with default port stripped
build_proxy_url('user', 'p#ss!', 'https://secure.proxy.com:443')
# => 'https://user:p%23ss%21@secure.proxy.com'

# Encode a single credential
encode_credential('user@domain')
# => 'user%40domain'
```

## Testing

```bash
# Both languages
make test

# TypeScript only
make test-fastify

# Python only
make test-fastapi

# With coverage
make test-coverage
```
