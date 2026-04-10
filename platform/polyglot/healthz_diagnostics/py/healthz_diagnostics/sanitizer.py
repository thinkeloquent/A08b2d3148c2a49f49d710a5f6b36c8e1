import os
import copy
from typing import Any, Dict, List
from .logger import create as create_logger

logger = create_logger("healthz_diagnostics", __name__)

class ConfigSanitizer:
    """
    Sanitizes configuration by redacting secrets and checking environment variables.
    """
    
    # Simple substring matching for now as per plan implications, or specific keys?
    # Plan says "Sensitive patterns: endpoint_api_key, api_key, token, password, secret"
    pass 

    SENSITIVE_KEYS = {
        "endpoint_api_key",
        "api_key",
        "token",
        "password",
        "secret",
        "client_secret",
        "access_token"
    }

    def sanitize(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep copy config and redact sensitive fields with '***'.
        """
        # Deep copy to avoid mutating original
        try:
            safe_config = copy.deepcopy(config)
        except Exception as e:
            logger.error(f"Failed to deep copy config: {e}")
            safe_config = config.copy() # Shallow fallback

        return self._recursive_redact(safe_config)

    def _recursive_redact(self, obj: Any) -> Any:
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(k, str) and any(s in k.lower() for s in self.SENSITIVE_KEYS):
                     obj[k] = "***"
                else:
                    obj[k] = self._recursive_redact(v)
            return obj
        elif isinstance(obj, list):
            return [self._recursive_redact(item) for item in obj]
        else:
            return obj

    def check_env_vars(self, var_names: List[str]) -> Dict[str, bool]:
        """
        Check presence of environment variables.
        Returns map of {VAR_NAME: boolean}
        """
        return {var: var in os.environ for var in var_names}
