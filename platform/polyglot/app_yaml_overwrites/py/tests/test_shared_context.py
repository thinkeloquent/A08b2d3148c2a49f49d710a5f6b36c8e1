"""
Tests for SharedContext (Option 5: Shared state between computed functions)
"""
import pytest
import asyncio
from app_yaml_overwrites.shared_context import SharedContext, create_shared_context


class TestSharedContext:
    """Tests for SharedContext basic operations."""

    def test_get_set(self):
        """Test basic get and set operations."""
        ctx = SharedContext()
        ctx.set('key', 'value')
        assert ctx.get('key') == 'value'

    def test_get_default_value(self):
        """Test get returns default value for missing keys."""
        ctx = SharedContext()
        assert ctx.get('missing', 'default') == 'default'
        assert ctx.get('missing') is None

    def test_get_with_callable_default(self):
        """Test get with callable default - invokes and caches."""
        ctx = SharedContext()
        call_count = 0

        def factory():
            nonlocal call_count
            call_count += 1
            return 'created'

        result1 = ctx.get('key', factory)
        result2 = ctx.get('key', factory)  # Should use cached value

        assert result1 == 'created'
        assert result2 == 'created'
        assert call_count == 1  # Factory only called once

    def test_get_or_set_creates(self):
        """Test get_or_set creates value on first call (backwards compat)."""
        ctx = SharedContext()
        call_count = 0

        def factory():
            nonlocal call_count
            call_count += 1
            return 'created'

        result1 = ctx.get_or_set('key', factory)
        result2 = ctx.get_or_set('key', factory)

        assert result1 == 'created'
        assert result2 == 'created'
        assert call_count == 1  # Factory only called once

    def test_has(self):
        """Test has checks existence."""
        ctx = SharedContext()
        ctx.set('exists', True)
        assert ctx.has('exists') is True
        assert ctx.has('missing') is False

    def test_delete(self):
        """Test delete removes keys."""
        ctx = SharedContext()
        ctx.set('key', 'value')
        assert ctx.delete('key') is True
        assert ctx.delete('key') is False  # Already deleted
        assert ctx.has('key') is False

    def test_keys(self):
        """Test keys returns all keys."""
        ctx = SharedContext()
        ctx.set('a', 1)
        ctx.set('b', 2)
        assert sorted(ctx.keys()) == ['a', 'b']

    def test_values(self):
        """Test values returns all values."""
        ctx = SharedContext()
        ctx.set('a', 1)
        ctx.set('b', 2)
        assert sorted(ctx.values()) == [1, 2]

    def test_items(self):
        """Test items returns all key-value pairs."""
        ctx = SharedContext()
        ctx.set('a', 1)
        ctx.set('b', 2)
        items = sorted(ctx.items())
        assert items == [('a', 1), ('b', 2)]

    def test_clear(self):
        """Test clear removes all data."""
        ctx = SharedContext()
        ctx.set('a', 1)
        ctx.set('b', 2)
        ctx.clear()
        assert ctx.keys() == []
        assert len(ctx) == 0

    def test_update(self):
        """Test update adds multiple values."""
        ctx = SharedContext()
        ctx.update({'a': 1, 'b': 2})
        assert ctx.get('a') == 1
        assert ctx.get('b') == 2

    def test_contains(self):
        """Test 'in' operator."""
        ctx = SharedContext()
        ctx.set('exists', True)
        assert 'exists' in ctx
        assert 'missing' not in ctx

    def test_bracket_notation(self):
        """Test bracket notation access."""
        ctx = SharedContext()
        ctx['key'] = 'value'
        assert ctx['key'] == 'value'

    def test_len(self):
        """Test len returns item count."""
        ctx = SharedContext()
        assert len(ctx) == 0
        ctx.set('a', 1)
        ctx.set('b', 2)
        assert len(ctx) == 2

    def test_factory_function(self):
        """Test create_shared_context factory."""
        ctx = create_shared_context()
        assert isinstance(ctx, SharedContext)


class TestSharedContextIntegration:
    """Integration tests simulating computed function usage."""

    def test_functions_share_timestamp_with_get(self):
        """Simulate two functions sharing a timestamp via unified .get() API."""
        ctx = {
            'shared': SharedContext(),
            'app': {'name': 'test', 'version': '1.0.0'}
        }

        def func1(ctx):
            """First function - creates timestamp."""
            ts = ctx['shared'].get('ts', lambda: 12345)
            return f"func1_{ts}"

        def func2(ctx):
            """Second function - reuses timestamp."""
            ts = ctx['shared'].get('ts', lambda: 99999)
            return f"func2_{ts}"

        result1 = func1(ctx)
        result2 = func2(ctx)

        # Both should use the same timestamp (12345, not 99999)
        assert result1 == 'func1_12345'
        assert result2 == 'func2_12345'

    def test_functions_order_independent(self):
        """Verify order independence - second function first still works."""
        ctx = {
            'shared': SharedContext(),
            'app': {'name': 'test', 'version': '1.0.0'}
        }

        def func1(ctx):
            ts = ctx['shared'].get('ts', lambda: 11111)
            return f"func1_{ts}"

        def func2(ctx):
            ts = ctx['shared'].get('ts', lambda: 22222)
            return f"func2_{ts}"

        # Call func2 first this time
        result2 = func2(ctx)
        result1 = func1(ctx)

        # Both should use 22222 (from func2's factory)
        assert result2 == 'func2_22222'
        assert result1 == 'func1_22222'

    def test_separate_contexts_are_isolated(self):
        """Verify separate resolution passes have isolated state."""
        ctx1 = {'shared': SharedContext()}
        ctx2 = {'shared': SharedContext()}

        def set_timestamp(ctx, value):
            return ctx['shared'].get('ts', lambda: value)

        ts1 = set_timestamp(ctx1, 1111)
        ts2 = set_timestamp(ctx2, 2222)

        assert ts1 == 1111
        assert ts2 == 2222  # Different context, different value


class TestParentContext:
    """Tests for parent context inheritance."""

    def test_child_inherits_from_parent(self):
        """Test that child context can access parent values."""
        parent = SharedContext()
        parent.set('startup_ts', 12345)
        parent.register('generator', 'MyGenerator')

        child = parent.create_child()

        # Child should be able to access parent values
        assert child.get('startup_ts') == 12345
        assert child.get('generator') == 'MyGenerator'

    def test_child_overrides_parent(self):
        """Test that child values override parent values."""
        parent = SharedContext()
        parent.set('value', 'parent_value')

        child = parent.create_child()
        child.set('value', 'child_value')

        assert child.get('value') == 'child_value'
        assert parent.get('value') == 'parent_value'  # Parent unchanged

    def test_child_does_not_affect_parent(self):
        """Test that setting in child doesn't affect parent."""
        parent = SharedContext()
        child = parent.create_child()

        child.set('new_key', 'child_only')

        assert child.get('new_key') == 'child_only'
        assert parent.get('new_key') is None


class TestRegisterAndUtils:
    """Tests for register() and utilities."""

    def test_register_utility(self):
        """Test registering a utility class."""
        ctx = SharedContext()

        class TokenGenerator:
            def generate(self, base):
                return f"token_{base}"

        gen = TokenGenerator()
        ctx.register('generator', gen)

        retrieved = ctx.get('generator')
        assert retrieved is gen
        assert retrieved.generate('test') == 'token_test'

    def test_register_chaining(self):
        """Test that register returns self for chaining."""
        ctx = SharedContext()
        result = ctx.register('a', 1).register('b', 2).register('c', 3)

        assert result is ctx
        assert ctx.get('a') == 1
        assert ctx.get('b') == 2
        assert ctx.get('c') == 3

    def test_get_utils(self):
        """Test get_utils returns all registered utilities."""
        ctx = SharedContext()
        ctx.register('gen1', 'Generator1')
        ctx.register('gen2', 'Generator2')

        utils = ctx.get_utils()
        assert utils == {'gen1': 'Generator1', 'gen2': 'Generator2'}

    def test_get_utils_includes_parent(self):
        """Test get_utils includes parent utilities."""
        parent = SharedContext()
        parent.register('parent_util', 'ParentUtil')

        child = parent.create_child()
        child.register('child_util', 'ChildUtil')

        utils = child.get_utils()
        assert 'parent_util' in utils
        assert 'child_util' in utils


class TestAsyncSupport:
    """Tests for async get_async()."""

    @pytest.mark.asyncio
    async def test_get_async_with_sync_factory(self):
        """Test get_async with synchronous factory."""
        ctx = SharedContext()

        result = await ctx.get_async('key', lambda: 'sync_value')
        assert result == 'sync_value'

    @pytest.mark.asyncio
    async def test_get_async_with_async_factory(self):
        """Test get_async with async factory."""
        ctx = SharedContext()

        async def async_factory():
            await asyncio.sleep(0.01)
            return 'async_value'

        result = await ctx.get_async('key', async_factory)
        assert result == 'async_value'

    @pytest.mark.asyncio
    async def test_get_async_caches_result(self):
        """Test that get_async caches the result."""
        ctx = SharedContext()
        call_count = 0

        async def factory():
            nonlocal call_count
            call_count += 1
            return 'cached'

        result1 = await ctx.get_async('key', factory)
        result2 = await ctx.get_async('key', factory)

        assert result1 == 'cached'
        assert result2 == 'cached'
        assert call_count == 1
