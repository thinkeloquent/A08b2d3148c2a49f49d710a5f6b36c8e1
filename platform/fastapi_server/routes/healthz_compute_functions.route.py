from fastapi import FastAPI, Request


def mount(app: FastAPI):
    """
    Mount compute functions health check routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get("/healthz/admin/compute-functions/list")
    async def compute_functions_list(request: Request):
        """Return list of all registered compute functions."""
        try:
            registry = getattr(request.app.state, "context_registry", None)
            if registry is None:
                return {
                    "initialized": False,
                    "error": "Context registry not initialized",
                }

            functions = registry.list()
            return {
                "initialized": True,
                "count": len(functions),
                "functions": functions,
            }
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }

    @app.get("/healthz/admin/compute-functions/details")
    async def compute_functions_details(request: Request):
        """Return detailed info about all registered compute functions."""
        try:
            registry = getattr(request.app.state, "context_registry", None)
            if registry is None:
                return {
                    "initialized": False,
                    "error": "Context registry not initialized",
                }

            functions = registry.list()
            details = []
            for name in functions:
                func_info = {"name": name}
                if hasattr(registry, "get_scope"):
                    try:
                        scope = registry.get_scope(name)
                        func_info["scope"] = str(scope) if scope else "unknown"
                    except Exception:
                        func_info["scope"] = "unknown"
                details.append(func_info)

            return {
                "initialized": True,
                "count": len(details),
                "functions": details,
            }
        except Exception as e:
            return {
                "initialized": False,
                "error": str(e),
            }
