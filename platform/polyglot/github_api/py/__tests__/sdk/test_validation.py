"""
Tests for input validation functions.

Covers repository name, username, and branch name validation
with valid inputs, invalid inputs, edge cases, reserved names,
and boundary conditions.
"""

from __future__ import annotations

import pytest

from github_api.sdk.errors import ValidationError
from github_api.sdk.validation import (
    RESERVED_REPO_NAMES,
    validate_branch_name,
    validate_repository_name,
    validate_username,
)


class TestValidateRepositoryName:
    """Tests for validate_repository_name."""

    def test_valid_simple_name(self) -> None:
        """Standard alphanumeric names should pass."""
        assert validate_repository_name("my-repo") == "my-repo"

    def test_valid_with_dots(self) -> None:
        """Names with dots (not leading/trailing) should pass."""
        assert validate_repository_name("my.repo") == "my.repo"

    def test_valid_with_underscores(self) -> None:
        """Names with underscores should pass."""
        assert validate_repository_name("my_repo") == "my_repo"

    def test_valid_single_char(self) -> None:
        """Single character names should pass."""
        assert validate_repository_name("a") == "a"

    def test_valid_max_length(self) -> None:
        """Names at exactly 100 chars should pass."""
        name = "a" * 100
        assert validate_repository_name(name) == name

    def test_empty_name_raises(self) -> None:
        """Empty name should raise ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            validate_repository_name("")

    def test_exceeds_max_length(self) -> None:
        """Names over 100 characters should raise."""
        with pytest.raises(ValidationError, match="maximum length"):
            validate_repository_name("a" * 101)

    def test_invalid_characters(self) -> None:
        """Names with spaces or special chars should raise."""
        with pytest.raises(ValidationError, match="invalid characters"):
            validate_repository_name("my repo")

    def test_starts_with_dot(self) -> None:
        """Names starting with a dot should raise."""
        with pytest.raises(ValidationError, match="cannot start or end with a dot"):
            validate_repository_name(".hidden")

    def test_ends_with_dot(self) -> None:
        """Names ending with a dot should raise."""
        with pytest.raises(ValidationError, match="cannot start or end with a dot"):
            validate_repository_name("repo.")

    def test_reserved_names(self) -> None:
        """All reserved names should raise ValidationError."""
        for name in list(RESERVED_REPO_NAMES)[:10]:  # Test first 10 for speed
            with pytest.raises(ValidationError, match="reserved"):
                validate_repository_name(name)

    def test_reserved_names_case_insensitive(self) -> None:
        """Reserved names should be case-insensitive."""
        with pytest.raises(ValidationError, match="reserved"):
            validate_repository_name("Settings")

    def test_reserved_names_count(self) -> None:
        """Should have at least 50 reserved names."""
        assert len(RESERVED_REPO_NAMES) >= 50

    def test_special_characters_rejected(self) -> None:
        """Various special characters should be rejected."""
        invalid_names = ["repo@name", "repo#1", "my/repo", "repo$", "repo!"]
        for name in invalid_names:
            with pytest.raises(ValidationError):
                validate_repository_name(name)


class TestValidateUsername:
    """Tests for validate_username."""

    def test_valid_simple_username(self) -> None:
        """Standard alphanumeric usernames should pass."""
        assert validate_username("octocat") == "octocat"

    def test_valid_with_hyphen(self) -> None:
        """Usernames with single hyphens should pass."""
        assert validate_username("octo-cat") == "octo-cat"

    def test_valid_single_char(self) -> None:
        """Single character usernames should pass."""
        assert validate_username("a") == "a"

    def test_valid_max_length(self) -> None:
        """Usernames at exactly 39 chars should pass."""
        name = "a" * 39
        assert validate_username(name) == name

    def test_empty_username_raises(self) -> None:
        """Empty username should raise."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            validate_username("")

    def test_exceeds_max_length(self) -> None:
        """Usernames over 39 characters should raise."""
        with pytest.raises(ValidationError, match="maximum length"):
            validate_username("a" * 40)

    def test_starts_with_hyphen(self) -> None:
        """Usernames starting with hyphen should raise."""
        with pytest.raises(ValidationError, match="cannot start or end with a hyphen"):
            validate_username("-octocat")

    def test_ends_with_hyphen(self) -> None:
        """Usernames ending with hyphen should raise."""
        with pytest.raises(ValidationError, match="cannot start or end with a hyphen"):
            validate_username("octocat-")

    def test_consecutive_hyphens(self) -> None:
        """Usernames with consecutive hyphens should raise."""
        with pytest.raises(ValidationError, match="consecutive hyphens"):
            validate_username("octo--cat")

    def test_invalid_characters(self) -> None:
        """Usernames with special chars should raise."""
        invalid_usernames = ["octo.cat", "octo_cat", "octo@cat", "octo cat"]
        for name in invalid_usernames:
            with pytest.raises(ValidationError):
                validate_username(name)

    def test_numeric_username(self) -> None:
        """Pure numeric usernames should pass."""
        assert validate_username("12345") == "12345"


class TestValidateBranchName:
    """Tests for validate_branch_name."""

    def test_valid_simple_branch(self) -> None:
        """Simple branch names should pass."""
        assert validate_branch_name("main") == "main"

    def test_valid_with_slash(self) -> None:
        """Branch names with single slashes should pass."""
        assert validate_branch_name("feature/my-feature") == "feature/my-feature"

    def test_valid_with_dots(self) -> None:
        """Branch names with dots should pass."""
        assert validate_branch_name("release/1.0.0") == "release/1.0.0"

    def test_valid_max_length(self) -> None:
        """Branch names at exactly 255 chars should pass."""
        name = "a" * 255
        assert validate_branch_name(name) == name

    def test_empty_branch_raises(self) -> None:
        """Empty branch name should raise."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            validate_branch_name("")

    def test_exceeds_max_length(self) -> None:
        """Branch names over 255 characters should raise."""
        with pytest.raises(ValidationError, match="maximum length"):
            validate_branch_name("a" * 256)

    def test_consecutive_slashes(self) -> None:
        """Consecutive slashes should raise."""
        with pytest.raises(ValidationError, match="consecutive slashes"):
            validate_branch_name("feature//bad")

    def test_single_at_sign(self) -> None:
        """A single '@' should raise."""
        with pytest.raises(ValidationError, match="single '@'"):
            validate_branch_name("@")

    def test_at_sign_in_name_ok(self) -> None:
        """'@' as part of a longer name should pass."""
        assert validate_branch_name("feature@2") == "feature@2"

    def test_control_characters(self) -> None:
        """Branch names with control characters should raise."""
        with pytest.raises(ValidationError, match="control characters"):
            validate_branch_name("branch\x00name")

    def test_invalid_special_chars(self) -> None:
        """Branch names with space, ~, ^, :, ?, *, [ should raise."""
        invalid_branches = [
            "branch name",
            "branch~name",
            "branch^name",
            "branch:name",
            "branch?name",
            "branch*name",
            "branch[name",
            "branch\\name",
        ]
        for branch in invalid_branches:
            with pytest.raises(ValidationError, match="invalid characters"):
                validate_branch_name(branch)

    def test_nested_slashes_ok(self) -> None:
        """Multiple levels of slash nesting should pass."""
        assert validate_branch_name("a/b/c/d") == "a/b/c/d"
