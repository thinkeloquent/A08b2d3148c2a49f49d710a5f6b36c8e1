"""User service for JIRA operations."""

from __future__ import annotations

from typing import Optional

from jira_api.core.client import AsyncJiraClient, JiraClient
from jira_api.logger import create_logger
from jira_api.models.user import User

log = create_logger("jira-api", __file__)


class UserService:
    """Service for user-related operations."""

    def __init__(self, client: JiraClient) -> None:
        self.client = client

    def get_user_by_id(self, account_id: str) -> User:
        return self.client.get_user(account_id)

    def get_user_by_email(self, email: str) -> User | None:
        users = self.client.search_users(email, max_results=1)
        for user in users:
            if user.email_address and user.email_address.lower() == email.lower():
                return user
        return None

    def search_users(self, query: str, max_results: int = 50) -> list[User]:
        return self.client.search_users(query, max_results)

    def find_assignable_users_for_projects(
        self,
        project_keys: list[str],
        query: str | None = None,
        max_results: int = 50,
    ) -> list[User]:
        return self.client.find_assignable_users(project_keys, query, max_results)

    def get_user_by_identifier(self, identifier: str) -> User | None:
        try:
            return self.get_user_by_id(identifier)
        except Exception:
            return self.get_user_by_email(identifier)


class AsyncUserService:
    """Async service for user-related operations."""

    def __init__(self, client: AsyncJiraClient) -> None:
        self.client = client

    async def get_user_by_id(self, account_id: str) -> User:
        return await self.client.get_user(account_id)

    async def get_user_by_email(self, email: str) -> User | None:
        users = await self.client.search_users(email, max_results=1)
        for user in users:
            if user.email_address and user.email_address.lower() == email.lower():
                return user
        return None

    async def search_users(self, query: str, max_results: int = 50) -> list[User]:
        return await self.client.search_users(query, max_results)

    async def find_assignable_users_for_projects(
        self,
        project_keys: list[str],
        query: str | None = None,
        max_results: int = 50,
    ) -> list[User]:
        return await self.client.find_assignable_users(project_keys, query, max_results)

    async def get_user_by_identifier(self, identifier: str) -> User | None:
        try:
            return await self.get_user_by_id(identifier)
        except Exception:
            return await self.get_user_by_email(identifier)
