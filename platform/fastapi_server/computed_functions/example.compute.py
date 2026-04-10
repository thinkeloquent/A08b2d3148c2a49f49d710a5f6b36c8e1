"""
Example compute function - auto-loaded by context resolver.

This file demonstrates the structure required for auto-loaded compute functions.

Required exports:
    - register: callable - The compute function that receives context and returns a value

Optional exports:
    - NAME: str - Custom name to register under (defaults to filename without .compute.py)
    - SCOPE: ComputeScope - Scope for the function (STARTUP or REQUEST, defaults to STARTUP)
"""

# Import ComputeScope if you need a non-default scope
# from runtime_template_resolver import ComputeScope

# Optional: Custom name (defaults to "example" based on filename)
NAME = "example_auto_loaded"

# Optional: Scope (defaults to ComputeScope.STARTUP)
# SCOPE = ComputeScope.REQUEST  # Uncomment to use REQUEST scope


def register(ctx):
    """
    Compute function that will be auto-registered.

    Args:
        ctx: dict - Context containing:
            - env: dict - Environment variables
            - config: dict - Application configuration
            - request: object - Request object (only available for REQUEST scope)

    Returns:
        The computed value to be used in template resolution.
    """
    return "example_value_from_auto_loaded_function"
