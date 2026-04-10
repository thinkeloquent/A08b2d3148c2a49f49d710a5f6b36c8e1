import os
from fastapi import FastAPI, Request, HTTPException


def mount(app: FastAPI):
    """
    Mount async_example route that invokes the async_example compute function at request time.
    """

    @app.get("/async-example")
    async def async_example(request: Request):
        """Invoke async_example compute function at request time."""
        registry = getattr(request.app.state, "context_registry", None)
        if registry is None:
            raise HTTPException(
                status_code=503,
                detail="Context registry not initialized"
            )

        if not registry.has("async_example"):
            raise HTTPException(
                status_code=404,
                detail="Compute function 'async_example' not registered"
            )

        # Build request context
        raw_config = getattr(request.app.state, "context_raw_config", {})
        context = {
            "env": dict(os.environ),
            "config": raw_config,
            "app": raw_config.get("app", {}),
            "request": {
                "headers": dict(request.headers),
                "query": dict(request.query_params),
                "params": dict(request.path_params),
            },
        }

        result = await registry.resolve("async_example", context)

        return {
            "computed_at": "request",
            "function": "async_example",
            "result": result,
        }
