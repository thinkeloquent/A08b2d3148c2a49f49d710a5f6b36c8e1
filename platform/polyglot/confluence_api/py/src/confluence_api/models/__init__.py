"""Confluence API Pydantic models -- re-exports all public model classes."""

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)

# --- common ---
# --- backup ---
from confluence_api.models.backup import (
    JobDetails,
    SiteBackupSettings,
    SiteRestoreSettings,
    SpaceBackupSettings,
    SpaceRestoreSettings,
)

# --- color_scheme ---
from confluence_api.models.color_scheme import (
    ColorSchemeModel,
    ColorSchemeThemeBasedModel,
    SpaceColorSchemeTypeModel,
)
from confluence_api.models.common import (
    OperationCheckResult,
    PaginatedResponse,
    PaginationLinks,
    RestError,
    ValidationResult,
)

# --- content ---
from confluence_api.models.content import (
    Content,
    ContentBody,
    ContentBodyContainer,
    ContentCreate,
    ContentUpdate,
    History,
    Icon,
    MacroInstance,
    Person,
    ReferenceVersion,
    Version,
)

# --- group ---
from confluence_api.models.group import Group

# --- label ---
from confluence_api.models.label import Label

# --- permission ---
from confluence_api.models.permission import (
    ContentRestriction,
    OperationDescription,
    SpacePermission,
    SpacePermissionsForSubject,
    Subject,
)

# --- search ---
from confluence_api.models.search import ContainerSummary, SearchResult

# --- space ---
from confluence_api.models.space import (
    LongTaskSubmission,
    Space,
    SpaceCreate,
    SpaceUpdate,
)

# --- system ---
from confluence_api.models.system import (
    InstanceMetrics,
    LongTaskMessage,
    LongTaskStatus,
    ServerInformation,
)

# --- user ---
from confluence_api.models.user import (
    Credentials,
    PasswordChangeDetails,
    UserDetailsForCreation,
    UserKey,
)
from confluence_api.models.user import Person as UserPerson

# --- watch ---
from confluence_api.models.watch import (
    ContentWatch,
    JsonContentProperty,
    JsonSpaceProperty,
    SpaceWatch,
)

# --- webhook ---
from confluence_api.models.webhook import (
    DetailedInvocation,
    DetailedInvocationResult,
    RestWebhook,
    Webhook,
    WebhookCredentials,
    WebhookEvent,
    WebhookScope,
)

__all__ = [
    # common
    "ValidationResult",
    "RestError",
    "PaginationLinks",
    "PaginatedResponse",
    "OperationCheckResult",
    # content
    "Icon",
    "Person",
    "ReferenceVersion",
    "History",
    "Version",
    "ContentBody",
    "ContentBodyContainer",
    "Content",
    "MacroInstance",
    "ContentCreate",
    "ContentUpdate",
    # space
    "Space",
    "SpaceCreate",
    "SpaceUpdate",
    "LongTaskSubmission",
    # user
    "UserPerson",
    "UserDetailsForCreation",
    "Credentials",
    "PasswordChangeDetails",
    "UserKey",
    # group
    "Group",
    # label
    "Label",
    # search
    "ContainerSummary",
    "SearchResult",
    # webhook
    "WebhookScope",
    "WebhookEvent",
    "WebhookCredentials",
    "Webhook",
    "RestWebhook",
    "DetailedInvocationResult",
    "DetailedInvocation",
    # backup
    "JobDetails",
    "SiteBackupSettings",
    "SpaceBackupSettings",
    "SiteRestoreSettings",
    "SpaceRestoreSettings",
    # system
    "ServerInformation",
    "InstanceMetrics",
    "LongTaskMessage",
    "LongTaskStatus",
    # color_scheme
    "ColorSchemeModel",
    "ColorSchemeThemeBasedModel",
    "SpaceColorSchemeTypeModel",
    # permission
    "Subject",
    "OperationDescription",
    "SpacePermission",
    "SpacePermissionsForSubject",
    "ContentRestriction",
    # watch
    "ContentWatch",
    "SpaceWatch",
    "JsonContentProperty",
    "JsonSpaceProperty",
]
