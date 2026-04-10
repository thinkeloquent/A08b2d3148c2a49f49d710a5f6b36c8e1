"""
Basic Usage Examples — Confluence API SDK (Python)

Self-contained demonstration of all core SDK features.
Each exampleX_name() function is independent and shows one concept.

Usage:
    python basic_usage.py

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)
"""

import asyncio
import json
import os
import sys
import tempfile

from confluence_api import (
    # Errors
    ConfluenceAPIError,
    ConfluenceAuthenticationError,
    # Core
    ConfluenceClient,
    ConfluenceNotFoundError,
    ConfluencePermissionError,
    ConfluenceValidationError,
    create_error_from_response,
)
from confluence_api.config import (
    get_config,
    load_config_from_env,
)
from confluence_api.exceptions import (
    ConfluenceConfigurationError,
    ConfluenceConflictError,
    ConfluenceNetworkError,
    ConfluenceRateLimitError,
    ConfluenceServerError,
    ConfluenceTimeoutError,
    SDKError,
)
from confluence_api.logger import create_logger, null_logger
from confluence_api.models import (
    Content,
    ContentCreate,
    ContentUpdate,
    Label,
    SearchResult,
    Space,
    SpaceCreate,
    Version,
)
from confluence_api.pagination import build_expand, paginate_cursor, paginate_offset
from confluence_api.sdk.client import ConfluenceSDKClient
from confluence_api.services.admin_service import AdminService
from confluence_api.services.attachment_service import AttachmentService
from confluence_api.services.color_scheme_service import ColorSchemeService
from confluence_api.services.content_service import ContentService
from confluence_api.services.group_service import GroupService
from confluence_api.services.label_service import LabelService
from confluence_api.services.search_service import SearchService
from confluence_api.services.space_permission_service import SpacePermissionService
from confluence_api.services.space_service import SpaceService
from confluence_api.services.system_service import SystemService
from confluence_api.services.user_service import UserService
from confluence_api.services.webhook_service import WebhookService
from confluence_api.utils.cql_builder import CQLBuilder, cql

# Demo credentials — NOT real. HTTP calls will fail gracefully.
DEMO_BASE_URL = "https://confluence-demo.example.com"
DEMO_USERNAME = "demo_admin"
DEMO_TOKEN = "demo_api_token_for_examples_only"


def _separator(title: str) -> None:
    """Print a visual separator between examples."""
    print(f"\n{'=' * 72}")
    print(f"  {title}")
    print(f"{'=' * 72}\n")


# =============================================================================
# Example 1: Configuration Loading
# =============================================================================
def example1_configuration_loading() -> None:
    """
    Demonstrate how the SDK loads configuration from environment variables
    and the get_config() priority chain.
    """
    _separator("Example 1: Configuration Loading")

    # --- Settings from environment ---
    os.environ["CONFLUENCE_BASE_URL"] = DEMO_BASE_URL
    os.environ["CONFLUENCE_USERNAME"] = DEMO_USERNAME
    os.environ["CONFLUENCE_API_TOKEN"] = DEMO_TOKEN
    os.environ["LOG_LEVEL"] = "DEBUG"

    env_config = load_config_from_env()
    print("load_config_from_env():")
    print(f"  base_url:  {env_config['base_url']}")
    print(f"  username:  {env_config['username']}")
    print(f"  api_token: {env_config['api_token'][:8]}...")
    print()

    # --- get_config priority (server state > env) ---
    resolved = get_config()
    print("get_config() resolved:")
    print(f"  base_url:  {resolved['base_url']}")
    print(f"  username:  {resolved['username']}")
    print()

    # --- get_config with explicit app_state (simulated) ---
    print("get_config(app_state=None) falls back to env vars.")
    print()

    # Cleanup
    del os.environ["CONFLUENCE_BASE_URL"]
    del os.environ["CONFLUENCE_USERNAME"]
    del os.environ["CONFLUENCE_API_TOKEN"]
    del os.environ["LOG_LEVEL"]

    print("[OK] Configuration loading complete.")


# =============================================================================
# Example 2: Client Initialization
# =============================================================================
def example2_client_initialization() -> None:
    """
    Create a ConfluenceClient with explicit credentials.
    Shows the context manager pattern for automatic cleanup and
    constructor parameters including retry configuration.
    """
    _separator("Example 2: Client Initialization")

    with ConfluenceClient(
        base_url=DEMO_BASE_URL,
        username=DEMO_USERNAME,
        api_token=DEMO_TOKEN,
        timeout=60.0,
        rate_limit_auto_wait=True,
        max_retries=3,
    ) as client:
        print("ConfluenceClient created successfully:")
        print(f"  base_url: {client.base_url}")
        print(f"  username: {client.username}")
        print(f"  timeout:  {client.timeout}s")
        print()

        # --- Attempt a real API call (will fail with demo credentials) ---
        print("Attempting client.get('content'):")
        try:
            result = client.get("content")
            print(f"  Result: {result}")
        except ConfluenceAuthenticationError as err:
            print(f"  Expected error (demo token): {err}")
        except ConfluenceAPIError as err:
            print(f"  Expected error (demo setup): {type(err).__name__}: {err}")
        except Exception as err:
            print(f"  Connection error (expected in demo): {type(err).__name__}: {err}")

    # --- Client with custom logger ---
    print("\nClient with null_logger (no log output):")
    with ConfluenceClient(
        base_url=DEMO_BASE_URL,
        username=DEMO_USERNAME,
        api_token=DEMO_TOKEN,
        logger=null_logger,
    ) as client:
        print(f"  Created with silent logger: {client.base_url}")

    # --- Constructor validation ---
    print("\nConstructor validation:")
    try:
        ConfluenceClient(base_url="", username="admin", api_token="token")
    except ConfluenceConfigurationError as err:
        print(f"  Missing base_url: {err}")
    try:
        ConfluenceClient(base_url="https://x.com", username="", api_token="token")
    except ConfluenceConfigurationError as err:
        print(f"  Missing username: {err}")

    print("\n[OK] Client initialization complete.")


# =============================================================================
# Example 3: Error Handling
# =============================================================================
def example3_error_handling() -> None:
    """
    Demonstrate the typed error hierarchy. Each error class is instantiated
    directly to show its properties and the to_dict() format.
    """
    _separator("Example 3: Error Handling")

    errors = [
        ConfluenceValidationError("Invalid page ID format"),
        ConfluenceAuthenticationError("Invalid API token"),
        ConfluencePermissionError("No access to space ADMIN"),
        ConfluenceNotFoundError("Page 12345 not found"),
        ConfluenceConflictError("Version conflict on page update"),
        ConfluenceRateLimitError("Too many requests", retry_after=30.0),
        ConfluenceServerError("Confluence instance unavailable", status_code=503),
        ConfluenceNetworkError("Could not reach Confluence instance"),
        ConfluenceTimeoutError("Request timed out after 30s"),
        ConfluenceConfigurationError("Missing CONFLUENCE_BASE_URL"),
        SDKError("SDK proxy server not running"),
    ]

    for err in errors:
        print(f"  {type(err).__name__} (status={err.status_code}):")
        print(f"    message: {err.message}")
        print(f"    to_dict: {json.dumps(err.to_dict(), indent=6, default=str)}")
        print()

    # --- Hierarchy check ---
    print("All errors inherit from ConfluenceAPIError:")
    for err in errors:
        print(f"  isinstance({type(err).__name__}, ConfluenceAPIError) = {isinstance(err, ConfluenceAPIError)}")
    print()

    # --- create_error_from_response ---
    print("create_error_from_response examples:")
    for status, body in [
        (400, {"message": "Invalid field"}),
        (401, {"message": "Bad credentials"}),
        (404, {"message": "Not found"}),
        (409, {"message": "Version conflict"}),
        (429, {"message": "Rate limited"}),
        (500, {"message": "Internal error"}),
        (418, {"message": "I'm a teapot"}),
        (400, None),
    ]:
        err = create_error_from_response(status, body)
        print(f"  HTTP {status}: {type(err).__name__} — {err.message}")

    # --- Rate limit error retry_after ---
    print("\nRate limit error with retry_after:")
    rate_err = ConfluenceRateLimitError("Too many requests", retry_after=60.0)
    print(f"  retry_after: {rate_err.retry_after}s")
    print(f"  status_code: {rate_err.status_code}")

    # --- Error with response_data context ---
    print("\nError with response_data:")
    err_with_data = ConfluenceNotFoundError("Page not found")
    err_with_data.response_data = {"message": "Page not found", "statusCode": 404}
    err_with_data.url = "/rest/api/content/99999"
    err_with_data.method = "GET"
    print(f"  url: {err_with_data.url}")
    print(f"  method: {err_with_data.method}")
    print(f"  response_data: {err_with_data.response_data}")
    print(f"  to_dict: {json.dumps(err_with_data.to_dict(), indent=4, default=str)}")

    # --- Try/except pattern ---
    print("\nTry/except pattern with ConfluenceClient:")
    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            client.get("content/999999")
    except ConfluenceNotFoundError as err:
        print(f"  Caught ConfluenceNotFoundError: {err}")
    except ConfluenceAuthenticationError as err:
        print(f"  Caught ConfluenceAuthenticationError: {err}")
    except ConfluenceRateLimitError as err:
        print(f"  Caught ConfluenceRateLimitError: retry after {err.retry_after}s")
    except ConfluenceAPIError as err:
        print(f"  Caught ConfluenceAPIError ({type(err).__name__}): {err}")
    except Exception as err:
        print(f"  Caught unexpected error: {type(err).__name__}: {err}")

    print("\n[OK] Error handling examples complete.")


# =============================================================================
# Example 4: CQL Builder
# =============================================================================
def example4_cql_builder() -> None:
    """
    Demonstrate the CQL (Confluence Query Language) builder for constructing
    search queries. This is unique to Confluence and used with the search service.
    """
    _separator("Example 4: CQL Builder")

    # --- Simple query ---
    query1 = cql("type").equals("page").build()
    print(f"  Simple:      {query1}")

    # --- Multi-condition query ---
    query2 = (
        cql("type").equals("page")
        .and_()
        .field("space").equals("DEV")
        .build()
    )
    print(f"  Two fields:  {query2}")

    # --- Full-text search ---
    query3 = (
        cql("type").equals("page")
        .and_()
        .field("space").equals("DEV")
        .and_()
        .field("title").contains("architecture")
        .order_by("lastModified", "desc")
        .build()
    )
    print(f"  Full-text:   {query3}")

    # --- IN list ---
    query4 = (
        cql("space").in_list(["DEV", "OPS", "QA"])
        .and_()
        .field("type").equals("page")
        .build()
    )
    print(f"  IN list:     {query4}")

    # --- NOT contains ---
    query5 = (
        cql("type").equals("page")
        .and_()
        .field("title").not_contains("draft")
        .build()
    )
    print(f"  NOT ~:       {query5}")

    # --- IS NOT NULL ---
    query6 = (
        cql("type").equals("page")
        .and_()
        .field("label").is_not_null()
        .build()
    )
    print(f"  IS NOT NULL: {query6}")

    # --- OR operator ---
    query7 = (
        cql("type").equals("page")
        .or_()
        .field("type").equals("blogpost")
        .build()
    )
    print(f"  OR:          {query7}")

    # --- NOT IN list ---
    query8 = (
        cql("space").not_in_list(["ARCHIVE", "TRASH"])
        .and_()
        .field("type").equals("page")
        .build()
    )
    print(f"  NOT IN:      {query8}")

    # --- IS NULL ---
    query9 = (
        cql("type").equals("page")
        .and_()
        .field("label").is_null()
        .build()
    )
    print(f"  IS NULL:     {query9}")

    # --- NOT equals ---
    query10 = (
        cql("type").equals("page")
        .and_()
        .field("space").not_equals("ARCHIVE")
        .build()
    )
    print(f"  NOT =:       {query10}")

    # --- Using CQLBuilder class directly ---
    builder = CQLBuilder("space")
    query11 = (
        builder
        .equals("DEV")
        .and_()
        .field("ancestor").equals("12345")
        .order_by("created", "asc")
        .build()
    )
    print(f"  Builder:     {query11}")

    # --- Special character escaping ---
    query12 = (
        cql("title").contains('He said "hello"')
        .build()
    )
    print(f"  Escaping:    {query12}")

    print("\n[OK] CQL builder examples complete.")


# =============================================================================
# Example 5: Structured Logger
# =============================================================================
def example5_structured_logger() -> None:
    """
    Demonstrate the structured logger factory with context dicts,
    log levels, and automatic redaction of sensitive keys.
    """
    _separator("Example 5: Structured Logger")

    # --- Create a scoped logger ---
    log = create_logger("my-app", __file__)
    print("Logger created with create_logger('my-app', __file__)")
    print("Output goes to stderr as JSON.")
    print()

    # --- Log at different levels ---
    print("Logging at different levels (visible if LOG_LEVEL allows):")
    log.debug("debug message", {"operation": "test"})
    log.info("info message", {"page_id": "12345", "space": "DEV"})
    log.warning("warning message", {"threshold": 0.9})
    log.error("error message", {"status_code": 500, "url": "/rest/api/content"})
    log.critical("critical message", {"reason": "database unreachable"})
    print("  (Check stderr for JSON output)")
    print()

    # --- Automatic redaction of sensitive keys ---
    print("Sensitive key redaction demo:")
    print("  Keys matching token|secret|password|auth|credential|api_key are redacted.")
    log.info("auth check", {
        "username": "admin",
        "api_token": "super-secret-token",
        "password": "my-password",
        "auth_header": "Basic ***REDACTED***",
        "credentials": {"api_key": "key-****"},
        "safe_field": "visible",
    })
    print("  (In stderr output: api_token, password, auth_header, credentials.api_key = ***REDACTED***)")
    print()

    # --- null_logger for silent operation ---
    print("null_logger suppresses all output:")
    null_logger.debug("this will not appear")
    null_logger.info("this will not appear")
    null_logger.error("this will not appear")
    print("  (No output produced)")
    print()

    # --- LOG_LEVEL environment variable ---
    print("LOG_LEVEL env var controls verbosity:")
    print("  DEBUG    — all messages")
    print("  INFO     — info, warning, error, critical (default)")
    print("  WARNING  — warning, error, critical")
    print("  ERROR    — error, critical only")
    print("  SILENT   — nothing")

    print("\n[OK] Logger examples complete.")


# =============================================================================
# Example 6: Service Layer — Content
# =============================================================================
def example6_content_service() -> None:
    """
    Demonstrate ContentService operations: list pages, get by ID,
    create, update, delete, labels, and properties.
    """
    _separator("Example 6: Service Layer — Content")

    print("ContentService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            svc = ContentService(client)

            # --- List content ---
            print("  svc.get_contents(type='page', space_key='DEV', limit=5):")
            try:
                result = svc.get_contents(type="page", space_key="DEV", limit=5)
                for item in result.get("results", []):
                    print(f"    {item.get('id')}: {item.get('title')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get content by ID ---
            print("  svc.get_content('12345', expand='body.storage'):")
            try:
                page = svc.get_content("12345", expand="body.storage")
                print(f"    Title: {page.get('title')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Create content ---
            print("  svc.create_content({type: 'page', title: 'New Page', ...}):")
            try:
                new_page = svc.create_content({
                    "type": "page",
                    "title": "Architecture Overview",
                    "space": {"key": "DEV"},
                    "body": {
                        "storage": {
                            "value": "<p>This page describes the system architecture.</p>",
                            "representation": "storage",
                        }
                    },
                })
                print(f"    Created: {new_page.get('id')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Add labels to content ---
            print("  svc.add_labels('12345', [{prefix: 'global', name: 'important'}]):")
            try:
                labels = [{"prefix": "global", "name": "important"}, {"prefix": "global", "name": "reviewed"}]
                result = svc.add_labels("12345", labels)
                print(f"    Labels added: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get content labels ---
            print("  svc.get_labels('12345'):")
            try:
                result = svc.get_labels("12345")
                print(f"    Labels: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Content properties ---
            print("  svc.create_property('12345', {key: 'myprop', value: {data: 1}}):")
            try:
                result = svc.create_property("12345", {"key": "myprop", "value": {"data": 1}})
                print(f"    Property created: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Content history ---
            print("  svc.get_content_history('12345'):")
            try:
                history = svc.get_content_history("12345")
                print(f"    History: {history}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Content restrictions ---
            print("  svc.get_restrictions_by_operation('12345'):")
            try:
                restrictions = svc.get_restrictions_by_operation("12345")
                print(f"    Restrictions: {restrictions}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Child content ---
            print("  svc.get_child_content('12345', type='page'):")
            try:
                children = svc.get_child_content("12345", type="page")
                print(f"    Children: {children}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Delete content ---
            print("  svc.delete_content('12345'):")
            try:
                svc.delete_content("12345")
                print("    Deleted successfully")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Content service examples complete.")


# =============================================================================
# Example 7: Service Layer — Spaces
# =============================================================================
def example7_space_service() -> None:
    """
    Demonstrate SpaceService operations: list, get, create, delete,
    archive, properties, labels, and watchers.
    """
    _separator("Example 7: Service Layer — Spaces")

    print("SpaceService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            svc = SpaceService(client)

            # --- List spaces ---
            print("  svc.get_spaces(limit=5):")
            try:
                result = svc.get_spaces(limit=5)
                for space in result.get("results", []):
                    print(f"    {space.get('key')}: {space.get('name')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get single space ---
            print("  svc.get_space('DEV'):")
            try:
                space = svc.get_space("DEV")
                print(f"    Key: {space.get('key')}, Name: {space.get('name')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Create space ---
            print("  svc.create_space({key: 'NEW', name: 'New Space'}):")
            try:
                new_space = svc.create_space({"key": "NEW", "name": "New Space"})
                print(f"    Created: {new_space.get('key')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Archive space ---
            print("  svc.archive_space('OLD'):")
            try:
                svc.archive_space("OLD")
                print("    Archived successfully")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Space properties ---
            print("  svc.get_space_properties('DEV'):")
            try:
                props = svc.get_space_properties("DEV")
                print(f"    Properties: {props}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Space watchers ---
            print("  svc.get_space_watchers('DEV'):")
            try:
                watchers = svc.get_space_watchers("DEV")
                print(f"    Watchers: {watchers}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Delete space ---
            print("  svc.delete_space('OLD'):")
            try:
                svc.delete_space("OLD")
                print("    Deleted successfully (returns long task)")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Space service examples complete.")


# =============================================================================
# Example 8: Service Layer — Search
# =============================================================================
def example8_search_service() -> None:
    """
    Demonstrate SearchService with CQL queries built using the CQL builder.
    """
    _separator("Example 8: Service Layer — Search")

    print("SearchService + CQL builder (demo — calls will fail with fake credentials):")
    print()

    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            svc = SearchService(client)

            # --- Search pages in a space ---
            query1 = (
                cql("type").equals("page")
                .and_()
                .field("space").equals("DEV")
                .order_by("lastModified", "desc")
                .build()
            )
            print(f"  CQL: {query1}")
            print("  svc.search_content(cql, limit=10):")
            try:
                result = svc.search_content(query1, limit=10)
                for item in result.get("results", []):
                    print(f"    {item.get('title')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Full-text search ---
            query2 = (
                cql("type").equals("page")
                .and_()
                .field("title").contains("architecture")
                .build()
            )
            print(f"  CQL: {query2}")
            print("  svc.search_content(cql):")
            try:
                result = svc.search_content(query2)
                print(f"    Found {result.get('totalSize', 0)} results")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Site-wide search across multiple spaces ---
            query3 = (
                cql("space").in_list(["DEV", "OPS", "QA"])
                .and_()
                .field("type").equals("page")
                .and_()
                .field("label").equals("important")
                .build()
            )
            print(f"  CQL: {query3}")
            print("  svc.search(cql, limit=25):")
            try:
                result = svc.search(query3, limit=25)
                print(f"    Found {result.get('totalSize', 0)} results")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Scan content (cursor-based) ---
            print("  svc.scan_content(limit=10):")
            try:
                result = svc.scan_content(limit=10)
                print(f"    Scanned: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Search service examples complete.")


# =============================================================================
# Example 9: Attachment Service
# =============================================================================
def example9_attachment_service() -> None:
    """
    Demonstrate AttachmentService operations: list, upload, update, move,
    and delete file attachments on content.
    """
    _separator("Example 9: Attachment Service")

    print("AttachmentService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            svc = AttachmentService(client)

            # --- List attachments ---
            print("  svc.get_attachments('12345', limit=10):")
            try:
                result = svc.get_attachments("12345", limit=10)
                for att in result.get("results", []):
                    print(f"    {att.get('id')}: {att.get('title')}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Upload attachment from file ---
            print("  svc.create_attachment('12345', '/path/to/document.pdf'):")
            try:
                # Create a temp file to demonstrate the upload pattern
                with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
                    tmp.write(b"Example file content for attachment upload")
                    tmp_path = tmp.name
                result = svc.create_attachment(
                    content_id="12345",
                    file_path=tmp_path,
                    comment="Uploaded via SDK example",
                    minor_edit=False,
                )
                print(f"    Uploaded: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            finally:
                os.unlink(tmp_path)
            print()

            # --- Update attachment metadata ---
            print("  svc.update_attachment_metadata('12345', 'att-001', {title: 'renamed.pdf'}):")
            try:
                result = svc.update_attachment_metadata("12345", "att-001", {"title": "renamed.pdf"})
                print(f"    Updated: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Move attachment ---
            print("  svc.move_attachment('12345', 'att-001', '67890'):")
            try:
                result = svc.move_attachment("12345", "att-001", "67890")
                print(f"    Moved: {result}")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Delete attachment ---
            print("  svc.delete_attachment('12345', 'att-001'):")
            try:
                svc.delete_attachment("12345", "att-001")
                print("    Deleted successfully")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Attachment service examples complete.")


# =============================================================================
# Example 10: Additional Services — Users, Groups, Admin, Webhooks
# =============================================================================
def example10_additional_services() -> None:
    """
    Demonstrate additional service layer capabilities: user management,
    groups, admin operations, webhooks, labels, and color schemes.
    """
    _separator("Example 10: Additional Services")

    try:
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:

            # --- UserService ---
            print("UserService:")
            user_svc = UserService(client)
            for method_call, desc in [
                (lambda: user_svc.get_current_user(), "get_current_user()"),
                (lambda: user_svc.get_user("admin"), "get_user('admin')"),
                (lambda: user_svc.is_watching_content("12345"), "is_watching_content('12345')"),
                (lambda: user_svc.get_content_watchers("12345"), "get_content_watchers('12345')"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- GroupService ---
            print("GroupService:")
            group_svc = GroupService(client)
            for method_call, desc in [
                (lambda: group_svc.get_groups(), "get_groups()"),
                (lambda: group_svc.get_group("developers"), "get_group('developers')"),
                (lambda: group_svc.get_group_members("developers"), "get_group_members('developers')"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- AdminService ---
            print("AdminService:")
            admin_svc = AdminService(client)
            for method_call, desc in [
                (lambda: admin_svc.create_user({"name": "newuser", "email": "new@test.com", "password": "pass123"}), "create_user(...)"),
                (lambda: admin_svc.disable_user("olduser"), "disable_user('olduser')"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- WebhookService ---
            print("WebhookService:")
            webhook_svc = WebhookService(client)
            for method_call, desc in [
                (lambda: webhook_svc.get_webhooks(), "get_webhooks()"),
                (lambda: webhook_svc.create_webhook({"url": "https://example.com/hook", "events": ["page_created"]}), "create_webhook(...)"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- LabelService ---
            print("LabelService:")
            label_svc = LabelService(client)
            for method_call, desc in [
                (lambda: label_svc.get_related_labels("important"), "get_related_labels('important')"),
                (lambda: label_svc.get_recent_labels(), "get_recent_labels()"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- ColorSchemeService ---
            print("ColorSchemeService:")
            color_svc = ColorSchemeService(client)
            for method_call, desc in [
                (lambda: color_svc.get_global_color_scheme(), "get_global_color_scheme()"),
                (lambda: color_svc.get_space_color_scheme("DEV"), "get_space_color_scheme('DEV')"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")
            print()

            # --- SpacePermissionService ---
            print("SpacePermissionService:")
            perm_svc = SpacePermissionService(client)
            for method_call, desc in [
                (lambda: perm_svc.get_permissions("DEV"), "get_permissions('DEV')"),
                (lambda: perm_svc.get_user_permissions("DEV", "admin"), "get_user_permissions('DEV', 'admin')"),
                (lambda: perm_svc.get_group_permissions("DEV", "developers"), "get_group_permissions('DEV', 'developers')"),
            ]:
                try:
                    result = method_call()
                    print(f"  {desc}: {result}")
                except (ConfluenceAPIError, Exception) as err:
                    print(f"  {desc}: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Additional service examples complete.")


# =============================================================================
# Example 11: Pagination — Async Generators
# =============================================================================
def example11_pagination() -> None:
    """
    Demonstrate paginate_offset() and paginate_cursor() async generators,
    plus the build_expand() utility.
    """
    _separator("Example 11: Pagination (Async Generators)")

    # --- build_expand utility ---
    print("build_expand utility:")
    expand = build_expand(["body.storage", "version", "ancestors"])
    print(f"  build_expand(['body.storage', 'version', 'ancestors']) = '{expand}'")
    print()

    # --- paginate_offset example (async) ---
    print("paginate_offset — iterates all pages of an offset-based endpoint:")
    print()
    print("  Usage pattern:")
    print("    async for item in paginate_offset(client, 'content', params={'spaceKey': 'DEV'}, limit=50):")
    print("        print(item['title'])")
    print()

    async def _demo_offset():
        """Demo: paginate_offset with real client (will fail with demo creds)."""
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            items = []
            try:
                async for item in paginate_offset(
                    client,
                    "content",
                    params={"spaceKey": "DEV", "type": "page"},
                    start=0,
                    limit=25,
                ):
                    items.append(item)
                    if len(items) >= 100:
                        break  # Safety limit for examples
                print(f"    Collected {len(items)} items")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    try:
        asyncio.run(_demo_offset())
    except Exception as err:
        print(f"    Async demo error: {type(err).__name__}: {err}")
    print()

    # --- paginate_cursor example (async) ---
    print("paginate_cursor — iterates using opaque cursor tokens:")
    print()
    print("  Usage pattern:")
    print("    async for item in paginate_cursor(client, 'content/scan', limit=100):")
    print("        print(item['id'])")
    print()

    async def _demo_cursor():
        """Demo: paginate_cursor with real client (will fail with demo creds)."""
        with ConfluenceClient(base_url=DEMO_BASE_URL, username=DEMO_USERNAME, api_token=DEMO_TOKEN) as client:
            items = []
            try:
                async for item in paginate_cursor(
                    client,
                    "content/scan",
                    params={"expand": "version"},
                    limit=50,
                ):
                    items.append(item)
                    if len(items) >= 200:
                        break
                print(f"    Collected {len(items)} items via cursor pagination")
            except ConfluenceAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    try:
        asyncio.run(_demo_cursor())
    except Exception as err:
        print(f"    Async demo error: {type(err).__name__}: {err}")

    print("\n[OK] Pagination examples complete.")


# =============================================================================
# Example 12: Model Validation (Pydantic)
# =============================================================================
def example12_model_validation() -> None:
    """
    Demonstrate Pydantic model usage for Confluence data structures.
    Shows construction, validation, and serialization of core models.
    """
    _separator("Example 12: Model Validation (Pydantic)")

    # --- ContentCreate model ---
    print("ContentCreate model:")
    content_create = ContentCreate(
        type="page",
        title="Architecture Overview",
        space={"key": "DEV"},
        body={
            "storage": {
                "value": "<p>System architecture documentation.</p>",
                "representation": "storage",
            }
        },
    )
    print(f"  type:  {content_create.type}")
    print(f"  title: {content_create.title}")
    print(f"  JSON:  {content_create.model_dump_json(indent=2)[:120]}...")
    print()

    # --- ContentUpdate model ---
    print("ContentUpdate model (with version tracking):")
    content_update = ContentUpdate(
        type="page",
        title="Architecture Overview (v2)",
        version={"number": 2},
        body={
            "storage": {
                "value": "<p>Updated architecture documentation.</p>",
                "representation": "storage",
            }
        },
    )
    print(f"  version: {content_update.version}")
    print(f"  title:   {content_update.title}")
    print()

    # --- SpaceCreate model ---
    print("SpaceCreate model:")
    space_create = SpaceCreate(key="DEV", name="Development")
    print(f"  key:  {space_create.key}")
    print(f"  name: {space_create.name}")
    print()

    # --- Content model (parsing API response) ---
    print("Content model (parsing API response):")
    content = Content(
        id="12345",
        type="page",
        title="My Page",
        status="current",
    )
    print(f"  id:     {content.id}")
    print(f"  type:   {content.type}")
    print(f"  title:  {content.title}")
    print(f"  status: {content.status}")
    print()

    # --- Label model ---
    print("Label model:")
    label = Label(prefix="global", name="important", id="1001")
    print(f"  prefix: {label.prefix}")
    print(f"  name:   {label.name}")
    print()

    # --- Space model ---
    print("Space model:")
    space = Space(key="DEV", name="Development", type="global")
    print(f"  key:  {space.key}")
    print(f"  name: {space.name}")
    print(f"  type: {space.type}")

    print("\n[OK] Model validation examples complete.")


# =============================================================================
# Example 13: SDK Client (REST proxy)
# =============================================================================
def example13_sdk_client() -> None:
    """
    Demonstrate the ConfluenceSDKClient, which talks to the REST proxy server
    (FastAPI or Fastify) rather than directly to Confluence Data Center.
    """
    _separator("Example 13: SDK Client (REST Proxy)")

    # The SDK client connects to your local server, not Confluence directly.
    print("ConfluenceSDKClient connects to the local REST proxy server.")
    print("It requires the server to be running (e.g., `make dev`).")
    print()

    with ConfluenceSDKClient(
        base_url="http://localhost:8000",
        api_key="my_api_key",
        timeout=10.0,
    ) as sdk:
        # --- Health check ---
        print("  sdk.health_check():")
        try:
            health = sdk.health_check()
            print(f"    {health}")
        except SDKError as err:
            print(f"    Expected error (server not running): {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Get content ---
        print("  sdk.get_content('12345'):")
        try:
            page = sdk.get_content("12345")
            print(f"    Page: {page}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- List spaces ---
        print("  sdk.get_spaces(limit=5):")
        try:
            spaces = sdk.get_spaces(limit=5)
            print(f"    Spaces: {spaces}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Search ---
        print("  sdk.search_content('type = \"page\"'):")
        try:
            results = sdk.search_content('type = "page"')
            print(f"    Results: {results}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Server info ---
        print("  sdk.get_server_info():")
        try:
            info = sdk.get_server_info()
            print(f"    Info: {info}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Property proxies ---
        print("Property-style access:")
        for proxy_call, desc in [
            (lambda: sdk.content.get("12345"), "sdk.content.get('12345')"),
            (lambda: sdk.space.list(), "sdk.space.list()"),
            (lambda: sdk.search.query('type = "page"'), "sdk.search.query(...)"),
            (lambda: sdk.user.get_current(), "sdk.user.get_current()"),
        ]:
            try:
                result = proxy_call()
                print(f"  {desc}: {result}")
            except (SDKError, Exception) as err:
                print(f"  {desc}: {type(err).__name__}: {err}")

    print("\n[OK] SDK client examples complete.")


# =============================================================================
# Main — Run all examples sequentially
# =============================================================================
def main() -> None:
    """Run all example functions in order."""
    print("=" * 72)
    print("  Confluence API SDK — Python Examples")
    print("=" * 72)
    print()
    print("This script demonstrates all core features of the confluence_api SDK.")
    print("Fake demo credentials are used — HTTP requests will fail gracefully.")
    print()

    example1_configuration_loading()
    example2_client_initialization()
    example3_error_handling()
    example4_cql_builder()
    example5_structured_logger()
    example6_content_service()
    example7_space_service()
    example8_search_service()
    example9_attachment_service()
    example10_additional_services()
    example11_pagination()
    example12_model_validation()
    example13_sdk_client()

    print()
    print("=" * 72)
    print("  All examples completed successfully.")
    print("=" * 72)


if __name__ == "__main__":
    main()
