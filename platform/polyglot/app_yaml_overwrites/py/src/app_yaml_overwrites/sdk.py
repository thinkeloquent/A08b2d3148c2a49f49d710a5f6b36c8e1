"""
ConfigSDK Module for app_yaml_overwrites package.
Provides unified configuration access with template resolution.
"""

import os
from typing import Optional, Dict, List, Any, Callable

from app_yaml_static_config import AppYamlConfig

from .logger import create, ILogger
from .context_builder import ContextBuilder, ContextExtender
from .overwrite_merger import apply_overwrites
from .overwrite_merger_applied import deep_merge_with_null_replace
from .options import ComputeScope, MissingStrategy, ResolverOptions
from .compute_registry import ComputeRegistry, create_registry
from .template_resolver import TemplateResolver, create_resolver

# Create module-level logger
logger = create("app_yaml_overwrites", "sdk.py")

# Type alias for compute functions
ComputeFunction = Callable[..., Any]

class ConfigSDK:
    """
    Main SDK for configuration access with template resolution.

    Features:
    - Singleton pattern with async initialization
    - Template resolution with {{...}} syntax
    - Compute function registry ({{fn:name}})
    - Context-based overwrites
    - Scope-aware resolution (STARTUP vs REQUEST)
    """

    _instance = None

    def __init__(self, options: Dict[str, Any] = None):
        options = options or {}
        self._logger: ILogger = create('config-sdk', 'sdk.py')
        self._logger.debug("ConfigSDK constructor called")

        self._context_extenders: List[ContextExtender] = options.get('context_extenders', [])
        self._raw_config: Dict[str, Any] = {}
        self._initialized = False

        # Initialize registry (use provided or create new)
        self._registry: ComputeRegistry = options.get('registry') or create_registry(self._logger)
        self._logger.debug("ComputeRegistry initialized")

        # Setup resolver options
        self._resolver_options = options.get('resolver_options') or ResolverOptions(
            logger=self._logger,
            max_depth=options.get('max_depth', 10),
            missing_strategy=options.get('missing_strategy', MissingStrategy.ERROR)
        )

        # Initialize template resolver
        self._resolver: TemplateResolver = create_resolver(self._registry, self._resolver_options)
        self._logger.debug("TemplateResolver initialized")

        # Allow direct config injection (Parity with Node.js)
        if options.get('config'):
            self._raw_config = options.get('config')
            self._initialized = True
            self._logger.debug("ConfigSDK locally initialized with injected config")

    @classmethod
    async def initialize(cls, options: Dict[str, Any] = None) -> 'ConfigSDK':
        """
        Async initialization of the ConfigSDK.
        """
        if cls._instance:
            return cls._instance
            
        sdk = cls(options)
        await sdk._bootstrap(options)
        cls._instance = sdk
        return sdk

    @classmethod
    def get_instance(cls) -> 'ConfigSDK':
        if not cls._instance:
            raise RuntimeError("ConfigSDK not initialized. Call initialize() first.")
        return cls._instance

    async def _bootstrap(self, options: Dict[str, Any]):
        """Bootstrap the SDK by loading static configuration."""
        self._logger.debug("Bootstrapping ConfigSDK...")

        # Load Static Config from AppYamlConfig
        instance = AppYamlConfig.get_instance()
        self._raw_config = instance.get_all()
        self._logger.debug("Raw config loaded", data={"keys": list(self._raw_config.keys())})

        self._initialized = True
        self._logger.info("ConfigSDK bootstrap complete")

    def get_raw(self) -> Dict[str, Any]:
        """Get the raw (unresolved) configuration."""
        return self._raw_config

    async def get_resolved(
        self,
        scope: ComputeScope,
        request: Any = None
    ) -> Dict[str, Any]:
        """
        Get fully resolved configuration with templates expanded.

        Args:
            scope: Resolution scope (STARTUP or REQUEST)
            request: Optional request object for context building

        Returns:
            Configuration dict with all templates resolved
        """
        if not self._initialized:
            raise RuntimeError("SDK not initialized")

        self._logger.debug("get_resolved called", data={"scope": scope.value})

        # Build context for resolution
        builder = ContextBuilder(self._logger)
        builder.with_config(self._raw_config)
        builder.with_app_config(self._raw_config.get("app", {}))
        builder.with_request(request)

        for ext in self._context_extenders:
            builder.add_extender(ext)

        context = await builder.build()
        self._logger.debug("Context built", data={"context_keys": list(context.keys())})

        # Resolve all templates in configuration
        resolved = await self._resolver.resolve_object(
            self._raw_config,
            context,
            scope
        )
        self._logger.debug("Templates resolved")

        # Recursively apply nested overwrite_from_context sections.
        # Templates inside overwrite_from_context are already resolved by
        # resolve_object above; this step merges those resolved values into
        # their parent nodes (replacing null placeholders).
        resolved = self._apply_nested_overwrites(resolved)

        return resolved

    @staticmethod
    def _apply_nested_overwrites(config: Any) -> Any:
        """
        Recursively walk the config tree and merge every
        overwrite_from_env and overwrite_from_context section into its parent node.

        This handles nested overwrites at any depth (e.g.
        providers.gemini_openai.overwrite_from_context) that the
        old top-level-only apply_overwrites() missed.
        """
        if not isinstance(config, dict):
            return config

        result = {}
        for key, value in config.items():
            if key in ("overwrite_from_context", "overwrite_from_env"):
                continue  # processed below
            elif isinstance(value, dict):
                result[key] = ConfigSDK._apply_nested_overwrites(value)
            elif isinstance(value, list):
                result[key] = [
                    ConfigSDK._apply_nested_overwrites(item)
                    if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                result[key] = value

        # Apply overwrite_from_env: values are env var names, look up from os.environ
        import os
        env_overwrite_section = config.get("overwrite_from_env")
        if env_overwrite_section and isinstance(env_overwrite_section, dict):
            resolved = {}
            for key, env_var_name in env_overwrite_section.items():
                if isinstance(env_var_name, str):
                    env_value = os.environ.get(env_var_name)
                    if env_value is not None:
                        resolved[key] = env_value
            result = deep_merge_with_null_replace(result, resolved)
            result["overwrite_from_env"] = env_overwrite_section

        # Apply overwrite_from_context: templates already resolved by resolve_object
        overwrite_section = config.get("overwrite_from_context")
        if overwrite_section and isinstance(overwrite_section, dict):
            result = deep_merge_with_null_replace(result, overwrite_section)
            result["overwrite_from_context"] = overwrite_section

        return result

    async def to_json(self, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Export configuration as JSON-serializable dict."""
        return self.get_raw()

    async def build_request_context(self, request: Any = None) -> Dict[str, Any]:
        """
        Build a resolution context for a request.

        Args:
            request: The request object

        Returns:
            Context dictionary
        """
        builder = ContextBuilder(self._logger)
        builder.with_config(self._raw_config)
        builder.with_app_config(self._raw_config.get("app", {}))
        builder.with_request(request)

        for ext in self._context_extenders:
            builder.add_extender(ext)

        return await builder.build()


    # SDK Query Interface
    def get_provider(self, name: str, default: Any = None) -> Any:
        """Get a provider configuration by name."""
        return self._raw_config.get("providers", {}).get(name, default)

    def get_service(self, name: str, default: Any = None) -> Any:
        """Get a service configuration by name."""
        return self._raw_config.get("services", {}).get(name, default)

    def get_storage(self, name: str, default: Any = None) -> Any:
        """Get a storage configuration by name."""
        return self._raw_config.get("storage", {}).get(name, default)

    def get(self, path: str, default: Any = None) -> Any:
        """
        Get a configuration value by dot-separated path.

        Args:
            path: Dot-separated path (e.g., "app.name")
            default: Default value if path not found

        Returns:
            Configuration value or default
        """
        keys = path.split('.')
        val = self._raw_config
        for key in keys:
            if isinstance(val, dict):
                val = val.get(key)
            else:
                return default
            if val is None:
                return default
        return val

    async def resolve_template(
        self,
        template: str,
        context: Optional[Dict[str, Any]] = None,
        scope: ComputeScope = ComputeScope.REQUEST
    ) -> Any:
        """
        Resolve a single template expression.

        Args:
            template: The template string to resolve
            context: Optional context for resolution
            scope: Resolution scope (defaults to REQUEST)

        Returns:
            Resolved value
        """
        self._logger.debug(f"Resolving template: {template}")
        resolve_context = context or self._raw_config
        return await self._resolver.resolve(template, resolve_context, scope)

    def register_compute(
        self,
        name: str,
        fn: ComputeFunction,
        scope: ComputeScope = ComputeScope.REQUEST
    ) -> None:
        """
        Register a compute function for use in templates.

        Args:
            name: Function name (used as {{fn:name}})
            fn: The function to register
            scope: STARTUP (cached) or REQUEST (per-call)
        """
        self._logger.debug(f"Registering compute function: {name} with scope: {scope.value}")
        self._registry.register(name, fn, scope)

    def unregister_compute(self, name: str) -> bool:
        """
        Unregister a compute function.

        Args:
            name: Function name to unregister

        Returns:
            True if function was unregistered
        """
        self._logger.debug(f"Unregistering compute function: {name}")
        return self._registry.unregister(name)

    def get_registry(self) -> ComputeRegistry:
        """Get the compute registry for direct access."""
        return self._registry

    def get_resolver(self) -> TemplateResolver:
        """Get the template resolver for direct access."""
        return self._resolver

    # Standalone Factories
    @classmethod
    async def from_files(
        cls,
        files: List[str],
        logger: Optional[ILogger] = None
    ) -> 'ConfigSDK':
        """
        Create ConfigSDK from specific configuration files.

        Args:
            files: List of YAML file paths
            logger: Optional custom logger

        Returns:
            Initialized ConfigSDK instance
        """
        instance = cls()
        # In production: AppYamlConfig.initialize(files=files)
        await instance._bootstrap({})
        return instance

    @classmethod
    async def from_directory(
        cls,
        dir_path: str,
        env: str = "dev",
        logger: Optional[ILogger] = None
    ) -> 'ConfigSDK':
        """
        Create ConfigSDK from a configuration directory.

        Args:
            dir_path: Path to configuration directory
            env: Environment name (dev, prod, etc.)
            logger: Optional custom logger

        Returns:
            Initialized ConfigSDK instance
        """
        instance = cls()
        # In production: AppYamlConfig.initialize(config_dir=dir_path, env=env)
        await instance._bootstrap({})
        return instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset the singleton instance (primarily for testing)."""
        cls._instance = None

def create_sdk(options: Dict[str, Any] = None) -> ConfigSDK:
    """
    Factory function to create a new ConfigSDK.
    
    Args:
        options: Configuration options for ConfigSDK
        
    Returns:
        New ConfigSDK instance
    """
    return ConfigSDK(options)
