from typing import Dict
from auth_encoding import encode_auth, get_header_name
from .types.auth_config import AuthConfig
from .logger import create_logger

logger = create_logger('fetch_auth_config', __file__)

def to_headers(config: AuthConfig) -> Dict[str, str]:
    """
    Encode an existing AuthConfig to headers.
    
    Args:
        config: AuthConfig object
        
    Returns:
        Dictionary of headers
    """
    logger.debug('to_headers called', extra={'type': config.type})
    
    # Extract credentials based on config fields
    credentials = {
        'username': config.username,
        'password': config.password,
        'email': config.email,
        'token': config.token,
        'headerName': config.headerName,
        'header_name': config.headerName,  # alias support
        'headerValue': config.headerValue,
        'header_value': config.headerValue,  # alias support
    }
    # Filter out None to avoid overriding valid aliases? 
    # Actually auth_encoding probably handles missing keys gracefully or we should only pass what we have.
    # But filtering None is good.
    credentials = {k: v for k, v in credentials.items() if v is not None}
    
    try:
        headers = encode_auth(config.type, credentials)
        header_name = get_header_name(config.type)

        # Log header name but NOT value for security
        logger.info('Headers generated', extra={'header': header_name})
        return headers
    except Exception as e:
        logger.error(f"Failed to encode headers: {str(e)}", extra={'type': config.type})
        raise e
