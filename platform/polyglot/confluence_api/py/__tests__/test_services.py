"""
Unit tests for confluence_api.services module.

Tests cover:
- Statement coverage for service constructor and key methods
- Branch coverage for optional parameters
- Error handling with mocked client exceptions
"""

from unittest.mock import MagicMock

import pytest

from confluence_api.exceptions import ConfluenceNotFoundError
from confluence_api.services.admin_service import AdminService
from confluence_api.services.attachment_service import AttachmentService
from confluence_api.services.backup_service import BackupService
from confluence_api.services.color_scheme_service import ColorSchemeService
from confluence_api.services.content_service import ContentService
from confluence_api.services.group_service import GroupService
from confluence_api.services.label_service import LabelService
from confluence_api.services.search_service import SearchService
from confluence_api.services.space_permission_service import SpacePermissionService
from confluence_api.services.space_service import SpaceService
from confluence_api.services.system_service import SystemService
from confluence_api.services.user_service import UserService
from confluence_api.services.webhook_service import WebhookService


class TestContentService:
    """Tests for ContentService."""

    class TestStatementCoverage:

        def test_constructor_stores_client(self, mock_client):
            svc = ContentService(mock_client)
            assert svc._client is mock_client

        def test_get_content(self, mock_client):
            mock_client.get.return_value = {"id": "123", "title": "Test Page", "type": "page"}
            svc = ContentService(mock_client)
            result = svc.get_content("123")
            assert result["id"] == "123"
            mock_client.get.assert_called_once()

        def test_get_content_with_expand(self, mock_client):
            mock_client.get.return_value = {"id": "123", "body": {"storage": {"value": "<p>Hi</p>"}}}
            svc = ContentService(mock_client)
            result = svc.get_content("123", expand="body.storage")
            assert result["id"] == "123"
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_contents(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "1"}, {"id": "2"}], "size": 2}
            svc = ContentService(mock_client)
            result = svc.get_contents()
            assert len(result["results"]) == 2

        def test_create_content(self, mock_client):
            mock_client.post.return_value = {"id": "456", "title": "New Page"}
            svc = ContentService(mock_client)
            result = svc.create_content({
                "type": "page",
                "title": "New Page",
                "space": {"key": "DEV"},
                "body": {"storage": {"value": "<p>Content</p>", "representation": "storage"}},
            })
            assert result["id"] == "456"
            mock_client.post.assert_called_once()

        def test_update_content(self, mock_client):
            mock_client.put.return_value = {"id": "123", "title": "Updated", "version": {"number": 2}}
            svc = ContentService(mock_client)
            result = svc.update_content("123", {
                "version": {"number": 2},
                "title": "Updated",
                "type": "page",
                "body": {"storage": {"value": "<p>Updated</p>", "representation": "storage"}},
            })
            assert result["title"] == "Updated"
            mock_client.put.assert_called_once()

        def test_delete_content(self, mock_client):
            mock_client.delete.return_value = None
            svc = ContentService(mock_client)
            svc.delete_content("123")
            mock_client.delete.assert_called_once()

        def test_get_content_history(self, mock_client):
            mock_client.get.return_value = {"latest": True, "createdBy": {"displayName": "Admin"}}
            svc = ContentService(mock_client)
            result = svc.get_content_history("123")
            assert result["latest"] is True
            mock_client.get.assert_called_once()

        def test_get_content_history_with_expand(self, mock_client):
            mock_client.get.return_value = {"latest": True, "previousVersion": {"number": 1}}
            svc = ContentService(mock_client)
            result = svc.get_content_history("123", expand="previousVersion")
            assert "previousVersion" in result
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_macro_by_id(self, mock_client):
            mock_client.get.return_value = {"id": "macro-1", "name": "code"}
            svc = ContentService(mock_client)
            result = svc.get_macro_by_id("123", 2, "macro-1")
            assert result["id"] == "macro-1"
            mock_client.get.assert_called_once()

        def test_get_child_content(self, mock_client):
            mock_client.get.return_value = {"page": {"results": []}, "comment": {"results": []}}
            svc = ContentService(mock_client)
            result = svc.get_child_content("123")
            assert "page" in result
            mock_client.get.assert_called_once()

        def test_get_child_content_with_expand(self, mock_client):
            mock_client.get.return_value = {"page": {"results": []}}
            svc = ContentService(mock_client)
            svc.get_child_content("123", expand="page")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_child_content_by_type(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "child-1"}], "size": 1}
            svc = ContentService(mock_client)
            result = svc.get_child_content_by_type("123", "page")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_child_content_by_type_with_pagination(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_child_content_by_type("123", "comment", expand="body.storage", start=10, limit=5)
            call_args = mock_client.get.call_args
            assert "10" in str(call_args) or "start" in str(call_args)

        def test_get_child_comments(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "comment-1"}], "size": 1}
            svc = ContentService(mock_client)
            result = svc.get_child_comments("123")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_child_comments_with_all_params(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_child_comments("123", expand="body", start=5, limit=10, depth="all", location="inline")
            call_args = mock_client.get.call_args
            assert "inline" in str(call_args)

        def test_get_descendants(self, mock_client):
            mock_client.get.return_value = {"page": {"results": []}}
            svc = ContentService(mock_client)
            result = svc.get_descendants("123")
            assert "page" in result
            mock_client.get.assert_called_once()

        def test_get_descendants_with_expand(self, mock_client):
            mock_client.get.return_value = {"page": {"results": []}}
            svc = ContentService(mock_client)
            svc.get_descendants("123", expand="page")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_descendants_by_type(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "desc-1"}], "size": 1}
            svc = ContentService(mock_client)
            result = svc.get_descendants_by_type("123", "page")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_descendants_by_type_with_expand(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_descendants_by_type("123", "comment", expand="body")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_labels(self, mock_client):
            mock_client.get.return_value = {"results": [{"name": "tag1"}], "size": 1}
            svc = ContentService(mock_client)
            result = svc.get_labels("123")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_labels_with_prefix(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_labels("123", prefix="global", start=0, limit=10)
            call_args = mock_client.get.call_args
            assert "global" in str(call_args)

        def test_add_labels(self, mock_client):
            mock_client.post.return_value = {"results": [{"name": "label1"}]}
            svc = ContentService(mock_client)
            labels = [{"prefix": "global", "name": "label1"}]
            result = svc.add_labels("123", labels)
            assert result["results"][0]["name"] == "label1"
            mock_client.post.assert_called_once()

        def test_delete_label_by_name(self, mock_client):
            mock_client.delete.return_value = None
            svc = ContentService(mock_client)
            svc.delete_label_by_name("123", "old-label")
            mock_client.delete.assert_called_once()

        def test_delete_label(self, mock_client):
            mock_client.delete.return_value = None
            svc = ContentService(mock_client)
            svc.delete_label("123", "old-label")
            mock_client.delete.assert_called_once()

        def test_get_properties(self, mock_client):
            mock_client.get.return_value = {"results": [{"key": "prop1"}], "size": 1}
            svc = ContentService(mock_client)
            result = svc.get_properties("123")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_properties_with_expand(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_properties("123", expand="version")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_create_property(self, mock_client):
            mock_client.post.return_value = {"key": "myprop", "value": {"data": 1}}
            svc = ContentService(mock_client)
            result = svc.create_property("123", {"key": "myprop", "value": {"data": 1}})
            assert result["key"] == "myprop"
            mock_client.post.assert_called_once()

        def test_get_property(self, mock_client):
            mock_client.get.return_value = {"key": "myprop", "value": {"data": 1}}
            svc = ContentService(mock_client)
            result = svc.get_property("123", "myprop")
            assert result["key"] == "myprop"
            mock_client.get.assert_called_once()

        def test_get_property_with_expand(self, mock_client):
            mock_client.get.return_value = {"key": "myprop", "version": {"number": 1}}
            svc = ContentService(mock_client)
            svc.get_property("123", "myprop", expand="version")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_update_property(self, mock_client):
            mock_client.put.return_value = {"key": "myprop", "value": {"data": 2}}
            svc = ContentService(mock_client)
            result = svc.update_property("123", "myprop", {"value": {"data": 2}, "version": {"number": 2}})
            assert result["value"]["data"] == 2
            mock_client.put.assert_called_once()

        def test_create_property_for_key(self, mock_client):
            mock_client.post.return_value = {"key": "myprop", "value": {"data": 1}}
            svc = ContentService(mock_client)
            result = svc.create_property_for_key("123", "myprop", {"value": {"data": 1}})
            assert result["key"] == "myprop"
            mock_client.post.assert_called_once()

        def test_delete_property(self, mock_client):
            mock_client.delete.return_value = None
            svc = ContentService(mock_client)
            svc.delete_property("123", "myprop")
            mock_client.delete.assert_called_once()

        def test_get_restrictions_by_operation(self, mock_client):
            mock_client.get.return_value = {"read": {"restrictions": {"user": []}}}
            svc = ContentService(mock_client)
            result = svc.get_restrictions_by_operation("123")
            assert "read" in result
            mock_client.get.assert_called_once()

        def test_get_restrictions_for_operation(self, mock_client):
            mock_client.get.return_value = {"restrictions": {"user": [], "group": []}}
            svc = ContentService(mock_client)
            result = svc.get_restrictions_for_operation("123", "update")
            assert "restrictions" in result
            mock_client.get.assert_called_once()

        def test_update_restrictions(self, mock_client):
            restrictions_data = [{"operation": "update", "restrictions": {"user": [{"type": "known", "username": "admin"}]}}]
            mock_client.put.return_value = {"results": restrictions_data}
            svc = ContentService(mock_client)
            result = svc.update_restrictions("123", restrictions_data)
            assert "results" in result
            mock_client.put.assert_called_once()

        def test_convert_content_body(self, mock_client):
            mock_client.post.return_value = {"value": "<p>Converted</p>", "representation": "storage"}
            svc = ContentService(mock_client)
            result = svc.convert_content_body("storage", {"value": "Converted", "representation": "wiki"})
            assert result["representation"] == "storage"
            mock_client.post.assert_called_once()

        def test_delete_content_version(self, mock_client):
            mock_client.delete.return_value = None
            svc = ContentService(mock_client)
            svc.delete_content_version("123", 3)
            mock_client.delete.assert_called_once()

        def test_publish_shared_draft(self, mock_client):
            mock_client.post.return_value = {"id": "draft-1", "status": "current"}
            svc = ContentService(mock_client)
            result = svc.publish_shared_draft("draft-1", {"status": "current"})
            assert result["status"] == "current"
            mock_client.post.assert_called_once()

        def test_publish_legacy_draft(self, mock_client):
            mock_client.post.return_value = {"id": "draft-2", "status": "current"}
            svc = ContentService(mock_client)
            result = svc.publish_legacy_draft("draft-2", {"status": "current"})
            assert result["status"] == "current"
            mock_client.post.assert_called_once()

    class TestBranchCoverage:

        def test_get_contents_with_type_filter(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_contents(type="page")
            call_args = mock_client.get.call_args
            assert "page" in str(call_args)

        def test_get_contents_with_space_key(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = ContentService(mock_client)
            svc.get_contents(space_key="DEV")
            call_args = mock_client.get.call_args
            assert "DEV" in str(call_args)

    class TestErrorHandling:

        def test_get_content_raises_on_404(self, mock_client):
            mock_client.get.side_effect = ConfluenceNotFoundError("Content 999 not found")
            svc = ContentService(mock_client)
            with pytest.raises(ConfluenceNotFoundError):
                svc.get_content("999")


class TestSearchService:
    """Tests for SearchService."""

    class TestStatementCoverage:

        def test_constructor_stores_client(self, mock_client):
            svc = SearchService(mock_client)
            assert svc._client is mock_client

        def test_search_content(self, mock_client):
            mock_client.get.return_value = {"results": [{"title": "Found"}], "totalSize": 1}
            svc = SearchService(mock_client)
            result = svc.search_content('type = "page"')
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_search(self, mock_client):
            mock_client.get.return_value = {"results": [{"title": "Result"}], "totalSize": 1}
            svc = SearchService(mock_client)
            result = svc.search('type = "page"')
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_search_with_all_params(self, mock_client):
            mock_client.get.return_value = {"results": [], "totalSize": 0}
            svc = SearchService(mock_client)
            svc.search(
                'type = "page"',
                cqlcontext='{"spaceKey":"DEV"}',
                excerpt="highlight",
                expand="content.body",
                start=10,
                limit=50,
            )
            call_args = mock_client.get.call_args
            assert "highlight" in str(call_args)

        def test_scan_content(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "1"}], "cursor": "abc123"}
            svc = SearchService(mock_client)
            result = svc.scan_content()
            assert "cursor" in result
            mock_client.get.assert_called_once()

        def test_scan_content_with_cursor(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "2"}], "cursor": "def456"}
            svc = SearchService(mock_client)
            result = svc.scan_content(cursor="abc123", limit=50)
            assert result["cursor"] == "def456"
            call_args = mock_client.get.call_args
            assert "abc123" in str(call_args)

    class TestBranchCoverage:

        def test_search_with_limit_and_start(self, mock_client):
            mock_client.get.return_value = {"results": [], "totalSize": 0}
            svc = SearchService(mock_client)
            svc.search_content('space = "DEV"', limit=10, start=5)
            call_args = mock_client.get.call_args
            assert "10" in str(call_args) or "limit" in str(call_args)


class TestSpaceService:
    """Tests for SpaceService."""

    class TestStatementCoverage:

        def test_get_spaces(self, mock_client):
            mock_client.get.return_value = {"results": [{"key": "DEV"}], "size": 1}
            svc = SpaceService(mock_client)
            result = svc.get_spaces()
            assert len(result["results"]) == 1

        def test_get_space(self, mock_client):
            mock_client.get.return_value = {"key": "DEV", "name": "Development"}
            svc = SpaceService(mock_client)
            result = svc.get_space("DEV")
            assert result["key"] == "DEV"

        def test_create_space(self, mock_client):
            mock_client.post.return_value = {"key": "NEW", "name": "New Space"}
            svc = SpaceService(mock_client)
            result = svc.create_space({"key": "NEW", "name": "New Space"})
            assert result["key"] == "NEW"

        def test_delete_space(self, mock_client):
            mock_client.delete.return_value = {"id": "task-123"}
            svc = SpaceService(mock_client)
            result = svc.delete_space("DEV")
            mock_client.delete.assert_called_once()

        def test_update_space(self, mock_client):
            mock_client.put.return_value = {"key": "DEV", "name": "Updated Dev"}
            svc = SpaceService(mock_client)
            result = svc.update_space("DEV", {"name": "Updated Dev"})
            assert result["name"] == "Updated Dev"
            mock_client.put.assert_called_once()

        def test_archive_space(self, mock_client):
            mock_client.put.return_value = {"key": "DEV", "status": "archived"}
            svc = SpaceService(mock_client)
            result = svc.archive_space("DEV")
            mock_client.put.assert_called_once()

        def test_restore_space(self, mock_client):
            mock_client.put.return_value = {"key": "DEV", "status": "current"}
            svc = SpaceService(mock_client)
            result = svc.restore_space("DEV")
            mock_client.put.assert_called_once()

        def test_create_private_space(self, mock_client):
            mock_client.post.return_value = {"key": "PRIV", "name": "Private"}
            svc = SpaceService(mock_client)
            result = svc.create_private_space({"key": "PRIV", "name": "Private"})
            assert result["key"] == "PRIV"
            mock_client.post.assert_called_once()

        def test_get_space_content(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "1"}], "size": 1}
            svc = SpaceService(mock_client)
            result = svc.get_space_content("DEV")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_space_content_with_params(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = SpaceService(mock_client)
            svc.get_space_content("DEV", depth="all", expand="body", start=5, limit=10)
            call_args = mock_client.get.call_args
            assert "all" in str(call_args)

        def test_get_space_content_by_type(self, mock_client):
            mock_client.get.return_value = {"results": [{"id": "page-1"}], "size": 1}
            svc = SpaceService(mock_client)
            result = svc.get_space_content_by_type("DEV", "page")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_space_content_by_type_with_params(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = SpaceService(mock_client)
            svc.get_space_content_by_type("DEV", "blogpost", depth="root", expand="body", start=0, limit=5)
            call_args = mock_client.get.call_args
            assert "blogpost" in str(call_args)

        def test_get_space_properties(self, mock_client):
            mock_client.get.return_value = {"results": [{"key": "prop1"}], "size": 1}
            svc = SpaceService(mock_client)
            result = svc.get_space_properties("DEV")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_space_properties_with_expand(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = SpaceService(mock_client)
            svc.get_space_properties("DEV", expand="version", start=0, limit=10)
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_create_space_property(self, mock_client):
            mock_client.post.return_value = {"key": "myprop", "value": {"x": 1}}
            svc = SpaceService(mock_client)
            result = svc.create_space_property("DEV", {"key": "myprop", "value": {"x": 1}})
            assert result["key"] == "myprop"
            mock_client.post.assert_called_once()

        def test_get_space_property(self, mock_client):
            mock_client.get.return_value = {"key": "myprop", "value": {"x": 1}}
            svc = SpaceService(mock_client)
            result = svc.get_space_property("DEV", "myprop")
            assert result["key"] == "myprop"
            mock_client.get.assert_called_once()

        def test_get_space_property_with_expand(self, mock_client):
            mock_client.get.return_value = {"key": "myprop", "version": {"number": 1}}
            svc = SpaceService(mock_client)
            svc.get_space_property("DEV", "myprop", expand="version")
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_update_space_property(self, mock_client):
            mock_client.put.return_value = {"key": "myprop", "value": {"x": 2}}
            svc = SpaceService(mock_client)
            result = svc.update_space_property("DEV", "myprop", {"value": {"x": 2}, "version": {"number": 2}})
            assert result["value"]["x"] == 2
            mock_client.put.assert_called_once()

        def test_create_space_property_for_key(self, mock_client):
            mock_client.post.return_value = {"key": "myprop", "value": {"x": 1}}
            svc = SpaceService(mock_client)
            result = svc.create_space_property_for_key("DEV", "myprop", {"value": {"x": 1}})
            assert result["key"] == "myprop"
            mock_client.post.assert_called_once()

        def test_delete_space_property(self, mock_client):
            mock_client.delete.return_value = None
            svc = SpaceService(mock_client)
            svc.delete_space_property("DEV", "myprop")
            mock_client.delete.assert_called_once()

        def test_get_space_labels(self, mock_client):
            mock_client.get.return_value = {"results": [{"name": "team"}], "size": 1}
            svc = SpaceService(mock_client)
            result = svc.get_space_labels()
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_space_labels_with_params(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = SpaceService(mock_client)
            svc.get_space_labels(expand="spaces", start=5, limit=10)
            call_args = mock_client.get.call_args
            assert "expand" in str(call_args)

        def test_get_popular_space_labels(self, mock_client):
            mock_client.get.return_value = {"results": [{"name": "popular"}]}
            svc = SpaceService(mock_client)
            result = svc.get_popular_space_labels()
            assert result["results"][0]["name"] == "popular"
            mock_client.get.assert_called_once()

        def test_get_recent_space_labels(self, mock_client):
            mock_client.get.return_value = {"results": [{"name": "recent"}]}
            svc = SpaceService(mock_client)
            result = svc.get_recent_space_labels()
            assert result["results"][0]["name"] == "recent"
            mock_client.get.assert_called_once()

        def test_get_related_space_labels(self, mock_client):
            mock_client.get.return_value = {"results": [{"name": "related"}]}
            svc = SpaceService(mock_client)
            result = svc.get_related_space_labels("team")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_get_space_watchers(self, mock_client):
            mock_client.get.return_value = {"results": [{"type": "known", "displayName": "Admin"}]}
            svc = SpaceService(mock_client)
            result = svc.get_space_watchers("DEV")
            assert len(result["results"]) == 1
            mock_client.get.assert_called_once()

        def test_delete_category(self, mock_client):
            mock_client.delete.return_value = None
            svc = SpaceService(mock_client)
            svc.delete_category("DEV", "old-category")
            mock_client.delete.assert_called_once()

    class TestBranchCoverage:

        def test_get_spaces_with_type_filter(self, mock_client):
            mock_client.get.return_value = {"results": [], "size": 0}
            svc = SpaceService(mock_client)
            svc.get_spaces(type="global")
            call_args = mock_client.get.call_args
            assert "global" in str(call_args)


class TestUserService:
    """Tests for UserService."""

    def test_get_user(self, mock_client):
        mock_client.get.return_value = {"type": "known", "displayName": "Admin"}
        svc = UserService(mock_client)
        result = svc.get_user("admin-key")
        assert result["displayName"] == "Admin"

    def test_get_current_user(self, mock_client):
        mock_client.get.return_value = {"type": "known", "displayName": "Current"}
        svc = UserService(mock_client)
        result = svc.get_current_user()
        assert result["displayName"] == "Current"

    def test_get_anonymous_user(self, mock_client):
        mock_client.get.return_value = {"type": "anonymous", "displayName": "Anonymous"}
        svc = UserService(mock_client)
        result = svc.get_anonymous_user()
        assert result["type"] == "anonymous"
        mock_client.get.assert_called_once()

    def test_get_user_groups(self, mock_client):
        mock_client.get.return_value = {"results": [{"name": "developers"}], "size": 1}
        svc = UserService(mock_client)
        result = svc.get_user_groups("admin")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_user_groups_with_pagination(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = UserService(mock_client)
        svc.get_user_groups("admin", start=10, limit=5)
        call_args = mock_client.get.call_args
        assert "10" in str(call_args) or "start" in str(call_args)

    def test_list_users(self, mock_client):
        mock_client.get.return_value = {"results": [{"displayName": "User1"}], "size": 1}
        svc = UserService(mock_client)
        result = svc.list_users()
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_list_users_with_pagination(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = UserService(mock_client)
        svc.list_users(start=20, limit=50)
        call_args = mock_client.get.call_args
        assert "50" in str(call_args) or "limit" in str(call_args)

    def test_change_current_user_password(self, mock_client):
        mock_client.post.return_value = {}
        svc = UserService(mock_client)
        svc.change_current_user_password("oldpass", "newpass")
        mock_client.post.assert_called_once()

    def test_is_watching_content(self, mock_client):
        mock_client.get.return_value = {"watching": True}
        svc = UserService(mock_client)
        result = svc.is_watching_content("123")
        assert result["watching"] is True
        mock_client.get.assert_called_once()

    def test_is_watching_content_with_username(self, mock_client):
        mock_client.get.return_value = {"watching": False}
        svc = UserService(mock_client)
        result = svc.is_watching_content("123", username="admin")
        assert result["watching"] is False
        call_args = mock_client.get.call_args
        assert "admin" in str(call_args)

    def test_watch_content(self, mock_client):
        mock_client.post.return_value = {}
        svc = UserService(mock_client)
        svc.watch_content("123")
        mock_client.post.assert_called_once()

    def test_watch_content_with_username(self, mock_client):
        mock_client.post.return_value = {}
        svc = UserService(mock_client)
        svc.watch_content("123", username="admin")
        call_args = mock_client.post.call_args
        assert "admin" in str(call_args)

    def test_unwatch_content(self, mock_client):
        mock_client.delete.return_value = None
        svc = UserService(mock_client)
        svc.unwatch_content("123")
        mock_client.delete.assert_called_once()

    def test_unwatch_content_with_username(self, mock_client):
        mock_client.delete.return_value = None
        svc = UserService(mock_client)
        svc.unwatch_content("123", username="admin")
        call_args = mock_client.delete.call_args
        assert "admin" in str(call_args)

    def test_is_watching_space(self, mock_client):
        mock_client.get.return_value = {"watching": True}
        svc = UserService(mock_client)
        result = svc.is_watching_space("DEV")
        assert result["watching"] is True
        mock_client.get.assert_called_once()

    def test_is_watching_space_with_username(self, mock_client):
        mock_client.get.return_value = {"watching": False}
        svc = UserService(mock_client)
        result = svc.is_watching_space("DEV", username="admin")
        call_args = mock_client.get.call_args
        assert "admin" in str(call_args)

    def test_watch_space(self, mock_client):
        mock_client.post.return_value = {}
        svc = UserService(mock_client)
        svc.watch_space("DEV")
        mock_client.post.assert_called_once()

    def test_watch_space_with_username(self, mock_client):
        mock_client.post.return_value = {}
        svc = UserService(mock_client)
        svc.watch_space("DEV", username="admin")
        call_args = mock_client.post.call_args
        assert "admin" in str(call_args)

    def test_unwatch_space(self, mock_client):
        mock_client.delete.return_value = None
        svc = UserService(mock_client)
        svc.unwatch_space("DEV")
        mock_client.delete.assert_called_once()

    def test_unwatch_space_with_username(self, mock_client):
        mock_client.delete.return_value = None
        svc = UserService(mock_client)
        svc.unwatch_space("DEV", username="admin")
        call_args = mock_client.delete.call_args
        assert "admin" in str(call_args)

    def test_get_content_watchers(self, mock_client):
        mock_client.get.return_value = {"results": [{"displayName": "Watcher1"}]}
        svc = UserService(mock_client)
        result = svc.get_content_watchers("123")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()


class TestGroupService:
    """Tests for GroupService."""

    def test_get_groups(self, mock_client):
        mock_client.get.return_value = {"results": [{"name": "developers"}], "size": 1}
        svc = GroupService(mock_client)
        result = svc.get_groups()
        assert len(result["results"]) == 1

    def test_get_group(self, mock_client):
        mock_client.get.return_value = {"name": "developers"}
        svc = GroupService(mock_client)
        result = svc.get_group("developers")
        assert result["name"] == "developers"

    def test_get_group_members(self, mock_client):
        mock_client.get.return_value = {"results": [{"displayName": "User1"}], "size": 1}
        svc = GroupService(mock_client)
        result = svc.get_group_members("developers")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_group_members_with_pagination(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = GroupService(mock_client)
        svc.get_group_members("developers", start=10, limit=50)
        call_args = mock_client.get.call_args
        assert "50" in str(call_args) or "limit" in str(call_args)


class TestAdminService:
    """Tests for AdminService."""

    def test_create_user(self, mock_client):
        mock_client.post.return_value = {"type": "known", "displayName": "New User"}
        svc = AdminService(mock_client)
        result = svc.create_user({
            "username": "newuser",
            "fullName": "New User",
            "email": "new@test.com",
            "password": "pass123",
        })
        mock_client.post.assert_called_once()

    def test_delete_user(self, mock_client):
        mock_client.delete.return_value = None
        svc = AdminService(mock_client)
        svc.delete_user("user-key-123")
        mock_client.delete.assert_called_once()

    def test_disable_user(self, mock_client):
        mock_client.post.return_value = {}
        svc = AdminService(mock_client)
        svc.disable_user("jdoe")
        mock_client.post.assert_called_once()

    def test_enable_user(self, mock_client):
        mock_client.post.return_value = {}
        svc = AdminService(mock_client)
        svc.enable_user("jdoe")
        mock_client.post.assert_called_once()

    def test_set_user_password(self, mock_client):
        mock_client.post.return_value = {}
        svc = AdminService(mock_client)
        svc.set_user_password("jdoe", "newSecurePass!")
        mock_client.post.assert_called_once()

    def test_create_group(self, mock_client):
        mock_client.post.return_value = {"name": "new-group"}
        svc = AdminService(mock_client)
        result = svc.create_group("new-group")
        assert result["name"] == "new-group"
        mock_client.post.assert_called_once()

    def test_delete_group(self, mock_client):
        mock_client.delete.return_value = None
        svc = AdminService(mock_client)
        svc.delete_group("old-group")
        mock_client.delete.assert_called_once()


class TestSystemService:
    """Tests for SystemService."""

    def test_get_server_info(self, mock_client):
        mock_client.get.return_value = {"baseUrl": "https://conf.test", "version": "9.2.3"}
        svc = SystemService(mock_client)
        result = svc.get_server_info()
        assert result["version"] == "9.2.3"

    def test_get_instance_metrics(self, mock_client):
        mock_client.get.return_value = {"currentUsers": 42}
        svc = SystemService(mock_client)
        result = svc.get_instance_metrics()
        assert result["currentUsers"] == 42

    def test_get_access_mode(self, mock_client):
        mock_client.get.return_value = {"accessMode": "READ_WRITE"}
        svc = SystemService(mock_client)
        result = svc.get_access_mode()
        assert result["accessMode"] == "READ_WRITE"
        mock_client.get.assert_called_once()

    def test_get_long_task(self, mock_client):
        mock_client.get.return_value = {"id": "task-1", "state": "COMPLETE", "percentageComplete": 100}
        svc = SystemService(mock_client)
        result = svc.get_long_task("task-1")
        assert result["state"] == "COMPLETE"
        mock_client.get.assert_called_once()

    def test_get_long_tasks(self, mock_client):
        mock_client.get.return_value = {"results": [{"id": "task-1"}], "size": 1}
        svc = SystemService(mock_client)
        result = svc.get_long_tasks()
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_long_tasks_with_pagination(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = SystemService(mock_client)
        svc.get_long_tasks(start=10, limit=50)
        call_args = mock_client.get.call_args
        assert "50" in str(call_args) or "limit" in str(call_args)


class TestLabelService:
    """Tests for LabelService."""

    def test_get_related_labels(self, mock_client):
        mock_client.get.return_value = {"results": [{"name": "architecture"}]}
        svc = LabelService(mock_client)
        result = svc.get_related_labels("architecture")
        assert len(result["results"]) == 1

    def test_get_recent_labels(self, mock_client):
        mock_client.get.return_value = {"results": [{"name": "recent-label"}]}
        svc = LabelService(mock_client)
        result = svc.get_recent_labels()
        assert result["results"][0]["name"] == "recent-label"
        mock_client.get.assert_called_once()


class TestColorSchemeService:
    """Tests for ColorSchemeService."""

    def test_get_default_color_scheme(self, mock_client):
        mock_client.get.return_value = {"topColor": "#205081"}
        svc = ColorSchemeService(mock_client)
        result = svc.get_default_color_scheme()
        assert result["topColor"] == "#205081"

    def test_get_global_color_scheme(self, mock_client):
        mock_client.get.return_value = {"topColor": "#FF0000", "headerColor": "#00FF00"}
        svc = ColorSchemeService(mock_client)
        result = svc.get_global_color_scheme()
        assert result["topColor"] == "#FF0000"
        mock_client.get.assert_called_once()

    def test_update_global_color_scheme(self, mock_client):
        mock_client.put.return_value = {"topColor": "#111111"}
        svc = ColorSchemeService(mock_client)
        result = svc.update_global_color_scheme({"topColor": "#111111"})
        assert result["topColor"] == "#111111"
        mock_client.put.assert_called_once()

    def test_reset_global_color_scheme(self, mock_client):
        mock_client.delete.return_value = None
        svc = ColorSchemeService(mock_client)
        svc.reset_global_color_scheme()
        mock_client.delete.assert_called_once()

    def test_get_space_color_scheme_type(self, mock_client):
        mock_client.get.return_value = {"colorSchemeType": "custom"}
        svc = ColorSchemeService(mock_client)
        result = svc.get_space_color_scheme_type("DEV")
        assert result["colorSchemeType"] == "custom"
        mock_client.get.assert_called_once()

    def test_set_space_color_scheme_type(self, mock_client):
        mock_client.put.return_value = {"colorSchemeType": "custom"}
        svc = ColorSchemeService(mock_client)
        result = svc.set_space_color_scheme_type("DEV", {"colorSchemeType": "custom"})
        assert result["colorSchemeType"] == "custom"
        mock_client.put.assert_called_once()

    def test_get_space_color_scheme(self, mock_client):
        mock_client.get.return_value = {"topColor": "#AABBCC"}
        svc = ColorSchemeService(mock_client)
        result = svc.get_space_color_scheme("DEV")
        assert result["topColor"] == "#AABBCC"
        mock_client.get.assert_called_once()

    def test_update_space_color_scheme(self, mock_client):
        mock_client.put.return_value = {"topColor": "#DDEEFF"}
        svc = ColorSchemeService(mock_client)
        result = svc.update_space_color_scheme("DEV", {"topColor": "#DDEEFF"})
        assert result["topColor"] == "#DDEEFF"
        mock_client.put.assert_called_once()

    def test_reset_space_color_scheme(self, mock_client):
        mock_client.delete.return_value = None
        svc = ColorSchemeService(mock_client)
        svc.reset_space_color_scheme("DEV")
        mock_client.delete.assert_called_once()


class TestWebhookService:
    """Tests for WebhookService."""

    def test_get_webhooks(self, mock_client):
        mock_client.get.return_value = {"results": [{"id": 1}], "size": 1}
        svc = WebhookService(mock_client)
        result = svc.get_webhooks()
        assert len(result["results"]) == 1

    def test_create_webhook(self, mock_client):
        mock_client.post.return_value = {"id": 1, "url": "https://hook.example.com"}
        svc = WebhookService(mock_client)
        result = svc.create_webhook({"url": "https://hook.example.com", "events": ["page_created"]})
        assert result["id"] == 1
        mock_client.post.assert_called_once()

    def test_get_webhook(self, mock_client):
        mock_client.get.return_value = {"id": 1, "url": "https://hook.example.com"}
        svc = WebhookService(mock_client)
        result = svc.get_webhook(1)
        assert result["id"] == 1
        mock_client.get.assert_called_once()

    def test_update_webhook(self, mock_client):
        mock_client.put.return_value = {"id": 1, "url": "https://updated.example.com"}
        svc = WebhookService(mock_client)
        result = svc.update_webhook(1, {"url": "https://updated.example.com"})
        assert result["url"] == "https://updated.example.com"
        mock_client.put.assert_called_once()

    def test_delete_webhook(self, mock_client):
        mock_client.delete.return_value = None
        svc = WebhookService(mock_client)
        svc.delete_webhook(1)
        mock_client.delete.assert_called_once()

    def test_test_webhook(self, mock_client):
        mock_client.post.return_value = {"status": "success"}
        svc = WebhookService(mock_client)
        result = svc.test_webhook({"url": "https://hook.example.com"})
        assert result["status"] == "success"
        mock_client.post.assert_called_once()

    def test_get_latest_invocations(self, mock_client):
        mock_client.get.return_value = {"results": [{"timestamp": "2025-01-01"}]}
        svc = WebhookService(mock_client)
        result = svc.get_latest_invocations(1)
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_webhook_statistics(self, mock_client):
        mock_client.get.return_value = {"totalInvocations": 100, "successCount": 95}
        svc = WebhookService(mock_client)
        result = svc.get_webhook_statistics(1)
        assert result["totalInvocations"] == 100
        mock_client.get.assert_called_once()

    def test_get_webhook_statistics_summary(self, mock_client):
        mock_client.get.return_value = {"totalInvocations": 50, "failureRate": 0.02}
        svc = WebhookService(mock_client)
        result = svc.get_webhook_statistics_summary(1)
        assert result["totalInvocations"] == 50
        mock_client.get.assert_called_once()


class TestBackupService:
    """Tests for BackupService."""

    def test_get_jobs(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = BackupService(mock_client)
        result = svc.get_jobs()
        assert result["size"] == 0

    def test_backup_site(self, mock_client):
        mock_client.post.return_value = {"id": "job-1", "state": "RUNNING"}
        svc = BackupService(mock_client)
        result = svc.backup_site({"cbAttachments": True})
        assert result["id"] == "job-1"
        mock_client.post.assert_called_once()

    def test_restore_site(self, mock_client):
        mock_client.post.return_value = {"id": "job-2", "state": "RUNNING"}
        svc = BackupService(mock_client)
        result = svc.restore_site({"filename": "backup.zip"})
        assert result["id"] == "job-2"
        mock_client.post.assert_called_once()

    def test_backup_space(self, mock_client):
        mock_client.post.return_value = {"id": "job-3", "state": "RUNNING"}
        svc = BackupService(mock_client)
        result = svc.backup_space({"spaceKey": "DEV", "cbAttachments": True})
        assert result["id"] == "job-3"
        mock_client.post.assert_called_once()

    def test_restore_space(self, mock_client):
        mock_client.post.return_value = {"id": "job-4", "state": "RUNNING"}
        svc = BackupService(mock_client)
        result = svc.restore_space({"filename": "space-backup.zip"})
        assert result["id"] == "job-4"
        mock_client.post.assert_called_once()

    def test_get_job(self, mock_client):
        mock_client.get.return_value = {"id": "job-1", "state": "COMPLETE", "percentageComplete": 100}
        svc = BackupService(mock_client)
        result = svc.get_job("job-1")
        assert result["state"] == "COMPLETE"
        mock_client.get.assert_called_once()

    def test_clear_job_queue(self, mock_client):
        mock_client.delete.return_value = None
        svc = BackupService(mock_client)
        svc.clear_job_queue()
        mock_client.delete.assert_called_once()

    def test_cancel_job(self, mock_client):
        mock_client.delete.return_value = None
        svc = BackupService(mock_client)
        svc.cancel_job("job-1")
        mock_client.delete.assert_called_once()

    def test_list_restore_files(self, mock_client):
        mock_client.get.return_value = {"results": ["backup1.zip", "backup2.zip"]}
        svc = BackupService(mock_client)
        result = svc.list_restore_files()
        assert len(result["results"]) == 2
        mock_client.get.assert_called_once()


class TestSpacePermissionService:
    """Tests for SpacePermissionService."""

    def test_get_permissions(self, mock_client):
        mock_client.get.return_value = {"results": [{"operation": "read"}]}
        svc = SpacePermissionService(mock_client)
        result = svc.get_permissions("DEV")
        assert len(result["results"]) == 1

    def test_add_permission(self, mock_client):
        mock_client.post.return_value = {"operation": "read", "type": "group"}
        svc = SpacePermissionService(mock_client)
        result = svc.add_permission("DEV", {"operation": "read", "type": "group", "groupName": "developers"})
        assert result["operation"] == "read"
        mock_client.post.assert_called_once()

    def test_get_anonymous_permissions(self, mock_client):
        mock_client.get.return_value = {"results": [{"operation": "read"}]}
        svc = SpacePermissionService(mock_client)
        result = svc.get_anonymous_permissions("DEV")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_group_permissions(self, mock_client):
        mock_client.get.return_value = {"results": [{"operation": "read"}]}
        svc = SpacePermissionService(mock_client)
        result = svc.get_group_permissions("DEV", "developers")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_user_permissions(self, mock_client):
        mock_client.get.return_value = {"results": [{"operation": "write"}]}
        svc = SpacePermissionService(mock_client)
        result = svc.get_user_permissions("DEV", "user-key-1")
        assert result["results"][0]["operation"] == "write"
        mock_client.get.assert_called_once()

    def test_grant_anonymous(self, mock_client):
        mock_client.post.return_value = {"operation": "read"}
        svc = SpacePermissionService(mock_client)
        result = svc.grant_anonymous("DEV", {"operation": "read"})
        assert result["operation"] == "read"
        mock_client.post.assert_called_once()

    def test_grant_group(self, mock_client):
        mock_client.post.return_value = {"operation": "write"}
        svc = SpacePermissionService(mock_client)
        result = svc.grant_group("DEV", "developers", {"operation": "write"})
        assert result["operation"] == "write"
        mock_client.post.assert_called_once()

    def test_grant_user(self, mock_client):
        mock_client.post.return_value = {"operation": "write"}
        svc = SpacePermissionService(mock_client)
        result = svc.grant_user("DEV", "user-key-1", {"operation": "write"})
        assert result["operation"] == "write"
        mock_client.post.assert_called_once()

    def test_revoke_anonymous(self, mock_client):
        mock_client.delete.return_value = None
        svc = SpacePermissionService(mock_client)
        svc.revoke_anonymous("DEV", {"operation": "read", "type": "anonymous"})
        mock_client.delete.assert_called_once()

    def test_revoke_group(self, mock_client):
        mock_client.delete.return_value = None
        svc = SpacePermissionService(mock_client)
        svc.revoke_group("DEV", "developers", {"operation": "write", "type": "group"})
        mock_client.delete.assert_called_once()

    def test_revoke_user(self, mock_client):
        mock_client.delete.return_value = None
        svc = SpacePermissionService(mock_client)
        svc.revoke_user("DEV", "user-key-1", {"operation": "write", "type": "user"})
        mock_client.delete.assert_called_once()


class TestAttachmentService:
    """Tests for AttachmentService."""

    def test_get_attachments(self, mock_client):
        mock_client.get.return_value = {"results": [{"id": "att-1", "title": "file.pdf"}], "size": 1}
        svc = AttachmentService(mock_client)
        result = svc.get_attachments("123")
        assert len(result["results"]) == 1
        mock_client.get.assert_called_once()

    def test_get_attachments_with_params(self, mock_client):
        mock_client.get.return_value = {"results": [], "size": 0}
        svc = AttachmentService(mock_client)
        svc.get_attachments("123", expand="version", start=5, limit=10)
        call_args = mock_client.get.call_args
        assert "expand" in str(call_args)

    def test_update_attachment_metadata(self, mock_client):
        mock_client.put.return_value = {"id": "att-1", "title": "renamed.pdf"}
        svc = AttachmentService(mock_client)
        result = svc.update_attachment_metadata("123", "att-1", {"title": "renamed.pdf"})
        assert result["title"] == "renamed.pdf"
        mock_client.put.assert_called_once()

    def test_delete_attachment(self, mock_client):
        mock_client.delete.return_value = None
        svc = AttachmentService(mock_client)
        svc.delete_attachment("123", "att-1")
        mock_client.delete.assert_called_once()
