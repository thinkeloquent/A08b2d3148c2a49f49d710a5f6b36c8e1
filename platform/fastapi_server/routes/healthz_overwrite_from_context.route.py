from fastapi import FastAPI, Request, HTTPException


def mount(app: FastAPI):
    """
    Mount overwrite-from-context health check routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get("/healthz/admin/overwrite-from-context/status")
    async def overwrite_from_context_status(request: Request):
        """Return the initialization status of the overwrite-from-context resolver."""
        try:
            registry = getattr(request.app.state, "context_registry", None)
            if registry is None:
                raise HTTPException(
                    status_code=503,
                    detail="Context registry not configured (app_yaml_overwrites may not be installed)"
                )
            return {
                "initialized": True,
                "registered_functions": registry.list(),
            }
        except HTTPException:
            raise
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }

    @app.get("/healthz/admin/overwrite-from-context/json")
    async def overwrite_from_context_json(request: Request):
        """Return the full configuration as JSON for debugging."""
        try:
            registry = getattr(request.app.state, "context_registry", None)
            sdk = getattr(request.app.state, "sdk", None)
            # ConfigSDK has get_resolver(), AppYamlConfigSDK does not
            resolver = sdk.get_resolver() if sdk and hasattr(sdk, 'get_resolver') else None
            raw_config = getattr(request.app.state, "context_raw_config", None)
            resolved_config = getattr(request.app.state, "resolved_config", None)

            if registry is None:
                raise HTTPException(
                    status_code=503,
                    detail="Context registry not configured (app_yaml_overwrites may not be installed)"
                )

            function_names = registry.list()
            function_scopes = {}
            for name in function_names:
                scope = registry.get_scope(name)
                function_scopes[name] = scope.value if scope else None

            return {
                "initialized": True,
                "config": {
                    "registered_functions": function_names,
                    "function_scopes": function_scopes,
                    "raw_config": raw_config,
                    "resolved_config": resolved_config,
                },
            }
        except HTTPException:
            raise
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }

    @app.get("/healthz/admin/overwrite-from-context/keys")
    async def overwrite_from_context_keys(request: Request):
        """Return only the top-level keys from the configuration (no values)."""
        try:
            registry = getattr(request.app.state, "context_registry", None)

            if registry is None:
                raise HTTPException(
                    status_code=503,
                    detail="Context registry not configured (app_yaml_overwrites may not be installed)"
                )

            return {
                "initialized": True,
                "registered_functions": registry.list(),
            }
        except HTTPException:
            raise
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }

    @app.get("/healthz/admin/overwrite-from-context/overwrite")
    async def overwrite_from_context_overwrite(request: Request):
        """Return the config with REQUEST-scoped functions resolved and overwrites applied."""
        try:
            registry = getattr(request.app.state, "context_registry", None)
            sdk = getattr(request.app.state, "sdk", None)
            # ConfigSDK has get_resolver(), AppYamlConfigSDK does not
            resolver = sdk.get_resolver() if sdk and hasattr(sdk, 'get_resolver') else None
            raw_config = getattr(request.app.state, "context_raw_config", None)

            if registry is None:
                raise HTTPException(
                    status_code=503,
                    detail="Context registry not configured (app_yaml_overwrites may not be installed)"
                )
            if resolver is None:
                raise HTTPException(
                    status_code=503,
                    detail="Template resolver not available (sdk missing get_resolver method)"
                )

            # Import ComputeScope for REQUEST resolution
            try:
                from runtime_template_resolver import ComputeScope
            except ImportError:
                return {
                    "initialized": False,
                    "error": "runtime_template_resolver not installed",
                }

            # Import overwrite merger from app_yaml_overwrites
            apply_overwrites_from_context = None
            AppliedMergerOptions = None
            try:
                from app_yaml_overwrites import (
                    apply_overwrites_from_context,
                    AppliedMergerOptions
                )
            except ImportError:
                pass  # Fallback to simple resolution

            import os

            # Get app config from app.state.config (AppYamlConfig instance)
            server_cfg = getattr(request.app.state, "config", None)
            app_cfg_dict = {}
            if server_cfg:
                if hasattr(server_cfg, "get_all"):
                    app_cfg_dict = server_cfg.get_all()
                elif hasattr(server_cfg, "to_dict"):
                    app_cfg_dict = server_cfg.to_dict()
            app_cfg_dict = app_cfg_dict or raw_config or {}

            # Build REQUEST context - expose app at top level for {{app.name}} etc.
            request_context = {
                "env": dict(os.environ),
                "config": raw_config,
                "app": app_cfg_dict.get("app", {}) if app_cfg_dict else {},
                "state": getattr(request.state, "__dict__", {}) if hasattr(request, "state") else {},
                "request": {
                    "headers": dict(request.headers),
                    "query": dict(request.query_params),
                    "params": dict(request.path_params),
                },
            }

            # Apply overwrites with template resolution if available
            overwrite_applied = False
            if apply_overwrites_from_context and AppliedMergerOptions:
                options = AppliedMergerOptions(
                    resolver=resolver,
                    remove_overwrite_key=False,  # Keep for debugging visibility
                    scope=ComputeScope.REQUEST
                )
                final_config = await apply_overwrites_from_context(
                    raw_config,
                    request_context,
                    options
                )
                overwrite_applied = True
            else:
                # Fallback: just resolve templates without applying overwrites
                final_config = await resolver.resolve_object(
                    raw_config,
                    context=request_context,
                    scope=ComputeScope.REQUEST
                )

            return {
                "initialized": True,
                "overwrite_resolved": final_config,
                "overwrite_from_context_applied": overwrite_applied,
            }
        except HTTPException:
            raise
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }
