#!/usr/bin/env python3
"""
Example: Loading YAML configuration using app_yaml_static_config
"""
import sys
from pathlib import Path

# Add polyglot package to path
polyglot_base = Path(__file__).parent.parent.parent / "polyglot"
sys.path.insert(0, str(polyglot_base / "app_yaml_static_config" / "py" / "src"))

from app_yaml_static_config import AppYamlConfig, InitOptions

# Configuration file paths
CONFIG_DIR = Path(__file__).parent.parent.parent / "common" / "config"
BASE_CONFIG = CONFIG_DIR / "base.yml"
SERVER_CONFIG = CONFIG_DIR / "server.dev.yaml"


def main():
    # Initialize AppYamlConfig with both config files
    # Files are merged in order (later files override earlier ones)
    config = AppYamlConfig.initialize(
        InitOptions(
            files=[str(BASE_CONFIG), str(SERVER_CONFIG)],
            config_dir=str(CONFIG_DIR)
        )
    )

    # Get the singleton instance
    instance = AppYamlConfig.get_instance()

    # Access configuration values
    print("=== Configuration Loaded ===")
    print(f"App Name: {instance.get('app', {}).get('name')}")
    print(f"App Version: {instance.get('app', {}).get('version')}")
    print(f"Server Port: {instance.get('server', {}).get('port')}")

    # Get nested values
    print(f"\nProviders: {list(instance.get('providers', {}).keys())}")
    print(f"Storages: {list(instance.get('storage', {}).keys())}")

    # Get global config
    global_config = instance.get_global_app_config()
    print(f"\nGlobal timeout (seconds): {global_config.get('client', {}).get('timeout_seconds')}")

    # Return config for use in step 2
    return instance


if __name__ == "__main__":
    main()
