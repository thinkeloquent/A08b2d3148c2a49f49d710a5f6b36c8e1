"""
Unit tests for confluence_api.models module.

Tests cover:
- Statement coverage for model instantiation
- Branch coverage for optional fields, aliases
- Boundary value analysis (empty, defaults, nested objects)
"""

import pytest

from confluence_api.models.common import (
    OperationCheckResult,
    PaginatedResponse,
    PaginationLinks,
    RestError,
    ValidationResult,
)
from confluence_api.models.content import (
    Content,
    ContentBody,
    ContentBodyContainer,
    ContentCreate,
    ContentUpdate,
    History,
    Icon,
    MacroInstance,
    Person,
    ReferenceVersion,
    Version,
)
from confluence_api.models.group import Group
from confluence_api.models.label import Label
from confluence_api.models.search import ContainerSummary, SearchResult
from confluence_api.models.space import (
    LongTaskSubmission,
    Space,
    SpaceCreate,
    SpaceUpdate,
)
from confluence_api.models.user import (
    Credentials,
    PasswordChangeDetails,
    UserDetailsForCreation,
    UserKey,
)
from confluence_api.models.user import (
    Person as UserPerson,
)


class TestCommonModels:
    """Tests for common models."""

    class TestStatementCoverage:

        def test_validation_result_defaults(self):
            vr = ValidationResult()
            assert vr.authorized is False
            assert vr.valid is False
            assert vr.errors is None
            assert vr.successful is False
            assert vr.allowed_in_read_only_mode is False

        def test_validation_result_from_json_alias(self):
            vr = ValidationResult(**{"allowedInReadOnlyMode": True, "authorized": True})
            assert vr.allowed_in_read_only_mode is True
            assert vr.authorized is True

        def test_rest_error_from_json(self):
            err = RestError(**{"statusCode": 404, "message": "Not found", "reason": "missing"})
            assert err.status_code == 404
            assert err.message == "Not found"
            assert err.reason == "missing"

        def test_pagination_links_defaults(self):
            pl = PaginationLinks()
            assert pl.base is None
            assert pl.self_link is None
            assert pl.next_link is None
            assert pl.prev_link is None

        def test_pagination_links_from_json_aliases(self):
            pl = PaginationLinks(**{"self": "/api/content", "next": "/api/content?start=25"})
            assert pl.self_link == "/api/content"
            assert pl.next_link == "/api/content?start=25"

        def test_paginated_response_defaults(self):
            pr = PaginatedResponse()
            assert pr.results == []
            assert pr.start == 0
            assert pr.limit == 25
            assert pr.size == 0
            assert pr.links is None

        def test_paginated_response_with_results(self):
            pr = PaginatedResponse(results=[{"id": "1"}, {"id": "2"}], size=2)
            assert len(pr.results) == 2
            assert pr.size == 2

        def test_operation_check_result_defaults(self):
            ocr = OperationCheckResult()
            assert ocr.operation == ""
            assert ocr.target_type == ""

        def test_operation_check_result_from_alias(self):
            ocr = OperationCheckResult(**{"operation": "update", "targetType": "page"})
            assert ocr.target_type == "page"

    class TestBoundaryValueAnalysis:

        def test_rest_error_with_nested_validation_result(self):
            err = RestError(
                **{
                    "statusCode": 400,
                    "data": {"authorized": False, "valid": False, "successful": False},
                    "message": "Validation failed",
                }
            )
            assert err.data is not None
            assert err.data.valid is False

        def test_paginated_response_with_links(self):
            pr = PaginatedResponse(
                **{
                    "results": [],
                    "_links": {"base": "http://conf.test", "next": "?start=25"},
                }
            )
            assert pr.links is not None
            assert pr.links.base == "http://conf.test"


class TestContentModels:
    """Tests for content-domain models."""

    class TestStatementCoverage:

        def test_icon_defaults(self):
            icon = Icon()
            assert icon.path == ""
            assert icon.width == 0
            assert icon.height == 0
            assert icon.is_default is False

        def test_icon_from_alias(self):
            icon = Icon(**{"path": "/icons/default.png", "isDefault": True})
            assert icon.is_default is True

        def test_person_defaults(self):
            p = Person()
            assert p.display_name == ""
            assert p.type == ""
            assert p.profile_picture is None

        def test_person_from_alias(self):
            p = Person(**{"displayName": "John Doe", "type": "known"})
            assert p.display_name == "John Doe"

        def test_content_create_model(self):
            cc = ContentCreate(
                type="page",
                title="Test Page",
                space={"key": "DEV"},
                body={"storage": {"value": "<p>Hello</p>", "representation": "storage"}},
            )
            assert cc.type == "page"
            assert cc.title == "Test Page"

        def test_content_update_model(self):
            cu = ContentUpdate(
                version={"number": 2},
                title="Updated Page",
                type="page",
                body={"storage": {"value": "<p>Updated</p>", "representation": "storage"}},
            )
            assert cu.title == "Updated Page"

    class TestBoundaryValueAnalysis:

        def test_content_minimal(self):
            c = Content()
            assert c.id is None
            assert c.type == "page"
            assert c.title == ""
            assert c.status == "current"


class TestSpaceModels:
    """Tests for space models."""

    def test_space_defaults(self):
        s = Space()
        assert s.key == ""
        assert s.name == ""

    def test_space_create(self):
        sc = SpaceCreate(key="DEV", name="Development")
        assert sc.key == "DEV"

    def test_space_update(self):
        su = SpaceUpdate(name="Updated Space")
        assert su.name == "Updated Space"


class TestUserModels:
    """Tests for user models."""

    def test_user_person_defaults(self):
        u = UserPerson()
        assert u.type == ""

    def test_user_key(self):
        uk = UserKey(**{"userKey": "abc123"})
        assert uk.user_key == "abc123"

    def test_credentials(self):
        c = Credentials(password="secret")
        assert c.password == "secret"


class TestSearchModels:
    """Tests for search models."""

    def test_search_result_defaults(self):
        sr = SearchResult()
        assert sr.title == ""

    def test_container_summary_defaults(self):
        cs = ContainerSummary()
        assert cs.title == ""


class TestGroupAndLabelModels:
    """Tests for group and label models."""

    def test_group_defaults(self):
        g = Group()
        assert g.name == ""

    def test_label_defaults(self):
        lab = Label()
        assert lab.name == ""
