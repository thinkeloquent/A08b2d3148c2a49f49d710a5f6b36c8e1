#!/usr/bin/env python3
"""
=============================================================================
Static App Loader - Basic Usage Examples (Python/FastAPI)
=============================================================================

This file demonstrates core features of the static-app-loader package:
- Basic app registration
- SDK builder pattern
- Multi-app registration
- Path rewriting
- Template engine configuration

Run: python basic_usage.py
"""

import tempfile
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from static_app_loader import (
    MultiAppOptions,
    PathRewriteOptions,
    StaticLoaderOptions,
    create_multi_app_loader,
    create_static_app_loader,
    logger,
    register_multiple_apps,
    register_static_app,
    reset_registered_prefixes,
    rewrite_html_paths,
    validate_config,
)


def create_demo_files(root: Path) -> None:
    """Create demo static files for testing."""
    root.mkdir(parents=True, exist_ok=True)

    # Create index.html
    (root / "index.html").write_text(
        """<!DOCTYPE html>
<html>
<head>
    <title>Demo App</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <h1>Demo App</h1>
    <script src="/assets/main.js"></script>
</body>
</html>"""
    )

    # Create assets directory
    assets = root / "assets"
    assets.mkdir(exist_ok=True)
    (assets / "style.css").write_text("body { margin: 0; }")
    (assets / "main.js").write_text("console.log('Hello');")


# =============================================================================
# Example 1: Basic App Registration
# =============================================================================
def example1_basic_registration() -> None:
    """
    Demonstrates the most basic way to register a static app.
    Uses FastAPI's standard app pattern directly.
    """
    print("\n=== Example 1: Basic App Registration ===\n")

    reset_registered_prefixes()

    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        create_demo_files(root)

        app = FastAPI()

        # Register the static app
        options = StaticLoaderOptions(
            app_name="dashboard",
            root_path=str(root),
            spa_mode=True,
            url_prefix="/assets",
        )
        register_static_app(app, options)

        # Test the routes
        client = TestClient(app)

        root_response = client.get("/dashboard")
        print(f"GET /dashboard -> Status: {root_response.status_code}")
        print(f'Body contains "Demo App": {"Demo App" in root_response.text}')

        asset_response = client.get("/dashboard/assets/style.css")
        print(f"GET /dashboard/assets/style.css -> Status: {asset_response.status_code}")

        spa_response = client.get("/dashboard/users/123/profile")
        print(f"GET /dashboard/users/123/profile (SPA) -> Status: {spa_response.status_code}")

    print("✓ Basic registration example completed\n")


# =============================================================================
# Example 2: SDK Builder Pattern
# =============================================================================
def example2_sdk_builder() -> None:
    """
    Demonstrates using the SDK builder for type-safe configuration.
    Provides method chaining for fluent API usage.
    """
    print("\n=== Example 2: SDK Builder Pattern ===\n")

    reset_registered_prefixes()

    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        create_demo_files(root)

        app = FastAPI()

        # Create configuration using builder pattern
        config = (
            create_static_app_loader()
            .app_name("admin")
            .root_path(str(root))
            .spa_mode(True)
            .url_prefix("/static")
            .max_age(3600)
            .default_context(
                {
                    "app_version": "1.0.0",
                    "environment": "development",
                }
            )
            .build()
        )

        print(
            "Built config:",
            {
                "app_name": config.app_name,
                "spa_mode": config.spa_mode,
                "max_age": config.max_age,
                "has_default_context": len(config.default_context) > 0,
            },
        )

        register_static_app(app, config)

        # Verify initial state injection
        client = TestClient(app)
        response = client.get("/admin")
        print(f'INITIAL_STATE injected: {"INITIAL_STATE" in response.text}')

    print("✓ SDK builder example completed\n")


# =============================================================================
# Example 3: Multi-App Registration
# =============================================================================
def example3_multi_app_registration() -> None:
    """
    Demonstrates registering multiple apps in a single call.
    Shows collision detection and handling strategies.
    """
    print("\n=== Example 3: Multi-App Registration ===\n")

    reset_registered_prefixes()

    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        create_demo_files(root)

        app = FastAPI()

        # Register multiple apps using the multi-app options
        options = MultiAppOptions(
            apps=[
                StaticLoaderOptions(
                    app_name="portal", root_path=str(root), spa_mode=True
                ),
                StaticLoaderOptions(
                    app_name="docs", root_path=str(root), spa_mode=True
                ),
                StaticLoaderOptions(
                    app_name="tools", root_path=str(root), spa_mode=False
                ),
            ],
            collision_strategy="warn",
        )

        results = register_multiple_apps(app, options)

        print("Registration results:")
        for r in results:
            status = "✓" if r.success else "✗"
            error = r.error or ""
            print(f"  {r.app_name}: {status} {error}")

        # Test each app
        client = TestClient(app)
        for result in results:
            if result.success:
                response = client.get(f"/{result.app_name}")
                print(f"GET /{result.app_name} -> Status: {response.status_code}")

    print("✓ Multi-app registration example completed\n")


# =============================================================================
# Example 4: Configuration Validation
# =============================================================================
def example4_config_validation() -> None:
    """
    Demonstrates validating configuration before registration.
    Useful for CLI tools and pre-deployment validation.
    """
    print("\n=== Example 4: Configuration Validation ===\n")

    # Valid configuration
    valid_result = validate_config(
        {
            "app_name": "myapp",
            "root_path": "/var/www/myapp/dist",
            "spa_mode": True,
        }
    )
    print(f'Valid config result: {"✓ Valid" if valid_result["success"] else "✗ Invalid"}')

    # Invalid configuration
    invalid_result = validate_config(
        {
            "app_name": "",  # Empty - invalid
            "root_path": "/path",
        }
    )
    print(
        f'Invalid config result: {"✓ Valid" if invalid_result["success"] else "✗ Invalid"}'
    )
    if not invalid_result["success"]:
        print(f'Errors: {invalid_result.get("errors", [])}')

    print("✓ Config validation example completed\n")


# =============================================================================
# Example 5: Path Rewriting
# =============================================================================
def example5_path_rewriting() -> None:
    """
    Demonstrates the HTML path rewriting functionality.
    Shows how asset paths are transformed for route prefixes.
    """
    print("\n=== Example 5: Path Rewriting ===\n")

    html = """
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/assets/style.css">
    <link rel="stylesheet" href="./assets/main.css">
</head>
<body>
    <script src="/assets/app.js"></script>
    <script src="assets/vendor.js"></script>
    <img src="/assets/logo.png">
</body>
</html>"""

    options = PathRewriteOptions(app_name="myapp", url_prefix="/assets")
    rewritten = rewrite_html_paths(html, options)

    print("Original paths:")
    print("  /assets/style.css")
    print("  ./assets/main.css")
    print("  /assets/app.js")
    print("  assets/vendor.js")

    print("\nRewritten paths:")
    print("  /myapp/assets/style.css")
    print("  /myapp/assets/main.css")
    print("  /myapp/assets/app.js")
    print("  /myapp/assets/vendor.js")

    print(
        f"\nPath /assets/style.css rewritten: {'/myapp/assets/style.css' in rewritten}"
    )

    print("✓ Path rewriting example completed\n")


# =============================================================================
# Example 6: Custom Logger
# =============================================================================
def example6_custom_logger() -> None:
    """
    Demonstrates injecting a custom logger.
    Useful for integrating with existing logging infrastructure.
    """
    print("\n=== Example 6: Custom Logger ===\n")

    reset_registered_prefixes()

    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        create_demo_files(root)

        app = FastAPI()

        # Create a custom logger using the logger factory
        log = logger.create("my-app", "example.py")

        # Use the logger directly
        log.info("Starting example with custom logger")
        log.debug("Debug information", {"detail": "value"})

        # Register with custom logger
        options = StaticLoaderOptions(
            app_name="logged",
            root_path=str(root),
            logger=log,
        )
        register_static_app(app, options)

    print("✓ Custom logger example completed\n")


# =============================================================================
# Main Runner
# =============================================================================
def main() -> None:
    """Run all examples."""
    print("=" * 60)
    print("Static App Loader - Basic Usage Examples")
    print("=" * 60)

    try:
        example1_basic_registration()
        example2_sdk_builder()
        example3_multi_app_registration()
        example4_config_validation()
        example5_path_rewriting()
        example6_custom_logger()

        print("=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
    except Exception as e:
        print(f"Example failed: {e}")
        raise


if __name__ == "__main__":
    main()
