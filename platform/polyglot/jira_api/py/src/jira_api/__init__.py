"""JIRA API Python Package.

A comprehensive Python package for interacting with Jira Cloud REST API v3.
Provides multiple interfaces: Direct Import, CLI, FastAPI Server, and SDK Client.
"""

from jira_api.core.client import AsyncJiraClient, JiraClient
from jira_api.exceptions import (
    JiraAPIError,
    JiraAuthenticationError,
    JiraNotFoundError,
    JiraPermissionError,
    JiraValidationError,
)
from jira_api.models.issue import Issue, IssueCreate, IssueUpdate
from jira_api.models.project import Project, ProjectVersion
from jira_api.models.user import User

__version__ = "0.1.0"
__author__ = "Carlos Marte"

__all__ = [
    "AsyncJiraClient",
    "JiraClient",
    "JiraAPIError",
    "JiraAuthenticationError",
    "JiraNotFoundError",
    "JiraPermissionError",
    "JiraValidationError",
    "Issue",
    "IssueCreate",
    "IssueUpdate",
    "Project",
    "ProjectVersion",
    "User",
]
