"""
Tests for Property Access Pattern (Option 4: {{fn:name.property}})
"""
import pytest
from app_yaml_overwrites.compute_registry import ComputeRegistry, create_registry
from app_yaml_overwrites.template_resolver import TemplateResolver, create_resolver
from app_yaml_overwrites.options import ComputeScope


class TestPropertyAccess:
    """Tests for computed function property access via dot notation."""

    @pytest.fixture
    def registry(self):
        """Create registry with a composite function."""
        reg = create_registry()
        reg.register("tokens", lambda ctx: {
            "case_001": "token_001",
            "case_005": "token_005",
            "nested": {"deep": {"value": "found"}},
            "timestamp": 1234567890
        }, ComputeScope.STARTUP)
        return reg

    @pytest.fixture
    def resolver(self, registry):
        """Create resolver with the registry."""
        return create_resolver(registry)

    @pytest.mark.asyncio
    async def test_property_access_simple(self, resolver):
        """Test accessing a simple property."""
        result = await resolver.resolve(
            "{{fn:tokens.case_001}}",
            {},
            ComputeScope.STARTUP
        )
        assert result == "token_001"

    @pytest.mark.asyncio
    async def test_property_access_another_property(self, resolver):
        """Test accessing a different property from same function."""
        result = await resolver.resolve(
            "{{fn:tokens.case_005}}",
            {},
            ComputeScope.STARTUP
        )
        assert result == "token_005"

    @pytest.mark.asyncio
    async def test_property_access_nested(self, resolver):
        """Test accessing nested property via dot notation."""
        result = await resolver.resolve(
            "{{fn:tokens.nested.deep.value}}",
            {},
            ComputeScope.STARTUP
        )
        assert result == "found"

    @pytest.mark.asyncio
    async def test_property_access_with_default(self, resolver):
        """Test that default value is used for missing property."""
        result = await resolver.resolve(
            '{{fn:tokens.missing | "fallback"}}',
            {},
            ComputeScope.STARTUP
        )
        assert result == "fallback"

    @pytest.mark.asyncio
    async def test_property_access_whole_object(self, resolver):
        """Test accessing the whole object (no property path)."""
        result = await resolver.resolve(
            "{{fn:tokens}}",
            {},
            ComputeScope.STARTUP
        )
        assert isinstance(result, dict)
        assert result["case_001"] == "token_001"
        assert result["case_005"] == "token_005"

    @pytest.mark.asyncio
    async def test_property_access_numeric(self, resolver):
        """Test accessing a numeric property."""
        result = await resolver.resolve(
            "{{fn:tokens.timestamp}}",
            {},
            ComputeScope.STARTUP
        )
        assert result == 1234567890

    @pytest.mark.asyncio
    async def test_property_access_missing_returns_none(self, resolver):
        """Test that missing property without default returns None."""
        result = await resolver.resolve(
            "{{fn:tokens.nonexistent}}",
            {},
            ComputeScope.STARTUP
        )
        assert result is None


class TestPropertyAccessIntegration:
    """Integration tests for property access with context."""

    @pytest.mark.asyncio
    async def test_composite_function_with_context(self):
        """Test a composite function that uses context values."""
        registry = create_registry()

        def composite_fn(ctx):
            app_name = ctx.get("app", {}).get("name", "unknown")
            return {
                "app_token": f"tok_{app_name}",
                "version_token": f"ver_{ctx.get('app', {}).get('version', '0.0.0')}"
            }

        registry.register("app_tokens", composite_fn, ComputeScope.STARTUP)
        resolver = create_resolver(registry)

        context = {
            "app": {"name": "myapp", "version": "1.2.3"}
        }

        result1 = await resolver.resolve(
            "{{fn:app_tokens.app_token}}",
            context,
            ComputeScope.STARTUP
        )
        result2 = await resolver.resolve(
            "{{fn:app_tokens.version_token}}",
            context,
            ComputeScope.STARTUP
        )

        assert result1 == "tok_myapp"
        assert result2 == "ver_1.2.3"

    @pytest.mark.asyncio
    async def test_dataclass_like_object(self):
        """Test property access on dataclass-like objects."""
        from dataclasses import dataclass

        @dataclass
        class TokenResult:
            case_001: str
            case_005: str

            def __getitem__(self, key):
                return getattr(self, key, None)

        registry = create_registry()
        registry.register("dataclass_tokens", lambda ctx: TokenResult(
            case_001="dc_001",
            case_005="dc_005"
        ), ComputeScope.STARTUP)

        resolver = create_resolver(registry)

        result = await resolver.resolve(
            "{{fn:dataclass_tokens.case_001}}",
            {},
            ComputeScope.STARTUP
        )
        assert result == "dc_001"


class TestPatternMatching:
    """Tests for the updated COMPUTE_PATTERN regex."""

    def test_pattern_matches_simple(self):
        """Test pattern matches simple function reference."""
        pattern = TemplateResolver.COMPUTE_PATTERN
        match = pattern.match("{{fn:my_func}}")
        assert match is not None
        assert match.group(1) == "my_func"
        assert match.group(2) is None  # No property path

    def test_pattern_matches_with_property(self):
        """Test pattern matches function with property."""
        pattern = TemplateResolver.COMPUTE_PATTERN
        match = pattern.match("{{fn:tokens.case_001}}")
        assert match is not None
        assert match.group(1) == "tokens"
        assert match.group(2) == "case_001"

    def test_pattern_matches_nested_property(self):
        """Test pattern matches function with nested property."""
        pattern = TemplateResolver.COMPUTE_PATTERN
        match = pattern.match("{{fn:tokens.nested.deep.value}}")
        assert match is not None
        assert match.group(1) == "tokens"
        assert match.group(2) == "nested.deep.value"

    def test_pattern_matches_with_default(self):
        """Test pattern matches function with default value."""
        pattern = TemplateResolver.COMPUTE_PATTERN
        match = pattern.match('{{fn:tokens.missing | "fallback"}}')
        assert match is not None
        assert match.group(1) == "tokens"
        assert match.group(2) == "missing"
        assert match.group(4) == "fallback"

    def test_pattern_matches_simple_with_default(self):
        """Test pattern matches simple function with default."""
        pattern = TemplateResolver.COMPUTE_PATTERN
        match = pattern.match('{{fn:my_func | "default"}}')
        assert match is not None
        assert match.group(1) == "my_func"
        assert match.group(2) is None
        assert match.group(4) == "default"
