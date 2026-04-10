import asyncio
import os
from pathlib import Path

from platform_core_fastapi.bootstrap import setup
from platform_core_fastapi.config import PlatformConfig
from .print_routes import print_routes

# Determine paths relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent

config = PlatformConfig(
    title="FastAPI Integrated Server",
    port=int(os.getenv("PORT", "52000")),
    paths={
        # User-space paths — merged with platform-core defaults
        "lifecycles": str(BASE_DIR / "config" / "lifecycle"),
        "routes": str(BASE_DIR / "routes"),
        "apps": str(BASE_DIR.parent / "fastapi_apps"),
    },
)

# Override initial_state after construction
config.initial_state = {
    "build_info": {
        "build_id": os.getenv("BUILD_ID", ""),
        "build_version": os.getenv("BUILD_VERSION", ""),
        "app_env": os.getenv("APP_ENV", ""),
        "id": f"{os.getenv('BUILD_ID', '')} {os.getenv('BUILD_VERSION', '')} {os.getenv('APP_ENV', '')}",
    }
}

app = setup(config)

print_routes(app)

if __name__ == "__main__":
    import uvicorn

    uvicorn_config = uvicorn.Config(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )
    server = uvicorn.Server(uvicorn_config)
    asyncio.run(server.serve())
