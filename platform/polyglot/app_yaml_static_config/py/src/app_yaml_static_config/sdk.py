from typing import Any, Dict, List, Optional
import copy
import glob
import os
from .core import AppYamlConfig
from .types import InitOptions

class AppYamlConfigSDK:
    def __init__(self, config: AppYamlConfig):
        self.config = config

    @classmethod
    def from_directory(cls, config_dir: str) -> 'AppYamlConfigSDK':
        yaml_files = glob.glob(os.path.join(config_dir, "*.yaml"))
        yml_files = glob.glob(os.path.join(config_dir, "*.yml"))
        files = yaml_files + yml_files
        AppYamlConfig.initialize(InitOptions(files=files, config_dir=config_dir))
        return cls(AppYamlConfig.get_instance())

    def get(self, key: str) -> Any:
        value = self.config.get(key)
        return copy.deepcopy(value)

    def get_nested(self, keys: List[str]) -> Any:
        value = self.config.get_nested(*keys)
        return copy.deepcopy(value)

    def get_all(self) -> Dict[str, Any]:
        return copy.deepcopy(self.config.get_all())

    def list_providers(self) -> List[str]:
        providers = self.config.get('providers', {})
        return list(providers.keys())

    def list_services(self) -> List[str]:
        services = self.config.get('services', {})
        return list(services.keys())

    def list_storages(self) -> List[str]:
        storage = self.config.get('storage', {})
        return list(storage.keys())
