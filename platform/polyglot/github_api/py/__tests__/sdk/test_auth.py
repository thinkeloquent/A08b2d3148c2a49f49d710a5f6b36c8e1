"""
Tests for token resolution, masking, and type detection.

Covers explicit tokens, environment variable resolution,
token type detection for all prefix types, masking,
and error handling when no token is found.
"""

from __future__ import annotations

import os
from unittest.mock import patch

import pytest

from github_api.sdk.auth import TokenInfo, mask_token, resolve_token
from github_api.sdk.errors import AuthError


class TestResolveToken:
    """Tests for resolve_token."""

    def test_explicit_token(self) -> None:
        """Should use the explicit token when provided."""
        info = resolve_token("ghp_explicit1234567890123456789012")
        assert info.token == "ghp_explicit1234567890123456789012"
        assert info.source == "explicit"

    def test_env_github_token(self) -> None:
        """Should resolve GITHUB_TOKEN from environment."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "ghp_envtoken1234567890123456789012"}, clear=False):
            info = resolve_token()
            assert info.token == "ghp_envtoken1234567890123456789012"
            assert info.source == "GITHUB_TOKEN"

    def test_env_gh_token(self) -> None:
        """Should resolve GH_TOKEN if GITHUB_TOKEN is not set."""
        env = {"GH_TOKEN": "ghp_ghtoken1234567890123456789012"}
        with patch.dict(os.environ, env, clear=True):
            info = resolve_token()
            assert info.source == "GH_TOKEN"

    def test_env_github_access_token(self) -> None:
        """Should resolve GITHUB_ACCESS_TOKEN as third priority."""
        env = {"GITHUB_ACCESS_TOKEN": "ghp_access1234567890123456789012"}
        with patch.dict(os.environ, env, clear=True):
            info = resolve_token()
            assert info.source == "GITHUB_ACCESS_TOKEN"

    def test_env_github_pat(self) -> None:
        """Should resolve GITHUB_PAT as last priority."""
        env = {"GITHUB_PAT": "ghp_pat000123456789012345678901"}
        with patch.dict(os.environ, env, clear=True):
            info = resolve_token()
            assert info.source == "GITHUB_PAT"

    def test_env_priority_order(self) -> None:
        """GITHUB_TOKEN should take priority over GH_TOKEN."""
        env = {
            "GITHUB_TOKEN": "ghp_first12345678901234567890123",
            "GH_TOKEN": "ghp_second1234567890123456789012",
        }
        with patch.dict(os.environ, env, clear=True):
            info = resolve_token()
            assert info.source == "GITHUB_TOKEN"
            assert info.token == "ghp_first12345678901234567890123"

    def test_explicit_takes_priority_over_env(self) -> None:
        """Explicit token should take priority over environment."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "ghp_envtoken1234567890123456789012"}):
            info = resolve_token("ghp_explicit1234567890123456789012")
            assert info.source == "explicit"

    def test_no_token_raises(self) -> None:
        """Should raise AuthError when no token is available."""
        with patch.dict(os.environ, {}, clear=True):
            for var in ("GITHUB_TOKEN", "GH_TOKEN", "GITHUB_ACCESS_TOKEN", "GITHUB_PAT"):
                os.environ.pop(var, None)
            with pytest.raises(AuthError, match="No GitHub token found"):
                resolve_token()


class TestTokenTypeDetection:
    """Tests for token type detection via resolve_token."""

    def test_fine_grained_token(self) -> None:
        """Should detect fine-grained tokens (github_pat_ prefix)."""
        info = resolve_token("github_pat_test1234567890123456789012")
        assert info.type == "fine-grained"

    def test_classic_pat(self) -> None:
        """Should detect classic PATs (ghp_ prefix)."""
        info = resolve_token("ghp_classic1234567890123456789012")
        assert info.type == "classic-pat"

    def test_oauth_token(self) -> None:
        """Should detect OAuth tokens (gho_ prefix)."""
        info = resolve_token("gho_oauthtoken123456789012345678")
        assert info.type == "oauth"

    def test_user_to_server_token(self) -> None:
        """Should detect user-to-server tokens (ghu_ prefix)."""
        info = resolve_token("ghu_usertoken1234567890123456789")
        assert info.type == "user-to-server"

    def test_server_to_server_token(self) -> None:
        """Should detect server-to-server tokens (ghs_ prefix)."""
        info = resolve_token("ghs_servertoken12345678901234567")
        assert info.type == "server-to-server"

    def test_legacy_token(self) -> None:
        """Should detect legacy 40-hex-char tokens."""
        info = resolve_token("a" * 40)
        assert info.type == "legacy"

    def test_unknown_token_type(self) -> None:
        """Should return 'unknown' for unrecognized token formats."""
        info = resolve_token("some-random-token-format")
        assert info.type == "unknown"


class TestMaskToken:
    """Tests for mask_token."""

    def test_mask_normal_token(self) -> None:
        """Should show first 4 and last 4 characters."""
        masked = mask_token("ghp_1234567890abcdefghij")
        assert masked.startswith("ghp_")
        assert masked.endswith("ghij")
        assert "*" in masked

    def test_mask_short_token(self) -> None:
        """Tokens with 8 or fewer chars should be fully masked."""
        assert mask_token("short") == "****"
        assert mask_token("12345678") == "****"

    def test_mask_preserves_length_info(self) -> None:
        """Masked token should indicate approximate original length."""
        token = "ghp_1234567890123456789012345678"
        masked = mask_token(token)
        assert len(masked) == len(token)

    def test_mask_exactly_9_chars(self) -> None:
        """Token of length 9 should show first 4, 1 asterisk, last 4."""
        masked = mask_token("123456789")
        assert masked == "1234*6789"


class TestTokenInfo:
    """Tests for TokenInfo dataclass."""

    def test_repr_masks_token(self) -> None:
        """TokenInfo repr should use masked token."""
        info = TokenInfo(
            token="ghp_1234567890abcdefghijklmnopqrs",
            source="explicit",
            type="classic-pat",
        )
        repr_str = repr(info)
        assert "ghp_1234567890abcdefghijklmnopqrs" not in repr_str
        assert "ghp_" in repr_str
        assert "explicit" in repr_str
