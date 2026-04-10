from typing import List
from .constants.credential_requirements import CREDENTIAL_REQUIREMENTS
from .logger import create_logger

logger = create_logger('fetch_auth_config', __file__)

def get_required_credentials(auth_type: str) -> List[str]:
    """
    Look up required credentials for an auth type.
    
    Args:
        auth_type: AuthType string
        
    Returns:
        List of required field names
    """
    reqs = CREDENTIAL_REQUIREMENTS.get(auth_type, [])
    logger.debug(f'get_required_credentials for {auth_type}: {reqs}')
    return reqs
