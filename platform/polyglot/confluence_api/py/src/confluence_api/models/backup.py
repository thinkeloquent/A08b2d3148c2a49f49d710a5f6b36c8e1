"""Backup and restore domain models."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from confluence_api.logger import create_logger

log = create_logger('confluence_api', __file__)


class JobDetails(BaseModel):
    """Status details for a backup or restore job."""

    model_config = ConfigDict(populate_by_name=True)

    job_id: str | None = Field(None, alias="jobId")
    job_operation: str | None = Field(None, alias="jobOperation")
    job_scope: str | None = Field(None, alias="jobScope")
    job_state: str | None = Field(None, alias="jobState")
    owner: str | None = None
    space_key: str | None = Field(None, alias="spaceKey")


class SiteBackupSettings(BaseModel):
    """Settings for initiating a full site backup."""

    model_config = ConfigDict(populate_by_name=True)

    cb_attachments: bool = Field(True, alias="cbAttachments")
    backup_location: str | None = Field(None, alias="backupLocation")


class SpaceBackupSettings(BaseModel):
    """Settings for initiating a single-space backup."""

    model_config = ConfigDict(populate_by_name=True)

    space_key: str = Field(alias="spaceKey")
    cb_attachments: bool = Field(True, alias="cbAttachments")


class SiteRestoreSettings(BaseModel):
    """Settings for restoring a full site from a backup file."""

    model_config = ConfigDict(populate_by_name=True)

    file_name: str = Field(alias="fileName")


class SpaceRestoreSettings(BaseModel):
    """Settings for restoring a single space from a backup file."""

    model_config = ConfigDict(populate_by_name=True)

    file_name: str = Field(alias="fileName")
    space_key: str | None = Field(None, alias="spaceKey")
