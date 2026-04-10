from fastapi import FastAPI, HTTPException
from app_yaml_static_config import AppYamlConfig


def mount(app: FastAPI):
    """
    Mount endpoint configuration routes to the FastAPI application.
    Exposes endpoints loaded from endpoint.${APP_ENV}.yaml
    """

    @app.get("/api/runtime-app-config/endpoints")
    async def get_all_endpoints():
        """Return all configured endpoints."""
        try:
            instance = AppYamlConfig.get_instance()
            endpoints = instance.get("endpoints", {})
            return {
                "success": True,
                "endpoints": endpoints,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/runtime-app-config/endpoints/refresh")
    async def refresh_endpoint_config():
        """Re-reads endpoint YAML from disk."""
        try:
            sdk = getattr(app.state, "endpoint_config_sdk", None)
            if not sdk:
                raise HTTPException(status_code=503, detail="EndpointConfigSDK not initialized")
            sdk.refresh_config()
            return {"success": True, "keys": sdk.list_keys()}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/runtime-app-config/endpoints/by-name/{name}")
    async def get_endpoint_by_friendly_name(name: str):
        """Return an endpoint matching the given human-friendly name."""
        try:
            sdk = getattr(app.state, "endpoint_config_sdk", None)
            if not sdk:
                raise HTTPException(status_code=503, detail="EndpointConfigSDK not initialized")
            endpoint = sdk.get_by_name(name)
            if not endpoint:
                raise HTTPException(status_code=404, detail=f"No endpoint with name '{name}'")
            return {"success": True, "endpoint": endpoint.to_dict()}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/runtime-app-config/endpoints/by-tag/{tag}")
    async def get_endpoints_by_tag(tag: str):
        """Return all endpoints matching the given tag."""
        try:
            sdk = getattr(app.state, "endpoint_config_sdk", None)
            if not sdk:
                raise HTTPException(status_code=503, detail="EndpointConfigSDK not initialized")
            endpoints = sdk.get_by_tag(tag)
            return {"success": True, "tag": tag, "endpoints": [ep.to_dict() for ep in endpoints]}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/runtime-app-config/endpoints/{name}")
    async def get_endpoint_by_name(name: str):
        """Return a specific endpoint by name."""
        try:
            instance = AppYamlConfig.get_instance()
            endpoints = instance.get("endpoints", {})

            if name not in endpoints:
                raise HTTPException(
                    status_code=404,
                    detail=f"Endpoint '{name}' not found"
                )

            return {
                "success": True,
                "name": name,
                "endpoint": endpoints[name],
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/runtime-app-config/intent-mapping")
    async def get_intent_mapping():
        """Return the intent to endpoint mapping configuration."""
        try:
            instance = AppYamlConfig.get_instance()
            intent_mapping = instance.get("intent_mapping", {})
            return {
                "success": True,
                "intent_mapping": intent_mapping,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/runtime-app-config/resolve-intent/{intent}")
    async def resolve_intent(intent: str):
        """Resolve an intent to its configured endpoint."""
        try:
            instance = AppYamlConfig.get_instance()
            endpoints = instance.get("endpoints", {})
            intent_mapping = instance.get("intent_mapping", {})

            mappings = intent_mapping.get("mappings", {})
            default_intent = intent_mapping.get("default_intent")

            # Resolve intent to endpoint name
            endpoint_name = mappings.get(intent) or default_intent

            if not endpoint_name:
                raise HTTPException(
                    status_code=404,
                    detail=f"No mapping found for intent '{intent}' and no default configured"
                )

            endpoint = endpoints.get(endpoint_name)
            if not endpoint:
                raise HTTPException(
                    status_code=404,
                    detail=f"Endpoint '{endpoint_name}' mapped from intent '{intent}' not found"
                )

            return {
                "success": True,
                "intent": intent,
                "resolved_endpoint": endpoint_name,
                "endpoint": endpoint,
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
