"""
Synchronous compute function example.
"""


def register(ctx):
    """Synchronous function - returns value directly."""
    app_name = ctx.get("config", {}).get("app", {}).get("name", "unknown")
    return f"sync_result_from_{app_name}"
