from typing import Literal, Optional

from pydantic import BaseModel, Field


class RedisConfigValidator(BaseModel):
    """Validator for Redis configuration parameters."""
    host: str = Field(min_length=1)
    port: int = Field(ge=1, le=65535)
    username: str | None = None
    password: str | None = None
    db: int = Field(default=0, ge=0)
    unix_socket_path: str | None = None
    use_ssl: bool = False
    ssl_cert_reqs: Literal["none", "optional", "required"] = "none"
    ssl_ca_certs: str | None = None
    ssl_ca_data: str | None = None
    ssl_certfile: str | None = None
    ssl_keyfile: str | None = None
    ssl_check_hostname: bool = False
    socket_timeout: float = Field(default=5.0, gt=0)
    socket_connect_timeout: float = Field(default=5.0, gt=0)
    retry_on_timeout: bool = False
    max_connections: int | None = Field(default=None, gt=0)
    health_check_interval: float = Field(default=0, ge=0)
