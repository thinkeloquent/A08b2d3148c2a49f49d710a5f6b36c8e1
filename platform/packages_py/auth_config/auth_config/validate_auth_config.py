from auth_encoding import is_valid_auth_type
from .types.auth_config import AuthConfig
from .types.validation import ValidationResult
from .get_required_credentials import get_required_credentials
from .logger import create_logger

logger = create_logger('fetch_auth_config', __file__)

def validate_auth_config(config: AuthConfig) -> ValidationResult:
    """
    Validate an existing AuthConfig.
    
    Args:
        config: AuthConfig object
        
    Returns:
        ValidationResult
    """
    logger.debug('validate_auth_config called', extra={'type': config.type})
    
    errors = []
    warnings = []
    
    # 1. Validate Type
    if not is_valid_auth_type(config.type):
        errors.append(f"Invalid auth type: {config.type}")
        logger.warning('Validation failed: Invalid auth type', extra={'type': config.type})
        return ValidationResult(valid=False, errors=errors)
        
    # 2. Validate Required Credentials
    required_fields = get_required_credentials(config.type)
    for field in required_fields:
        value = getattr(config, field, None)
        if not value:
            errors.append(f"Missing required field: {field}")
            
    if errors:
        logger.warning(f"Validation failed with {len(errors)} errors", extra={'type': config.type})
        return ValidationResult(valid=False, errors=errors, warnings=warnings)
        
    logger.debug('Validation successful', extra={'type': config.type})
    return ValidationResult(valid=True, warnings=warnings)
