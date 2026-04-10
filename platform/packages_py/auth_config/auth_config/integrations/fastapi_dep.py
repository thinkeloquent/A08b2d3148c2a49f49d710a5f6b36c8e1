from functools import lru_cache
import logging
from typing import Annotated, Callable
from fastapi import Depends
from ..types.auth_config import AuthConfigWithHeaders, AuthConfigInput
from ..create_auth_config import create_auth_config
from ..logger import create_logger

logger = create_logger('fetch_auth_config.integrations.fastapi', __file__)

def get_auth_config_dep(
    config_input: AuthConfigInput
) -> Callable[[], AuthConfigWithHeaders]:
    """
    Factory to create a FastAPI dependency that returns an AuthConfig.
    
    Args:
        config_input: Configuration input
        
    Returns:
        Dependency callable
    """
    logger.info("Initializing AuthConfig dependency factory")
    
    @lru_cache()
    def dependency() -> AuthConfigWithHeaders:
        logger.debug("Creating AuthConfig dependency instance")
        # Ensure encoding is on for headers
        # Use object replacement or just modify? Data classes are mutable by default.
        config_input.encode = True 
        result = create_auth_config(config_input)
        if not isinstance(result, AuthConfigWithHeaders):
             # This means encoding failed to return headers wrapper, logic error
             raise TypeError("Expected AuthConfigWithHeaders but got AuthConfig")
        return result
        
    return dependency

# Type alias for easier usage
# Note: Depends usage usually requires a callable, but resolving Annotated at runtime works with Depends(fn)
AuthConfigDep = Annotated[AuthConfigWithHeaders, Depends]
