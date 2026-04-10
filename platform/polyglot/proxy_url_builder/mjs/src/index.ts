/**
 * Encode a credential value for use in a proxy URL's userinfo component.
 *
 * Uses `encodeURIComponent` then additionally encodes `!'()*` which
 * `encodeURIComponent` leaves unencoded. This achieves parity with
 * Python's `urllib.parse.quote(value, safe='')`.
 */
export function encodeCredential(value: string): string {
    return encodeURIComponent(value).replace(/[!'()*]/g, (c) =>
        `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

const DEFAULT_PORTS: Record<string, string> = {
    'http:': '80',
    'https:': '443',
};

/**
 * Build an authenticated proxy URL from separate credentials and a proxy
 * host/URL.
 *
 * The proxy input can be:
 * - A bare hostname: `proxy.example.com`
 * - hostname:port: `proxy.example.com:8080`
 * - A full URL: `http://proxy.example.com:8080`
 *
 * Any existing credentials in the proxy URL are replaced.
 * Default ports (80 for http, 443 for https) are stripped for parity
 * with Python's urlparse behavior.
 * Trailing paths are stripped.
 */
export function buildProxyUrl(user: string, password: string, proxyUrl: string): string {
    let normalized = proxyUrl;
    if (!normalized.includes('://')) {
        normalized = `http://${normalized}`;
    }

    const parsed = new URL(normalized);
    const scheme = parsed.protocol.replace(/:$/, '');
    const hostname = parsed.hostname;

    // Determine port — drop default ports for cross-language parity
    let portSegment = '';
    if (parsed.port && parsed.port !== DEFAULT_PORTS[parsed.protocol]) {
        portSegment = `:${parsed.port}`;
    }

    const encodedUser = encodeCredential(user);
    const encodedPass = encodeCredential(password);

    return `${scheme}://${encodedUser}:${encodedPass}@${hostname}${portSegment}`;
}
