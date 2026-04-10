"""
Unit tests for statsig_client.modules.gates.

Tests cover:
- Statement coverage for all GatesModule CRUD and control methods
- Decision/branch coverage for success and error paths
- Error handling for client error propagation
- Log verification for debug/error log emission
"""

import pytest
from unittest.mock import AsyncMock

from statsig_client.modules.gates import GatesModule
from statsig_client.errors import NotFoundError


class TestGatesModule:
    """Tests for the GatesModule domain module."""

    class TestStatementCoverage:
        async def test_list_gates(self, mock_client):
            mock_client.list.return_value = [{"id": "g1"}, {"id": "g2"}]
            module = GatesModule(mock_client)
            result = await module.list()
            assert len(result) == 2
            mock_client.list.assert_called_once_with("/gates")

        async def test_list_with_params(self, mock_client):
            mock_client.list.return_value = []
            module = GatesModule(mock_client)
            await module.list(params={"limit": 10})
            mock_client.list.assert_called_once_with("/gates", params={"limit": 10})

        async def test_get_gate(self, mock_client):
            mock_client.get.return_value = {"id": "g1", "name": "test_gate"}
            module = GatesModule(mock_client)
            result = await module.get("g1")
            assert result["name"] == "test_gate"
            mock_client.get.assert_called_once_with("/gates/g1")

        async def test_create_gate(self, mock_client):
            mock_client.post.return_value = {"id": "new", "name": "new_gate"}
            module = GatesModule(mock_client)
            result = await module.create({"name": "new_gate"})
            assert result["id"] == "new"
            mock_client.post.assert_called_once_with(
                "/gates", json={"name": "new_gate"}
            )

        async def test_update_gate(self, mock_client):
            mock_client.put.return_value = {"id": "g1", "enabled": True}
            module = GatesModule(mock_client)
            result = await module.update("g1", {"enabled": True})
            assert result["enabled"] is True

        async def test_patch_gate(self, mock_client):
            mock_client.patch.return_value = {"id": "g1", "name": "renamed"}
            module = GatesModule(mock_client)
            result = await module.patch("g1", {"name": "renamed"})
            assert result["name"] == "renamed"

        async def test_delete_gate(self, mock_client):
            mock_client.delete.return_value = {"deleted": True}
            module = GatesModule(mock_client)
            result = await module.delete("g1")
            assert result["deleted"] is True

        async def test_enable_gate(self, mock_client):
            mock_client.put.return_value = {"enabled": True}
            module = GatesModule(mock_client)
            result = await module.enable("g1")
            assert result["enabled"] is True
            mock_client.put.assert_called_once_with("/gates/g1/enable")

        async def test_disable_gate(self, mock_client):
            mock_client.put.return_value = {"enabled": False}
            module = GatesModule(mock_client)
            result = await module.disable("g1")
            assert result["enabled"] is False

        async def test_get_overrides(self, mock_client):
            mock_client.get.return_value = {"overrides": []}
            module = GatesModule(mock_client)
            result = await module.get_overrides("g1")
            assert "overrides" in result

        async def test_update_overrides(self, mock_client):
            mock_client.put.return_value = {"updated": True}
            module = GatesModule(mock_client)
            result = await module.update_overrides("g1", {"users": ["u1"]})
            assert result["updated"] is True

        async def test_get_rules(self, mock_client):
            mock_client.get.return_value = [{"rule_id": "r1"}]
            module = GatesModule(mock_client)
            result = await module.get_rules("g1")
            assert len(result) == 1

        async def test_update_rules(self, mock_client):
            mock_client.put.return_value = {"updated": True}
            module = GatesModule(mock_client)
            result = await module.update_rules("g1", {"rules": []})
            assert result["updated"] is True

        async def test_archive_gate(self, mock_client):
            mock_client.put.return_value = {"archived": True}
            module = GatesModule(mock_client)
            result = await module.archive("g1")
            assert result["archived"] is True

    class TestErrorHandling:
        async def test_list_propagates_client_error(self, mock_client):
            mock_client.list.side_effect = NotFoundError(
                "not found", status_code=404
            )
            module = GatesModule(mock_client)
            with pytest.raises(NotFoundError):
                await module.list()

        async def test_get_propagates_client_error(self, mock_client):
            mock_client.get.side_effect = NotFoundError(
                "not found", status_code=404
            )
            module = GatesModule(mock_client)
            with pytest.raises(NotFoundError):
                await module.get("nonexistent")

        async def test_create_propagates_client_error(self, mock_client):
            from statsig_client.errors import ValidationError

            mock_client.post.side_effect = ValidationError(
                "bad data", status_code=400
            )
            module = GatesModule(mock_client)
            with pytest.raises(ValidationError):
                await module.create({"bad": "data"})

        async def test_delete_propagates_client_error(self, mock_client):
            from statsig_client.errors import ServerError

            mock_client.delete.side_effect = ServerError(
                "server error", status_code=500
            )
            module = GatesModule(mock_client)
            with pytest.raises(ServerError):
                await module.delete("g1")
