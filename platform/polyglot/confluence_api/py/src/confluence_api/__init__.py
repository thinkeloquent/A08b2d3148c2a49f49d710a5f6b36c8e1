"""Confluence API Python Package.

A comprehensive Python package for interacting with Confluence Data Center REST API v9.2.3.
Provides a typed HTTP client with automatic pagination, rate-limit handling, and CQL query building.
"""

from confluence_api.config import get_config, get_server_config, load_config_from_env
from confluence_api.core.client import AsyncConfluenceClient, ConfluenceClient
from confluence_api.exceptions import (
    ConfluenceAPIError,
    ConfluenceAuthenticationError,
    ConfluenceConfigurationError,
    ConfluenceConflictError,
    ConfluenceNetworkError,
    ConfluenceNotFoundError,
    ConfluencePermissionError,
    ConfluenceRateLimitError,
    ConfluenceServerError,
    ConfluenceTimeoutError,
    ConfluenceValidationError,
    SDKError,
    create_error_from_response,
)
from confluence_api.logger import create_logger, null_logger

# Models -- re-export all public model classes
from confluence_api.models import (
    # color_scheme
    ColorSchemeModel,
    ColorSchemeThemeBasedModel,
    # search
    ContainerSummary,
    Content,
    ContentBody,
    ContentBodyContainer,
    ContentCreate,
    ContentRestriction,
    ContentUpdate,
    # watch
    ContentWatch,
    Credentials,
    DetailedInvocation,
    DetailedInvocationResult,
    # group
    Group,
    History,
    # content
    Icon,
    InstanceMetrics,
    # backup
    JobDetails,
    JsonContentProperty,
    JsonSpaceProperty,
    # label
    Label,
    LongTaskMessage,
    LongTaskStatus,
    LongTaskSubmission,
    MacroInstance,
    OperationCheckResult,
    OperationDescription,
    PaginatedResponse,
    PaginationLinks,
    PasswordChangeDetails,
    Person,
    ReferenceVersion,
    RestError,
    RestWebhook,
    SearchResult,
    # system
    ServerInformation,
    SiteBackupSettings,
    SiteRestoreSettings,
    # space
    Space,
    SpaceBackupSettings,
    SpaceColorSchemeTypeModel,
    SpaceCreate,
    SpacePermission,
    SpacePermissionsForSubject,
    SpaceRestoreSettings,
    SpaceUpdate,
    SpaceWatch,
    # permission
    Subject,
    UserDetailsForCreation,
    UserKey,
    # user
    UserPerson,
    # common
    ValidationResult,
    Version,
    Webhook,
    WebhookCredentials,
    WebhookEvent,
    # webhook
    WebhookScope,
)
from confluence_api.multipart import build_multipart_data, build_multipart_files, download_binary
from confluence_api.pagination import build_expand, paginate_cursor, paginate_offset
from confluence_api.sdk.client import AsyncConfluenceSDKClient, ConfluenceSDKClient
from confluence_api.services.admin_service import AdminService, AsyncAdminService
from confluence_api.services.attachment_service import AsyncAttachmentService, AttachmentService
from confluence_api.services.backup_service import AsyncBackupService, BackupService
from confluence_api.services.color_scheme_service import AsyncColorSchemeService, ColorSchemeService

# Services
from confluence_api.services.content_service import AsyncContentService, ContentService
from confluence_api.services.group_service import AsyncGroupService, GroupService
from confluence_api.services.label_service import AsyncLabelService, LabelService
from confluence_api.services.search_service import AsyncSearchService, SearchService
from confluence_api.services.space_permission_service import AsyncSpacePermissionService, SpacePermissionService
from confluence_api.services.space_service import AsyncSpaceService, SpaceService
from confluence_api.services.system_service import AsyncSystemService, SystemService
from confluence_api.services.user_service import AsyncUserService, UserService
from confluence_api.services.webhook_service import AsyncWebhookService, WebhookService
from confluence_api.utils.cql_builder import CQLBuilder, cql

__version__ = "1.0.0"

__all__ = [
    # Client
    "ConfluenceClient",
    "AsyncConfluenceClient",
    # Exceptions
    "ConfluenceAPIError",
    "ConfluenceAuthenticationError",
    "ConfluenceConflictError",
    "ConfluenceConfigurationError",
    "ConfluenceNetworkError",
    "ConfluenceNotFoundError",
    "ConfluencePermissionError",
    "ConfluenceRateLimitError",
    "ConfluenceServerError",
    "ConfluenceTimeoutError",
    "ConfluenceValidationError",
    "SDKError",
    "create_error_from_response",
    # Logger
    "create_logger",
    "null_logger",
    # Models -- common
    "ValidationResult",
    "RestError",
    "PaginationLinks",
    "PaginatedResponse",
    "OperationCheckResult",
    # Models -- content
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
    # Models -- space
    "Space",
    "SpaceCreate",
    "SpaceUpdate",
    "LongTaskSubmission",
    # Models -- user
    "UserPerson",
    "UserDetailsForCreation",
    "Credentials",
    "PasswordChangeDetails",
    "UserKey",
    # Models -- group
    "Group",
    # Models -- label
    "Label",
    # Models -- search
    "ContainerSummary",
    "SearchResult",
    # Models -- webhook
    "WebhookScope",
    "WebhookEvent",
    "WebhookCredentials",
    "Webhook",
    "RestWebhook",
    "DetailedInvocationResult",
    "DetailedInvocation",
    # Models -- backup
    "JobDetails",
    "SiteBackupSettings",
    "SpaceBackupSettings",
    "SiteRestoreSettings",
    "SpaceRestoreSettings",
    # Models -- system
    "ServerInformation",
    "InstanceMetrics",
    "LongTaskMessage",
    "LongTaskStatus",
    # Models -- color_scheme
    "ColorSchemeModel",
    "ColorSchemeThemeBasedModel",
    "SpaceColorSchemeTypeModel",
    # Models -- permission
    "Subject",
    "OperationDescription",
    "SpacePermission",
    "SpacePermissionsForSubject",
    "ContentRestriction",
    # Models -- watch
    "ContentWatch",
    "SpaceWatch",
    "JsonContentProperty",
    "JsonSpaceProperty",
    # Services
    "ContentService",
    "AttachmentService",
    "SearchService",
    "SpaceService",
    "SpacePermissionService",
    "UserService",
    "GroupService",
    "AdminService",
    "WebhookService",
    "BackupService",
    "SystemService",
    "LabelService",
    "ColorSchemeService",
    # Async Services
    "AsyncContentService",
    "AsyncAttachmentService",
    "AsyncSearchService",
    "AsyncSpaceService",
    "AsyncSpacePermissionService",
    "AsyncUserService",
    "AsyncGroupService",
    "AsyncAdminService",
    "AsyncWebhookService",
    "AsyncBackupService",
    "AsyncSystemService",
    "AsyncLabelService",
    "AsyncColorSchemeService",
    # Config
    "get_config",
    "get_server_config",
    "load_config_from_env",
    # Pagination
    "paginate_offset",
    "paginate_cursor",
    "build_expand",
    # Multipart
    "build_multipart_files",
    "build_multipart_data",
    "download_binary",
    # CQL Builder
    "CQLBuilder",
    "cql",
    # SDK
    "ConfluenceSDKClient",
    "AsyncConfluenceSDKClient",
    # Version
    "__version__",
]
