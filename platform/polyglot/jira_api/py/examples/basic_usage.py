"""
Basic Usage Examples — Jira API SDK (Python)

Self-contained demonstration of all core SDK features.
Each exampleX_name() function is independent and shows one concept.

Usage:
    python basic_usage.py

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)
"""

import json
import os

from jira_api import (
    Issue,
    IssueCreate,
    IssueUpdate,
    # Errors
    JiraAPIError,
    JiraAuthenticationError,
    # Core
    JiraClient,
    JiraNotFoundError,
    JiraPermissionError,
    JiraValidationError,
    Project,
    ProjectVersion,
    # Models
    User,
)
from jira_api.config import (
    JiraConfig,
    Settings,
    get_config,
    load_config_from_env,
    load_config_from_file,
)
from jira_api.exceptions import (
    JiraConfigurationError,
    JiraNetworkError,
    JiraRateLimitError,
    JiraServerError,
    JiraTimeoutError,
    SDKError,
    create_error_from_response,
)
from jira_api.logger import create_logger
from jira_api.sdk.client import JiraSDKClient
from jira_api.services.issue_service import IssueService
from jira_api.services.project_service import ProjectService
from jira_api.services.user_service import UserService
from jira_api.utils.adf import comment_to_adf, text_to_adf

# Demo credentials — NOT real. HTTP calls will fail gracefully.
DEMO_BASE_URL = "https://demo-instance.atlassian.net"
DEMO_EMAIL = "demo@example.com"
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
    Demonstrate how the SDK loads configuration from environment variables,
    config files, and the Settings model. Shows priority: env > file.
    """
    _separator("Example 1: Configuration Loading")

    # --- Settings from environment ---
    os.environ["JIRA_BASE_URL"] = DEMO_BASE_URL
    os.environ["JIRA_EMAIL"] = DEMO_EMAIL
    os.environ["JIRA_API_TOKEN"] = DEMO_TOKEN
    os.environ["LOG_LEVEL"] = "DEBUG"

    settings = Settings()
    print("Settings from environment:")
    print(f"  jira_base_url:  {settings.jira_base_url}")
    print(f"  jira_email:     {settings.jira_email}")
    print(f"  jira_api_token: {settings.jira_api_token[:8]}...")
    print(f"  server_host:    {settings.server_host}")
    print(f"  server_port:    {settings.server_port}")
    print(f"  log_level:      {settings.log_level}")
    print()

    # --- JiraConfig from env ---
    config = load_config_from_env()
    if config:
        print("JiraConfig loaded from env:")
        print(f"  base_url:  {config.base_url}")
        print(f"  email:     {config.email}")
        print(f"  api_token: {config.api_token[:8]}...")
    print()

    # --- JiraConfig explicit construction ---
    explicit = JiraConfig(
        base_url="https://myteam.atlassian.net",
        email="admin@myteam.com",
        api_token="my_secret_token",
    )
    print("Explicit JiraConfig:")
    print(f"  base_url:  {explicit.base_url}")
    print(f"  email:     {explicit.email}")
    print()

    # --- get_config priority (env > file) ---
    resolved = get_config()
    print(f"get_config() resolved: {'env' if resolved else 'None'}")
    print()

    # --- Config from file (likely returns None in demo) ---
    file_config = load_config_from_file()
    print(f"load_config_from_file(): {file_config}")

    # Cleanup
    del os.environ["JIRA_BASE_URL"]
    del os.environ["JIRA_EMAIL"]
    del os.environ["JIRA_API_TOKEN"]
    del os.environ["LOG_LEVEL"]

    print("\n[OK] Configuration loading complete.")


# =============================================================================
# Example 2: Client Initialization
# =============================================================================
def example2_client_initialization() -> None:
    """
    Create a JiraClient with explicit credentials.
    Shows the context manager pattern for automatic cleanup.
    """
    _separator("Example 2: Client Initialization")

    with JiraClient(
        base_url=DEMO_BASE_URL,
        email=DEMO_EMAIL,
        api_token=DEMO_TOKEN,
        timeout=60.0,
    ) as client:
        print("JiraClient created successfully:")
        print(f"  base_url: {client.base_url}")
        print(f"  email:    {client.email}")
        print(f"  timeout:  {client.timeout}s")
        print()

        # --- Attempt a real API call (will fail with demo credentials) ---
        print("Attempting client.get_user('nonexistent'):")
        try:
            user = client.get_user("nonexistent_account_id")
            print(f"  User: {user}")
        except JiraAuthenticationError as err:
            print(f"  Expected error (demo token): {err}")
        except JiraAPIError as err:
            print(f"  Expected error (demo setup): {type(err).__name__}: {err}")
        except Exception as err:
            print(f"  Connection error (expected in demo): {type(err).__name__}: {err}")

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
        JiraValidationError("Invalid project ID format"),
        JiraAuthenticationError("Invalid API token"),
        JiraPermissionError("No access to project ADMIN"),
        JiraNotFoundError("Issue PROJ-999 not found"),
        JiraRateLimitError("Too many requests", retry_after=30.0),
        JiraServerError("Jira instance unavailable", status_code=503),
        JiraNetworkError("Could not reach Jira instance"),
        JiraTimeoutError("Request timed out after 30s"),
        JiraConfigurationError("Missing JIRA_BASE_URL"),
        SDKError("SDK proxy server not running"),
    ]

    for err in errors:
        print(f"  {type(err).__name__} (status={err.status_code}):")
        print(f"    message: {err.message}")
        print(f"    to_dict: {json.dumps(err.to_dict(), indent=6, default=str)}")
        print()

    # --- Hierarchy check ---
    print("All errors inherit from JiraAPIError:")
    for err in errors:
        print(f"  isinstance({type(err).__name__}, JiraAPIError) = {isinstance(err, JiraAPIError)}")
    print()

    # --- create_error_from_response ---
    print("create_error_from_response examples:")
    for status, body in [
        (400, {"message": "Invalid field"}),
        (401, {"message": "Bad credentials"}),
        (404, {"message": "Not found"}),
        (429, {"message": "Rate limited"}),
        (500, {"message": "Internal error"}),
        (418, {"errorMessages": ["I'm a teapot"]}),
        (400, None),
    ]:
        err = create_error_from_response(status, body)
        print(f"  HTTP {status}: {type(err).__name__} — {err.message}")

    # --- Try/except pattern ---
    print("\nTry/except pattern with JiraClient:")
    try:
        with JiraClient(base_url=DEMO_BASE_URL, email=DEMO_EMAIL, api_token=DEMO_TOKEN) as client:
            client.get_issue("PROJ-1")
    except JiraNotFoundError as err:
        print(f"  Caught JiraNotFoundError: {err}")
    except JiraAuthenticationError as err:
        print(f"  Caught JiraAuthenticationError: {err}")
    except JiraAPIError as err:
        print(f"  Caught JiraAPIError ({type(err).__name__}): {err}")
    except Exception as err:
        print(f"  Caught unexpected error: {type(err).__name__}: {err}")

    print("\n[OK] Error handling examples complete.")


# =============================================================================
# Example 4: ADF Formatting
# =============================================================================
def example4_adf_formatting() -> None:
    """
    Demonstrate Atlassian Document Format (ADF) conversion utilities.
    Jira Cloud REST API v3 requires ADF for description and comment fields.
    """
    _separator("Example 4: ADF Formatting")

    # --- text_to_adf ---
    print("text_to_adf examples:")
    for text in ["Hello world", "Multi\\nline text", "", None, 42]:
        result = text_to_adf(text)
        label = repr(text)
        if result:
            print(f"  text_to_adf({label}):")
            print(f"    {json.dumps(result, indent=4)}")
        else:
            print(f"  text_to_adf({label}): None")
        print()

    # --- comment_to_adf ---
    print("comment_to_adf examples:")
    comment = comment_to_adf("This is a comment on the issue.")
    print("  comment_to_adf('This is a comment...'):")
    print(f"    {json.dumps(comment, indent=4)}")
    print()

    empty_comment = comment_to_adf("")
    print(f"  comment_to_adf(''): {empty_comment}")

    print("\n[OK] ADF formatting examples complete.")


# =============================================================================
# Example 5: Service Layer — Users
# =============================================================================
def example5_user_service() -> None:
    """
    Demonstrate UserService operations: search, get by ID, get by email,
    find assignable users.
    """
    _separator("Example 5: Service Layer — Users")

    print("UserService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with JiraClient(base_url=DEMO_BASE_URL, email=DEMO_EMAIL, api_token=DEMO_TOKEN) as client:
            svc = UserService(client)

            # --- Search users ---
            print("  svc.search_users('john', max_results=5):")
            try:
                users = svc.search_users("john", max_results=5)
                for u in users:
                    print(f"    {u.display_name} ({u.account_id})")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get user by email ---
            print("  svc.get_user_by_email('john@example.com'):")
            try:
                user = svc.get_user_by_email("john@example.com")
                print(f"    Result: {user}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get user by identifier (tries ID first, then email) ---
            print("  svc.get_user_by_identifier('john@example.com'):")
            try:
                user = svc.get_user_by_identifier("john@example.com")
                print(f"    Result: {user}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] User service examples complete.")


# =============================================================================
# Example 6: Service Layer — Issues
# =============================================================================
def example6_issue_service() -> None:
    """
    Demonstrate IssueService operations: create, get, update summary,
    add/remove labels, assign, transition.
    """
    _separator("Example 6: Service Layer — Issues")

    print("IssueService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with JiraClient(base_url=DEMO_BASE_URL, email=DEMO_EMAIL, api_token=DEMO_TOKEN) as client:
            svc = IssueService(client)

            # --- Get issue ---
            print("  svc.get_issue('PROJ-1'):")
            try:
                issue = svc.get_issue("PROJ-1")
                print(f"    Key: {issue.key}, Summary: {issue.fields.summary}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Create issue ---
            print("  svc.create_issue(project_id='10001', summary='Bug fix', issue_type_id='10002'):")
            try:
                new_issue = svc.create_issue(
                    project_id="10001",
                    summary="Fix login page timeout",
                    issue_type_id="10002",
                    description="Users experience timeout after 30s on the login page.",
                    labels=["bug", "frontend"],
                )
                print(f"    Created: {new_issue.key}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Update summary ---
            print("  svc.update_issue_summary('PROJ-1', 'Updated Title'):")
            try:
                svc.update_issue_summary("PROJ-1", "Updated Issue Title")
                print("    Success")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get transitions ---
            print("  svc.get_available_transitions('PROJ-1'):")
            try:
                transitions = svc.get_available_transitions("PROJ-1")
                for t in transitions:
                    print(f"    {t.id}: {t.name}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Issue service examples complete.")


# =============================================================================
# Example 7: Service Layer — Projects
# =============================================================================
def example7_project_service() -> None:
    """
    Demonstrate ProjectService operations: get project, list versions,
    filter released/unreleased, find version by name.
    """
    _separator("Example 7: Service Layer — Projects")

    print("ProjectService methods (demo — calls will fail with fake credentials):")
    print()

    try:
        with JiraClient(base_url=DEMO_BASE_URL, email=DEMO_EMAIL, api_token=DEMO_TOKEN) as client:
            svc = ProjectService(client)

            # --- Get project ---
            print("  svc.get_project('PROJ'):")
            try:
                project = svc.get_project("PROJ")
                print(f"    Key: {project.key}, Name: {project.name}")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get versions ---
            print("  svc.get_project_versions('PROJ'):")
            try:
                versions = svc.get_project_versions("PROJ")
                for v in versions:
                    print(f"    {v.name} (released={v.released})")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")
            print()

            # --- Get released versions ---
            print("  svc.get_project_versions('PROJ', released_only=True):")
            try:
                released = svc.get_project_versions("PROJ", released_only=True)
                print(f"    Found {len(released)} released versions")
            except JiraAPIError as err:
                print(f"    Expected error: {type(err).__name__}: {err}")
            except Exception as err:
                print(f"    Connection error: {type(err).__name__}: {err}")

    except Exception as err:
        print(f"  Client creation failed: {err}")

    print("\n[OK] Project service examples complete.")


# =============================================================================
# Example 8: SDK Client (REST proxy)
# =============================================================================
def example8_sdk_client() -> None:
    """
    Demonstrate the JiraSDKClient, which talks to the REST proxy server
    (FastAPI or Fastify) rather than directly to Jira Cloud.
    """
    _separator("Example 8: SDK Client (REST Proxy)")

    # The SDK client connects to your local server, not Jira directly.
    print("JiraSDKClient connects to the local REST proxy server.")
    print("It requires the server to be running (e.g., `make dev`).")
    print()

    with JiraSDKClient(
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

        # --- Search users ---
        print("  sdk.search_users('john'):")
        try:
            users = sdk.search_users("john")
            print(f"    Found {len(users)} users")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Get issue ---
        print("  sdk.get_issue('PROJ-1'):")
        try:
            issue = sdk.get_issue("PROJ-1")
            print(f"    Issue: {issue}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Get project ---
        print("  sdk.get_project('PROJ'):")
        try:
            project = sdk.get_project("PROJ")
            print(f"    Project: {project}")
        except SDKError as err:
            print(f"    Expected error: {err}")
        except Exception as err:
            print(f"    Connection error: {type(err).__name__}: {err}")
        print()

        # --- Show available SDK methods ---
        print("Available JiraSDKClient methods:")
        methods = [
            "health_check()",
            "search_users(query, max_results=50)",
            "get_user(identifier)",
            "create_issue(issue_data)",
            "get_issue(issue_key)",
            "update_issue(issue_key, update_data)",
            "assign_issue(issue_key, email)",
            "get_issue_transitions(issue_key)",
            "transition_issue(issue_key, name, comment, resolution)",
            "get_project(project_key)",
            "get_project_versions(project_key, released)",
            "create_project_version(project_key, name, description)",
        ]
        for m in methods:
            print(f"  - sdk.{m}")

    print("\n[OK] SDK client examples complete.")


# =============================================================================
# Main — Run all examples sequentially
# =============================================================================
def main() -> None:
    """Run all example functions in order."""
    print("=" * 72)
    print("  Jira API SDK — Python Examples")
    print("=" * 72)
    print()
    print("This script demonstrates all core features of the jira_api SDK.")
    print("Fake demo credentials are used — HTTP requests will fail gracefully.")
    print()

    example1_configuration_loading()
    example2_client_initialization()
    example3_error_handling()
    example4_adf_formatting()
    example5_user_service()
    example6_issue_service()
    example7_project_service()
    example8_sdk_client()

    print()
    print("=" * 72)
    print("  All examples completed successfully.")
    print("=" * 72)


if __name__ == "__main__":
    main()
