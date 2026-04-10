"""
TLS/SSL Configuration for fetch_httpx package.

Provides TLS configuration utilities:
- Custom CA bundle loading
- SSL context management
- Client certificate (mTLS) support
- Certificate validation

Enterprise-grade TLS configuration for secure HTTP communication.
"""

from __future__ import annotations

import ssl
from pathlib import Path
from typing import TYPE_CHECKING

from . import logger as logger_module

if TYPE_CHECKING:
    from ._types import CertTypes, VerifyTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# SSL Context Builder
# =============================================================================

class SSLContextBuilder:
    """
    Builder for creating configured SSL contexts.

    Provides a fluent interface for SSL context configuration.

    Example:
        context = (
            SSLContextBuilder()
            .with_ca_bundle("/path/to/ca-bundle.pem")
            .with_client_cert("/path/to/cert.pem", "/path/to/key.pem")
            .with_minimum_version(ssl.TLSVersion.TLSv1_2)
            .build()
        )
    """

    def __init__(self) -> None:
        self._purpose = ssl.Purpose.SERVER_AUTH
        self._ca_bundle: str | None = None
        self._client_cert: str | None = None
        self._client_key: str | None = None
        self._key_password: str | None = None
        self._minimum_version: ssl.TLSVersion | None = None
        self._maximum_version: ssl.TLSVersion | None = None
        self._verify_mode: ssl.VerifyMode | None = None
        self._check_hostname: bool = True

    def with_ca_bundle(self, path: str) -> SSLContextBuilder:
        """Set custom CA certificate bundle."""
        self._ca_bundle = path
        logger.debug("CA bundle configured", context={"path": path})
        return self

    def with_client_cert(
        self,
        cert_path: str,
        key_path: str | None = None,
        password: str | None = None,
    ) -> SSLContextBuilder:
        """Set client certificate for mTLS."""
        self._client_cert = cert_path
        self._client_key = key_path or cert_path
        self._key_password = password
        logger.debug(
            "Client certificate configured",
            context={"cert": cert_path, "has_password": password is not None}
        )
        return self

    def with_minimum_version(
        self, version: ssl.TLSVersion
    ) -> SSLContextBuilder:
        """Set minimum TLS version."""
        self._minimum_version = version
        logger.debug("Minimum TLS version set", context={"version": version.name})
        return self

    def with_maximum_version(
        self, version: ssl.TLSVersion
    ) -> SSLContextBuilder:
        """Set maximum TLS version."""
        self._maximum_version = version
        logger.debug("Maximum TLS version set", context={"version": version.name})
        return self

    def without_verification(self) -> SSLContextBuilder:
        """Disable certificate verification (INSECURE - use only for testing)."""
        self._verify_mode = ssl.CERT_NONE
        self._check_hostname = False
        logger.warn("SSL verification disabled - INSECURE")
        return self

    def build(self) -> ssl.SSLContext:
        """Build and return the configured SSL context."""
        context = ssl.create_default_context(purpose=self._purpose)

        # Load CA bundle
        if self._ca_bundle:
            if Path(self._ca_bundle).is_file():
                context.load_verify_locations(cafile=self._ca_bundle)
            elif Path(self._ca_bundle).is_dir():
                context.load_verify_locations(capath=self._ca_bundle)
            else:
                raise ValueError(f"CA bundle not found: {self._ca_bundle}")

        # Load client certificate
        if self._client_cert:
            context.load_cert_chain(
                certfile=self._client_cert,
                keyfile=self._client_key,
                password=self._key_password,
            )

        # Set TLS version constraints
        if self._minimum_version:
            context.minimum_version = self._minimum_version
        if self._maximum_version:
            context.maximum_version = self._maximum_version

        # Set verification mode
        if self._verify_mode is not None:
            context.verify_mode = self._verify_mode
            context.check_hostname = self._check_hostname

        logger.info("SSL context built successfully")
        return context


# =============================================================================
# SSL Context Factory Functions
# =============================================================================

def create_ssl_context(
    verify: VerifyTypes = True,
    cert: CertTypes | None = None,
) -> ssl.SSLContext | None:
    """
    Create an SSL context from configuration parameters.

    Args:
        verify: True (default verification), False (no verification),
               str (CA bundle path), or ssl.SSLContext (use directly)
        cert: None, str (combined PEM), (cert, key) tuple,
              or (cert, key, password) tuple

    Returns:
        Configured SSL context, or None for default behavior
    """
    # If already an SSLContext, use it directly
    if isinstance(verify, ssl.SSLContext):
        logger.debug("Using provided SSL context")
        return verify

    # No verification requested
    if verify is False:
        logger.warn("SSL verification disabled")
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        return context

    # Create builder
    builder = SSLContextBuilder()

    # Custom CA bundle
    if isinstance(verify, str):
        builder.with_ca_bundle(verify)

    # Client certificate
    if cert is not None:
        if isinstance(cert, str):
            # Combined PEM file
            builder.with_client_cert(cert)
        elif isinstance(cert, tuple):
            if len(cert) == 2:
                cert_path, key_path = cert
                builder.with_client_cert(cert_path, key_path)
            elif len(cert) == 3:
                cert_path, key_path, password = cert
                builder.with_client_cert(cert_path, key_path, password)
            else:
                raise ValueError(f"Invalid cert tuple: expected 2-3 elements, got {len(cert)}")

    # If only default verification, return None to use library defaults
    if verify is True and cert is None:
        return None

    return builder.build()


def load_ca_bundle(path: str) -> ssl.SSLContext:
    """
    Load a custom CA certificate bundle.

    Args:
        path: Path to CA bundle file or directory

    Returns:
        SSL context with custom CA

    Raises:
        FileNotFoundError: If path doesn't exist
        ssl.SSLError: If certificates can't be loaded
    """
    path_obj = Path(path)

    if not path_obj.exists():
        raise FileNotFoundError(f"CA bundle not found: {path}")

    context = ssl.create_default_context()

    if path_obj.is_file():
        context.load_verify_locations(cafile=str(path_obj))
        logger.info("CA bundle loaded from file", context={"path": path})
    else:
        context.load_verify_locations(capath=str(path_obj))
        logger.info("CA bundle loaded from directory", context={"path": path})

    return context


def load_client_cert(
    cert_path: str,
    key_path: str | None = None,
    password: str | None = None,
) -> ssl.SSLContext:
    """
    Load client certificate for mTLS.

    Args:
        cert_path: Path to certificate file
        key_path: Path to private key file (if separate from cert)
        password: Password for encrypted private key

    Returns:
        SSL context with client certificate

    Raises:
        FileNotFoundError: If certificate files don't exist
        ssl.SSLError: If certificates can't be loaded
    """
    cert_obj = Path(cert_path)
    key_obj = Path(key_path) if key_path else cert_obj

    if not cert_obj.exists():
        raise FileNotFoundError(f"Certificate not found: {cert_path}")
    if key_path and not key_obj.exists():
        raise FileNotFoundError(f"Private key not found: {key_path}")

    context = ssl.create_default_context()
    context.load_cert_chain(
        certfile=str(cert_obj),
        keyfile=str(key_obj),
        password=password,
    )

    logger.info(
        "Client certificate loaded",
        context={"cert": cert_path, "has_password": password is not None}
    )

    return context


# =============================================================================
# Certificate Validation
# =============================================================================

def get_server_certificate(
    host: str,
    port: int = 443,
    timeout: float = 10.0,
) -> str:
    """
    Retrieve the server's SSL certificate.

    Useful for debugging certificate issues.

    Args:
        host: Server hostname
        port: Server port (default 443)
        timeout: Connection timeout

    Returns:
        PEM-encoded certificate string
    """
    import socket

    logger.debug(
        "Fetching server certificate",
        context={"host": host, "port": port}
    )

    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    with socket.create_connection((host, port), timeout=timeout) as sock:
        with context.wrap_socket(sock, server_hostname=host) as ssock:
            cert_der = ssock.getpeercert(binary_form=True)
            if cert_der:
                cert_pem = ssl.DER_cert_to_PEM_cert(cert_der)
                logger.info("Server certificate retrieved")
                return cert_pem

    raise ssl.SSLError(f"Could not retrieve certificate from {host}:{port}")


__all__ = [
    "SSLContextBuilder",
    "create_ssl_context",
    "load_ca_bundle",
    "load_client_cert",
    "get_server_certificate",
]
