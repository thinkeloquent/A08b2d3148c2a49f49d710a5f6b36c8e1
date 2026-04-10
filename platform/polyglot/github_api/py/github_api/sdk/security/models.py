"""
Pydantic models for GitHub Security API resources.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "SecurityAnalysis",
    "VulnerabilityAlerts",
    "Ruleset",
    "RulesetCondition",
]


class SecurityAnalysis(BaseModel):
    """Repository security analysis configuration."""

    advanced_security: dict[str, Any] = Field(
        default_factory=dict, description="Advanced security settings"
    )
    secret_scanning: dict[str, Any] = Field(
        default_factory=dict, description="Secret scanning settings"
    )
    secret_scanning_push_protection: dict[str, Any] = Field(
        default_factory=dict, description="Secret scanning push protection settings"
    )
    dependabot_security_updates: dict[str, Any] = Field(
        default_factory=dict, description="Dependabot security update settings"
    )

    model_config = {"extra": "allow"}


class VulnerabilityAlerts(BaseModel):
    """Vulnerability alerts status."""

    enabled: bool = Field(default=False, description="Whether alerts are enabled")

    model_config = {"extra": "allow"}


class RulesetCondition(BaseModel):
    """Condition for when a ruleset applies."""

    ref_name: dict[str, Any] = Field(
        default_factory=dict,
        description="Ref name conditions (include, exclude patterns)",
    )

    model_config = {"extra": "allow"}


class Ruleset(BaseModel):
    """GitHub repository ruleset."""

    id: int = Field(description="Ruleset ID")
    name: str = Field(description="Ruleset name")
    target: str = Field(default="branch", description="Ruleset target (branch, tag)")
    source_type: str = Field(default="Repository", description="Source type")
    source: str = Field(default="", description="Source repository or organization")
    enforcement: str = Field(default="active", description="Enforcement level (active, disabled, evaluate)")
    node_id: str = Field(default="", description="GraphQL node ID")
    bypass_actors: list[dict[str, Any]] = Field(
        default_factory=list, description="Actors that can bypass rules"
    )
    conditions: RulesetCondition | None = Field(
        default=None, description="Conditions for when the ruleset applies"
    )
    rules: list[dict[str, Any]] = Field(
        default_factory=list, description="Rules in this ruleset"
    )
    current_user_can_bypass: str = Field(
        default="never", description="Whether current user can bypass"
    )
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")

    model_config = {"extra": "allow"}
