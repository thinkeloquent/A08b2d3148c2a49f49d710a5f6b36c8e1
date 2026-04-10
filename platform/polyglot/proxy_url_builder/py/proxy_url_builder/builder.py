"""Build authenticated proxy URLs from separate credentials and a proxy host/URL."""

from urllib.parse import quote, urlparse

_DEFAULT_PORTS: dict[str, int] = {
    'http': 80,
    'https': 443,
}


def encode_credential(value: str) -> str:
    """Percent-encode a credential value for use in a proxy URL's userinfo.

    Encodes everything including ``@``, ``:``, ``#``, ``!``, ``'``, ``(``,
    ``)``, ``*``, spaces, etc.  This matches the behavior of the TypeScript
    counterpart which applies ``encodeURIComponent`` plus additional RFC 3986
    userinfo encoding.
    """
    return quote(value, safe='')


def build_proxy_url(user: str, password: str, proxy_url: str) -> str:
    """Build an authenticated proxy URL from separate parts.

    *proxy_url* can be a bare hostname (``proxy.example.com``), a
    hostname:port (``proxy.example.com:8080``), or a full URL
    (``http://proxy.example.com:8080``).  Any existing credentials in the
    URL are replaced.  Default ports (80 for http, 443 for https) are
    stripped for cross-language parity.  Trailing paths are stripped.
    """
    normalized = proxy_url
    if '://' not in normalized:
        normalized = f'http://{normalized}'

    parsed = urlparse(normalized)
    scheme = parsed.scheme
    hostname = parsed.hostname or ''

    # Determine port — drop default ports for cross-language parity
    port_segment = ''
    if parsed.port is not None and parsed.port != _DEFAULT_PORTS.get(scheme):
        port_segment = f':{parsed.port}'

    encoded_user = encode_credential(user)
    encoded_pass = encode_credential(password)

    return f'{scheme}://{encoded_user}:{encoded_pass}@{hostname}{port_segment}'
