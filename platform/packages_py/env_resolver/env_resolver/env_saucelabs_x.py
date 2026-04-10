from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_int


@dataclass(frozen=True)
class SaucelabsEnv:
    username: str | None
    access_key: str | None
    region: str
    base_url: str
    timeout: int
    browser: str
    browser_version: str
    platform: str
    tunnel_name: str | None


def resolve_saucelabs_env(config: dict[str, Any] | None = None) -> SaucelabsEnv:
    return SaucelabsEnv(
        username=resolve(None, ['SAUCE_USERNAME', 'SAUCELABS_USERNAME'], config, 'username', None),
        access_key=resolve(None, ['SAUCE_ACCESS_KEY', 'SAUCELABS_ACCESS_KEY'], config, 'access_key', None),
        region=resolve(None, ['SAUCE_REGION'], config, 'region', 'us-west-1'),
        base_url=resolve(None, ['SAUCELABS_BASE_URL'], config, 'base_url', 'https://api.us-west-1.saucelabs.com'),
        timeout=resolve_int(None, ['SAUCE_TIMEOUT'], config, 'timeout', 30),
        browser=resolve(None, ['SAUCE_BROWSER'], config, 'browser', 'chrome'),
        browser_version=resolve(None, ['SAUCE_BROWSER_VERSION'], config, 'browser_version', 'latest'),
        platform=resolve(None, ['SAUCE_PLATFORM'], config, 'platform', 'Windows 11'),
        tunnel_name=resolve(None, ['SAUCE_TUNNEL_NAME'], config, 'tunnel_name', None),
    )
