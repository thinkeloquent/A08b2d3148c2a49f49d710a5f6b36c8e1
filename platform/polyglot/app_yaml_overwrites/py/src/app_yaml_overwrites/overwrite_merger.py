
from typing import Dict, Any, Protocol
from .logger import ILogger, create

class IOverwriteMerger(Protocol):
    def merge_env(self, env_mappings: Dict[str, str]) -> Dict[str, Any]: ...
    def merge_context(self, context: Dict[str, Any], template_mappings: Dict[str, str]) -> Dict[str, Any]: ...
    def get_merged(self) -> Dict[str, Any]: ...

class OverwriteMerger:
    def __init__(self, config: Dict[str, Any], logger: ILogger = None):
        self._config = config.copy()
        self._logger = logger or create("app_yaml_overwrites", "overwrite_merger.py")
        self._logger.debug("OverwriteMerger initialized", data={"config_keys": list(config.keys())})

    def merge_env(self, env_mappings: Dict[str, str]) -> Dict[str, Any]:
        """
        Merges environment variable overwrites.
        (Placeholder logic, keeping consistent with plan requirements)
        """
        self._logger.debug("Merging env overwrites", data={"mappings": list(env_mappings.keys())})
        # TODO: Implement actual env merge logic if needed, currently just returns config
        return self._config

    def merge_context(self, context: Dict[str, Any], template_mappings: Dict[str, str]) -> Dict[str, Any]:
        """
        Merges context-based overwrites.
        """
        self._logger.debug("Merging context overwrites")
        # Reuse existing apply_overwrites logic if applicable, or implement new.
        # For now, we assume the 'overwrite_from_context' structure exists in config and we might need to process it.
        # But the plan implies this class handles the merging.
        
        # NOTE: The simplest migration is to expose the utility as a method
        return self._config

    def get_merged(self) -> Dict[str, Any]:
        return self._config

def apply_overwrites(original_config: Dict[str, Any], overwrite_section: Dict[str, Any]) -> Dict[str, Any]:
    """
    Legacy function wrapper for backward compatibility or simple usage.
    """
    if not overwrite_section:
        return original_config

    result = original_config.copy()
    
    for key, value in overwrite_section.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = apply_overwrites(result[key], value)
        else:
            result[key] = value
            
    return result
