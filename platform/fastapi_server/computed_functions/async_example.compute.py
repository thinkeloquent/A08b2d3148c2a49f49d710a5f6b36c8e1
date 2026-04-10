"""
Asynchronous compute function example.
"""

NAME = "async_example"


async def register(ctx):
    """Asynchronous function - can use await for I/O operations."""
    app_name = ctx.get("config", {}).get("app", {}).get("name", "unknown")
    return f"async_result_from_{app_name}"
