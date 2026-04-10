"""Unit tests for jira_api.models."""

import pytest

from jira_api.models.issue import (
    Issue,
    IssueAssignment,
    IssueCreate,
    IssueFields,
    IssueStatus,
    IssueTransition,
    IssueTransitionRequest,
    IssueUpdate,
)
from jira_api.models.project import (
    IssueType,
    Project,
    ProjectLead,
    ProjectVersion,
    ProjectVersionCreate,
)
from jira_api.models.user import User, UserSearch, UserSearchResult


class TestUserModel:
    class TestStatementCoverage:
        def test_create_from_alias(self):
            u = User(accountId="acc1", displayName="Test User")
            assert u.account_id == "acc1"
            assert u.display_name == "Test User"
            assert u.active is True

        def test_create_from_field_name(self):
            u = User(account_id="acc2", display_name="User 2")
            assert u.account_id == "acc2"

        def test_optional_fields_default_none(self):
            u = User(accountId="acc3", displayName="User 3")
            assert u.email_address is None
            assert u.avatar_urls is None
            assert u.time_zone is None

    class TestBoundaryValues:
        def test_user_search_defaults(self):
            s = UserSearch(query="test")
            assert s.start_at == 0
            assert s.max_results == 50

        def test_user_search_result_empty(self):
            r = UserSearchResult()
            assert r.users == []
            assert r.total == 0


class TestProjectModels:
    class TestStatementCoverage:
        def test_project_from_alias(self):
            p = Project(id="1", key="PROJ", name="Project")
            assert p.key == "PROJ"

        def test_project_version(self):
            v = ProjectVersion(id="1", name="1.0", projectId=100)
            assert v.project_id == 100
            assert v.released is False
            assert v.archived is False

        def test_issue_type(self):
            it = IssueType(id="10001", name="Bug")
            assert it.subtask is False

        def test_project_lead(self):
            pl = ProjectLead(accountId="acc1", displayName="Lead")
            assert pl.account_id == "acc1"

    class TestBranchCoverage:
        def test_project_version_create(self):
            vc = ProjectVersionCreate(name="2.0", project_id=100)
            assert vc.released is False
            assert vc.start_date is None


class TestIssueModels:
    class TestStatementCoverage:
        def test_issue_create_to_jira_format_minimal(self):
            ic = IssueCreate(project_id="1", summary="Test", issue_type_id="10001")
            result = ic.to_jira_format()
            assert result["fields"]["project"]["id"] == "1"
            assert result["fields"]["summary"] == "Test"
            assert result["fields"]["issuetype"]["id"] == "10001"

        def test_issue_create_to_jira_format_full(self):
            ic = IssueCreate(
                project_id="1", summary="Full", issue_type_id="10001",
                description="A description", priority_id="2",
                assignee_account_id="acc1", labels=["bug"],
            )
            result = ic.to_jira_format()
            assert result["fields"]["description"]["type"] == "doc"
            assert result["fields"]["priority"]["id"] == "2"
            assert result["fields"]["assignee"]["accountId"] == "acc1"
            assert result["fields"]["labels"] == ["bug"]

        def test_issue_update_to_jira_format(self):
            iu = IssueUpdate(summary="New summary", labels_add=["a"], labels_remove=["b"])
            result = iu.to_jira_format()
            assert result["update"]["summary"] == [{"set": "New summary"}]
            assert {"add": "a"} in result["update"]["labels"]
            assert {"remove": "b"} in result["update"]["labels"]

        def test_issue_transition_request_to_jira_format(self):
            tr = IssueTransitionRequest(transition_id="5", comment="Done", resolution_name="Done")
            result = tr.to_jira_format()
            assert result["transition"]["id"] == "5"
            assert result["fields"]["resolution"]["name"] == "Done"
            assert result["update"]["comment"][0]["add"]["body"]["type"] == "doc"

        def test_issue_assignment_to_jira_format(self):
            a = IssueAssignment(account_id="acc1")
            assert a.to_jira_format() == {"accountId": "acc1"}

        def test_issue_assignment_unassign(self):
            a = IssueAssignment(account_id=None)
            assert a.to_jira_format() == {"accountId": None}

    class TestBranchCoverage:
        def test_issue_update_empty(self):
            iu = IssueUpdate()
            result = iu.to_jira_format()
            assert result["update"] == {}

        def test_issue_update_description_only(self):
            iu = IssueUpdate(description="New desc")
            result = iu.to_jira_format()
            assert result["update"]["description"][0]["set"]["type"] == "doc"

        def test_issue_transition_no_comment_no_resolution(self):
            tr = IssueTransitionRequest(transition_id="3")
            result = tr.to_jira_format()
            assert "fields" not in result
            assert "update" not in result

        def test_issue_create_no_optional_fields(self):
            ic = IssueCreate(project_id="1", summary="Min", issue_type_id="10001")
            result = ic.to_jira_format()
            assert "description" not in result["fields"]
            assert "priority" not in result["fields"]
            assert "assignee" not in result["fields"]
