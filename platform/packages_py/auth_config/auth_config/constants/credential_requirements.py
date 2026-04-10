from typing import Dict, List
from auth_encoding import AuthType

# Map of AuthType to list of required credential fields
# Fields match AuthConfig attributes: username, password, email, token, baseUrl, headerName
CREDENTIAL_REQUIREMENTS: Dict[str, List[str]] = {
    AuthType.BASIC: ['username', 'password'],
    AuthType.BASIC_EMAIL: ['email', 'password'],
    AuthType.BASIC_TOKEN: ['username', 'token'],
    AuthType.BASIC_EMAIL_TOKEN: ['email', 'token'],
    
    AuthType.BEARER: ['token'],
    AuthType.BEARER_OAUTH: ['token'],
    AuthType.BEARER_JWT: ['token'],
    
    AuthType.BEARER_USERNAME_TOKEN: ['username', 'token'],
    AuthType.BEARER_USERNAME_PASSWORD: ['username', 'password'],
    AuthType.BEARER_EMAIL_TOKEN: ['email', 'token'],
    AuthType.BEARER_EMAIL_PASSWORD: ['email', 'password'],
    
    AuthType.X_API_KEY: ['token'],
    
    AuthType.CUSTOM: ['headerName', 'headerValue'],
    AuthType.CUSTOM_HEADER: ['headerName', 'headerValue'],
    
    AuthType.NONE: [],
    AuthType.HMAC: [], # not implemented
}
