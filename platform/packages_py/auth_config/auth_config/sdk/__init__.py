import logging
from typing import List, Dict, Any
from auth_encoding import AuthType
from ..create_auth_config import create_auth_config
from ..to_headers import to_headers
from ..validate_auth_config import validate_auth_config
from ..get_required_credentials import get_required_credentials
from ..constants.credential_requirements import CREDENTIAL_REQUIREMENTS
from ..types.auth_config import AuthConfigInput, AuthConfig, AuthConfigWithHeaders
from ..types.validation import ValidationResult
from .types import SDKResult, OperationMetadata
from .builder import FetchAuthConfigSDKBuilder

class FetchAuthConfigSDK:
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        
    @staticmethod
    def create() -> FetchAuthConfigSDKBuilder:
        return FetchAuthConfigSDKBuilder()
        
    @property
    def version(self) -> str:
        return "0.1.0"
        
    @property
    def credential_requirements(self) -> Dict[str, List[str]]:
        return CREDENTIAL_REQUIREMENTS
        
    @property
    def operations(self) -> List[OperationMetadata]:
        return [
            OperationMetadata("create_config", "Create AuthConfig", ["input"]),
            OperationMetadata("encode_headers", "Encode to headers", ["config"]),
            OperationMetadata("validate", "Validate config", ["config"]),
            OperationMetadata("get_requirements", "Get required credentials", ["auth_type"]),
            OperationMetadata("list_auth_types", "List valid auth types", []),
        ]

    def create_config(self, input_config: AuthConfigInput) -> SDKResult[AuthConfig | AuthConfigWithHeaders]:
        try:
            result = create_auth_config(input_config)
            return SDKResult(success=True, data=result)
        except Exception as e:
            self.logger.error(f"create_config failed: {e}")
            return SDKResult(success=False, error=e)
            
    def encode_headers(self, config: AuthConfig) -> SDKResult[Dict[str, str]]:
        try:
            result = to_headers(config)
            return SDKResult(success=True, data=result)
        except Exception as e:
            self.logger.error(f"encode_headers failed: {e}")
            return SDKResult(success=False, error=e)

    def validate(self, config: AuthConfig) -> SDKResult[ValidationResult]:
        try:
            result = validate_auth_config(config)
            return SDKResult(success=True, data=result)
        except Exception as e:
            self.logger.error(f"validate failed: {e}")
            return SDKResult(success=False, error=e)
            
    def get_requirements(self, auth_type: str) -> SDKResult[List[str]]:
        try:
            result = get_required_credentials(auth_type)
            return SDKResult(success=True, data=result)
        except Exception as e:
            self.logger.error(f"get_requirements failed: {e}")
            return SDKResult(success=False, error=e)

    def list_auth_types(self) -> SDKResult[List[str]]:
        try:
            types = list(CREDENTIAL_REQUIREMENTS.keys())
            return SDKResult(success=True, data=types)
        except Exception as e:
            self.logger.error(f"list_auth_types failed: {e}")
            return SDKResult(success=False, error=e)
            
    def describe(self, operation: str) -> SDKResult[OperationMetadata]:
        op = next((o for o in self.operations if o.name == operation), None)
        if op:
            return SDKResult(success=True, data=op)
        return SDKResult(success=False, error=ValueError(f"Operation {operation} not found"))

__all__ = ['FetchAuthConfigSDK', 'FetchAuthConfigSDKBuilder', 'SDKResult', 'OperationMetadata']
