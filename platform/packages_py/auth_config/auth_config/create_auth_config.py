from .logger import create_logger
from .types.auth_config import AuthConfig, AuthConfigInput, AuthConfigWithHeaders
from .validate_auth_config import validate_auth_config
from .to_headers import to_headers
from .errors import AuthConfigError

logger = create_logger('fetch_auth_config', __file__)

def create_auth_config(input_config: AuthConfigInput) -> AuthConfig | AuthConfigWithHeaders:
    """
    Create an AuthConfig from input, optionally encoding headers.
    
    Args:
        input_config: AuthConfigInput object
        
    Returns:
        AuthConfig or AuthConfigWithHeaders depending on encode flag
    """
    logger.debug('create_auth_config called', extra={'type': input_config.type})
    
    # Create base config
    config = AuthConfig(
        type=input_config.type,
        username=input_config.username,
        password=input_config.password,
        email=input_config.email,
        token=input_config.token,
        baseUrl=input_config.baseUrl,
        headerName=input_config.headerName,
        headerValue=input_config.headerValue,
    )
    
    # Validate
    validation = validate_auth_config(config)
    if not validation.valid:
        error_msg = f"Invalid auth config: {', '.join(validation.errors)}"
        logger.error(error_msg, extra={'type': config.type})
        raise AuthConfigError(error_msg)
        
    if input_config.encode:
        logger.debug('Encoding headers', extra={'type': config.type})
        headers = to_headers(config)
        result = AuthConfigWithHeaders(
            type=config.type,
            username=config.username,
            password=config.password,
            email=config.email,
            token=config.token,
            baseUrl=config.baseUrl,
            headerName=config.headerName,
            headerValue=config.headerValue,
            headers=headers
        )
        logger.info('AuthConfigWithHeaders created successfully', extra={'type': config.type})
        return result
    
    logger.info('AuthConfig created successfully', extra={'type': config.type})
    return config
