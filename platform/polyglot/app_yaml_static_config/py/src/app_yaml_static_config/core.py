from typing import Dict, Any, Optional, List
import copy
import yaml
from pathlib import Path
from .types import InitOptions, ILogger
from .logger import create
from .validators import ImmutabilityError


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge two dicts. Override values take precedence. Arrays are replaced."""
    result = copy.deepcopy(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result

class AppYamlConfig:
    _instance: Optional['AppYamlConfig'] = None

    def __init__(self, options: InitOptions):
        if AppYamlConfig._instance is not None:
             raise Exception("This class is a singleton!")
        self._config: Dict[str, Any] = {}
        self._original_configs: Dict[str, Dict[str, Any]] = {}
        self._initial_merged_config: Optional[Dict[str, Any]] = None
        self._logger: ILogger = options.logger or create("app_yaml_static_config", "core.py")
        self._load_config(options)
        AppYamlConfig._instance = self

    @classmethod
    def _reset_for_testing(cls) -> None:
        cls._instance = None

    @classmethod
    def initialize(cls, options: InitOptions) -> 'AppYamlConfig':
        if cls._instance is None:
            cls(options)
        return cls._instance

    @classmethod
    def get_instance(cls) -> 'AppYamlConfig':
        if cls._instance is None:
            raise Exception("AppYamlConfig not initialized")
        return cls._instance

    def _load_config(self, options: InitOptions) -> None:
        self._logger.info("Initializing configuration", options.files)
        merged_config = {}
        
        for file_path in options.files:
            self._logger.debug(f"Loading config file: {file_path}")
            try:
                with open(file_path, 'r') as f:
                    content = yaml.safe_load(f) or {}
                    self._original_configs[file_path] = copy.deepcopy(content)
                    merged_config = _deep_merge(merged_config, content)
            except Exception as e:
                self._logger.error(f"Failed to load user config: {file_path}", e)
                raise e
        
        self._config = merged_config
        self._merge_global_into_providers()
        self._initial_merged_config = copy.deepcopy(merged_config)
        self._logger.info("Configuration initialized successfully")

    def _merge_global_into_providers(self) -> None:
        """Merge global config into each provider's config.

        Global values serve as defaults that can be overridden by provider-specific values.
        """
        global_config = self._config.get("global")
        if not global_config or not isinstance(global_config, dict):
            return

        providers = self._config.get("providers")
        if not providers or not isinstance(providers, dict):
            return

        for provider_name, provider_config in providers.items():
            if isinstance(provider_config, dict):
                self._config["providers"][provider_name] = _deep_merge(global_config, provider_config)

        self._logger.info("Merged global config into %d providers", len(providers))

    def get(self, key: str, default: Any = None) -> Any:
        value = self._config.get(key, default)
        return copy.deepcopy(value) if isinstance(value, (dict, list)) else value

    def get_nested(self, *keys: str, default: Any = None) -> Any:
        current = self._config
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return copy.deepcopy(current) if isinstance(current, (dict, list)) else current

    def get_all(self) -> Dict[str, Any]:
        return copy.deepcopy(self._config)

    def get_global_app_config(self) -> Dict[str, Any]:
        """
        Get the global app configuration from the 'global' key.

        Returns a deep copy of the global configuration object that contains
        shared settings like client timeouts, display preferences, and network settings.

        Returns:
            Dict containing global configuration, or empty dict if not present.
        """
        return copy.deepcopy(self._config.get("global", {}))

    def get_original(self, file: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if file:
            original = self._original_configs.get(file)
            return copy.deepcopy(original) if original is not None else None
        return None

    def get_original_all(self) -> Dict[str, Dict[str, Any]]:
        return copy.deepcopy(self._original_configs)

    def restore(self) -> None:
        # Simple environment check - in real app might check actual env var
        # For now, allow restoration
        if self._initial_merged_config is not None:
             self._config = copy.deepcopy(self._initial_merged_config)

    # Immutability Stubs
    def set(self, key: str, value: Any) -> None:
        raise ImmutabilityError("Configuration is immutable")

    def update(self, updates: Dict[str, Any]) -> None:
        raise ImmutabilityError("Configuration is immutable")

    def reset(self) -> None:
         raise ImmutabilityError("Configuration is immutable")

    def clear(self) -> None:
        raise ImmutabilityError("Configuration is immutable")

