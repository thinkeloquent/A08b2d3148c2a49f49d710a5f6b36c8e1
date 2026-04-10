"""Pydantic models for JIRA user entities."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class User(BaseModel):
    """JIRA User model."""

    account_id: str = Field(..., alias="accountId", description="The account ID of the user")
    email_address: str | None = Field(None, alias="emailAddress")
    display_name: str = Field(..., alias="displayName")
    active: bool = Field(True)
    avatar_urls: dict[str, str] | None = Field(None, alias="avatarUrls")
    time_zone: str | None = Field(None, alias="timeZone")
    locale: str | None = Field(None)

    model_config = {"populate_by_name": True}


class UserSearch(BaseModel):
    """User search parameters."""

    query: str
    project_keys: str | None = None
    start_at: int = 0
    max_results: int = 50


class UserSearchResult(BaseModel):
    """User search results."""

    users: list[User] = Field(default_factory=list)
    total: int = 0
    start_at: int = 0
    max_results: int = 50
