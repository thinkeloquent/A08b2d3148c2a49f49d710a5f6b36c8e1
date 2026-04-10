"""
Common Exceptions - FastAPI Integration Example

This example demonstrates integrating common_exceptions with FastAPI:
- Registering exception handlers
- Using request ID middleware
- Raising standardized exceptions from routes
- Validation error handling with Pydantic

Run with: uvicorn examples.fastapi_app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI, Header, Query
from pydantic import BaseModel, EmailStr, Field

from common_exceptions import (
    BadRequestException,
    ConflictException,
    InternalServerException,
    NotAuthenticatedException,
    NotAuthorizedException,
    # Exceptions
    NotFoundException,
    RequestIdMiddleware,
    TooManyRequestsException,
    ValidationException,
    # Logger
    create_logger,
    # FastAPI integration
    register_exception_handlers,
)

# Create logger for this module
logger = create_logger("fastapi_app", __file__)


# =============================================================================
# Mock Data
# =============================================================================

MOCK_USERS = {
    "user-1": {"id": "user-1", "name": "Alice", "email": "alice@example.com", "role": "admin"},
    "user-2": {"id": "user-2", "name": "Bob", "email": "bob@example.com", "role": "viewer"},
}

MOCK_TOKENS = {
    "valid-token": {"user_id": "user-1", "expires": "2099-12-31"},
    "expired-token": {"user_id": "user-2", "expires": "2020-01-01"},
}


# =============================================================================
# Pydantic Models
# =============================================================================


class UserCreate(BaseModel):
    """User creation request model."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    role: str = Field(default="viewer", pattern="^(admin|editor|viewer)$")


class UserResponse(BaseModel):
    """User response model."""

    id: str
    name: str
    email: str
    role: str


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    version: str


# =============================================================================
# Dependencies
# =============================================================================


def get_current_user(
    authorization: Annotated[str | None, Header()] = None
) -> dict[str, Any]:
    """
    Dependency to validate authentication and return current user.
    Raises NotAuthenticatedException if token is invalid.
    """
    if not authorization:
        logger.debug("No authorization header provided")
        raise NotAuthenticatedException(message="Authorization header required")

    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise NotAuthenticatedException(message="Invalid authorization format")

    token = authorization[7:]

    # Check if token exists
    if token not in MOCK_TOKENS:
        logger.debug(f"Unknown token: {token[:10]}...")
        raise NotAuthenticatedException(message="Invalid or expired token")

    token_data = MOCK_TOKENS[token]

    # Check if token is expired (simplified check)
    if token_data["expires"] < "2025-01-01":
        raise NotAuthenticatedException(
            message="Token has expired",
            details={"expired_at": token_data["expires"]},
        )

    # Get user
    user_id = token_data["user_id"]
    if user_id not in MOCK_USERS:
        raise InternalServerException(message="User associated with token not found")

    return MOCK_USERS[user_id]


def require_admin(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)]
) -> dict[str, Any]:
    """
    Dependency to require admin role.
    Raises NotAuthorizedException if user is not admin.
    """
    if current_user.get("role") != "admin":
        logger.debug(f"User {current_user['id']} attempted admin action with role {current_user['role']}")
        raise NotAuthorizedException(
            message="Admin role required",
            details={
                "required_role": "admin",
                "user_role": current_user.get("role"),
            },
        )
    return current_user


# =============================================================================
# Lifespan
# =============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("FastAPI application starting up")
    logger.debug(f"Loaded {len(MOCK_USERS)} mock users")
    yield
    logger.info("FastAPI application shutting down")


# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Common Exceptions Example",
    description="FastAPI application demonstrating common_exceptions integration",
    version="1.0.0",
    lifespan=lifespan,
)

# Add request ID middleware
app.add_middleware(RequestIdMiddleware)

# Register exception handlers
register_exception_handlers(app)


# =============================================================================
# Routes
# =============================================================================


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
async def get_user(
    user_id: str,
    _current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> UserResponse:
    """
    Get a user by ID.
    Requires authentication.
    """
    logger.debug(f"Fetching user: {user_id}")

    if user_id not in MOCK_USERS:
        raise NotFoundException(
            message=f"User with ID '{user_id}' not found",
            details={"userId": user_id},
        )

    user = MOCK_USERS[user_id]
    return UserResponse(**user)


@app.post("/users", response_model=UserResponse, status_code=201, tags=["Users"])
async def create_user(
    user_data: UserCreate,
    _admin_user: Annotated[dict[str, Any], Depends(require_admin)],
) -> UserResponse:
    """
    Create a new user.
    Requires admin role.
    """
    logger.debug(f"Creating user: {user_data.email}")

    # Check for duplicate email
    for existing_user in MOCK_USERS.values():
        if existing_user["email"] == user_data.email:
            raise ConflictException(
                message="User with this email already exists",
                details={"email": user_data.email},
            )

    # Create new user (in memory only for this example)
    new_id = f"user-{len(MOCK_USERS) + 1}"
    new_user = {
        "id": new_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
    }

    MOCK_USERS[new_id] = new_user
    logger.info(f"Created user: {new_id}")

    return UserResponse(**new_user)


@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
async def delete_user(
    user_id: str,
    _admin_user: Annotated[dict[str, Any], Depends(require_admin)],
) -> None:
    """
    Delete a user by ID.
    Requires admin role.
    """
    logger.debug(f"Deleting user: {user_id}")

    if user_id not in MOCK_USERS:
        raise NotFoundException(
            message=f"User with ID '{user_id}' not found",
            details={"userId": user_id},
        )

    del MOCK_USERS[user_id]
    logger.info(f"Deleted user: {user_id}")


@app.post("/validate", tags=["Validation"])
async def validate_input(
    name: Annotated[str | None, Query()] = None,
    email: Annotated[str | None, Query()] = None,
    age: Annotated[int | None, Query()] = None,
) -> dict[str, str]:
    """
    Endpoint demonstrating manual validation with ValidationException.
    """
    errors = []

    if not name:
        errors.append({"field": "query.name", "message": "Name is required", "code": "required"})
    elif len(name) < 2:
        errors.append({"field": "query.name", "message": "Name must be at least 2 characters", "code": "min_length"})

    if not email:
        errors.append({"field": "query.email", "message": "Email is required", "code": "required"})
    elif "@" not in email:
        errors.append({"field": "query.email", "message": "Invalid email format", "code": "invalid_email"})

    if age is not None and age < 0:
        errors.append({"field": "query.age", "message": "Age must be non-negative", "code": "min_value"})

    if errors:
        raise ValidationException.from_field_errors(
            errors=errors,
            message=f"Validation failed for {len(errors)} field(s)",
        )

    return {"status": "valid", "name": name, "email": email}


@app.get("/rate-limited", tags=["Demo"])
async def rate_limited_endpoint() -> dict[str, str]:
    """
    Demo endpoint that always returns rate limit error.
    """
    raise TooManyRequestsException(
        message="Rate limit exceeded",
        retry_after=60,
        details={"limit": 100, "window": "1m", "current": 150},
    )


@app.get("/bad-request", tags=["Demo"])
async def bad_request_endpoint(
    value: Annotated[str | None, Query()] = None
) -> dict[str, str]:
    """
    Demo endpoint that returns bad request error.
    """
    if not value:
        raise BadRequestException(
            message="Query parameter 'value' is required",
            details={"missing_param": "value"},
        )
    return {"value": value}


@app.get("/internal-error", tags=["Demo"])
async def internal_error_endpoint() -> dict[str, str]:
    """
    Demo endpoint that always returns internal server error.
    """
    raise InternalServerException(
        message="An unexpected error occurred",
        details={"component": "demo_endpoint"},
    )


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
