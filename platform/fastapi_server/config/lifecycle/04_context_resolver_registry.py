import uuid


def get_header(request, header_name, default=None):
    """Get header from request, handling both object and dict formats."""
    if request is None:
        return default
    # Dict format: {"headers": {...}, "query": {...}}
    if isinstance(request, dict):
        headers = request.get("headers", {})
        if isinstance(headers, dict):
            return headers.get(header_name, default)
        return default
    # Object format: request.headers.get(...)
    if hasattr(request, "headers"):
        return request.headers.get(header_name, default)
    return default


def get_query_param(request, param_name, default=None):
    """Get query param from request, handling both object and dict formats."""
    if request is None:
        return default
    # Dict format: {"headers": {...}, "query": {...}}
    if isinstance(request, dict):
        query = request.get("query", {})
        if isinstance(query, dict):
            return query.get(param_name, default)
        return default
    # Object format: request.query_params.get(...)
    if hasattr(request, "query_params"):
        return request.query_params.get(param_name, default)
    return default


def register_compute_functions(registry, ComputeScope):
    """
    Register built-in compute functions on the given registry.

    Args:
        registry: Compute function registry (from app_yaml_overwrites)
        ComputeScope: Scope enum (STARTUP | REQUEST)
    """

    # ==========================================================================
    # STARTUP Scope - Run once at startup, cached
    # ==========================================================================

    # Echo for testing
    registry.register("echo", lambda ctx: "echo", ComputeScope.STARTUP)

    # Build info from environment
    registry.register("get_build_id", lambda ctx: ctx.get("env", {}).get("BUILD_ID", "dev-local"), ComputeScope.STARTUP)
    registry.register("get_build_version", lambda ctx: ctx.get("env", {}).get("BUILD_VERSION", "0.0.0"), ComputeScope.STARTUP)
    registry.register("get_git_commit", lambda ctx: ctx.get("env", {}).get("GIT_COMMIT", "unknown"), ComputeScope.STARTUP)

    # Service info
    registry.register("get_service_name", lambda ctx: ctx.get("config", {}).get("app", {}).get("name", "mta-server"), ComputeScope.STARTUP)
    registry.register("get_service_version", lambda ctx: ctx.get("config", {}).get("app", {}).get("version", "0.0.0"), ComputeScope.STARTUP)

    # ==========================================================================
    # REQUEST Scope - Run per request with request context
    # ==========================================================================

    # Request ID - from header or generate
    def compute_request_id(ctx):
        request = ctx.get("request")
        request_id = get_header(request, "x-request-id")
        if request_id:
            return request_id
        return str(uuid.uuid4())
    registry.register("compute_request_id", compute_request_id, ComputeScope.REQUEST)

    # Gemini token - from header or env
    def compute_localhost_test_case_001_token(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-gemini-token")
        if token:
            return token
        return ctx.get("env", {}).get("GEMINI_API_KEY", "")
    registry.register("compute_localhost_test_case_001_token", compute_localhost_test_case_001_token, ComputeScope.REQUEST)

    # Test case 002 - Authorization from jira provider
    def compute_test_case_002(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-jira-token")
        if token:
            return f"Bearer {token}"
        api_token = ctx.get("env", {}).get("JIRA_API_TOKEN", "")
        if api_token:
            return f"Bearer {api_token}"
        return ""
    registry.register("test_case_002", compute_test_case_002, ComputeScope.REQUEST)

    # Test case 002_1 - X-Auth header
    def compute_test_case_002_1(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-auth")
        if token:
            return token
        return ctx.get("env", {}).get("JIRA_API_TOKEN", "")
    registry.register("test_case_002_1", compute_test_case_002_1, ComputeScope.REQUEST)

    # Tenant ID - from header or query param
    def compute_tenant_id(ctx):
        request = ctx.get("request")
        tenant_id = get_header(request, "x-tenant-id")
        if tenant_id:
            return tenant_id
        tenant_id = get_query_param(request, "tenant_id")
        if tenant_id:
            return tenant_id
        return "default"
    registry.register("compute_tenant_id", compute_tenant_id, ComputeScope.REQUEST)

    # User agent with app info
    def compute_user_agent(ctx):
        app_name = ctx.get("config", {}).get("app", {}).get("name", "MTA-Server")
        app_version = ctx.get("config", {}).get("app", {}).get("version", "0.0.0")
        base_ua = f"{app_name}/{app_version}"
        request = ctx.get("request")
        client_ua = get_header(request, "user-agent")
        if client_ua:
            return f"{base_ua} (via {client_ua})"
        return base_ua
    registry.register("compute_user_agent", compute_user_agent, ComputeScope.REQUEST)
