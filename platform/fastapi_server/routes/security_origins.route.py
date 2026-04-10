from fastapi import FastAPI, HTTPException
from app_yaml_static_config import AppYamlConfig


def mount(app: FastAPI):
    """
    Mount security origins route to the FastAPI application.
    Exposes CORS origins loaded from security.yml
    """

    @app.get("/api/runtime-app-config/origins")
    async def get_origins():
        """Return all configured CORS origins."""
        try:
            instance = AppYamlConfig.get_instance()
            origins = instance.get_nested("cors", "origins", default=[])
            return {
                "success": True,
                "origins": origins,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
