"""User-domain models."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger
from confluence_api.models.content import Icon

log = create_logger('confluence_api', __file__)


class Person(BaseModel):
    """Extended person model including optional username and userKey fields."""

    model_config = ConfigDict(populate_by_name=True)

    display_name: str = Field("", alias="displayName")
    type: str = ""
    profile_picture: Icon | None = Field(None, alias="profilePicture")
    username: str | None = None
    user_key: str | None = Field(None, alias="userKey")


class UserDetailsForCreation(BaseModel):
    """Payload for creating a new Confluence user."""

    model_config = ConfigDict(populate_by_name=True)

    username: str
    full_name: str = Field(alias="fullName")
    email: str
    password: str
    notify_via_email: bool = Field(True, alias="notifyViaEmail")


class Credentials(BaseModel):
    """Simple password credential wrapper."""

    model_config = ConfigDict(populate_by_name=True)

    password: str


class PasswordChangeDetails(BaseModel):
    """Payload for changing a user password."""

    model_config = ConfigDict(populate_by_name=True)

    old_password: str = Field(alias="oldPassword")
    new_password: str = Field(alias="newPassword")


class UserKey(BaseModel):
    """Wrapper around a Confluence user key."""

    model_config = ConfigDict(populate_by_name=True)

    user_key: str = Field(alias="userKey")
