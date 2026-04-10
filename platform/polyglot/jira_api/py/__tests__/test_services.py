"""Unit tests for jira_api.services."""

from unittest.mock import MagicMock, PropertyMock

import pytest

from jira_api.models.issue import IssueStatus, IssueTransition
from jira_api.services.issue_service import IssueService
from jira_api.services.project_service import ProjectService
from jira_api.services.user_service import UserService


class TestUserService:
    class TestStatementCoverage:
        def test_get_user_by_id(self, mock_jira_client):
            svc = UserService(mock_jira_client)
            result = svc.get_user_by_id("acc123")
            mock_jira_client.get_user.assert_called_once_with("acc123")

        def test_search_users(self, mock_jira_client):
            svc = UserService(mock_jira_client)
            svc.search_users("query", 10)
            mock_jira_client.search_users.assert_called_once_with("query", 10)

        def test_find_assignable_users(self, mock_jira_client):
            svc = UserService(mock_jira_client)
            svc.find_assignable_users_for_projects(["PROJ"], "q", 5)
            mock_jira_client.find_assignable_users.assert_called_once_with(["PROJ"], "q", 5)

    class TestBranchCoverage:
        def test_get_user_by_email_found(self, mock_jira_client):
            user = MagicMock(email_address="test@example.com")
            mock_jira_client.search_users.return_value = [user]
            svc = UserService(mock_jira_client)
            result = svc.get_user_by_email("test@example.com")
            assert result == user

        def test_get_user_by_email_not_found(self, mock_jira_client):
            mock_jira_client.search_users.return_value = []
            svc = UserService(mock_jira_client)
            result = svc.get_user_by_email("nobody@example.com")
            assert result is None

        def test_get_user_by_identifier_tries_id_first(self, mock_jira_client):
            svc = UserService(mock_jira_client)
            svc.get_user_by_identifier("acc123")
            mock_jira_client.get_user.assert_called_once_with("acc123")

        def test_get_user_by_identifier_falls_back_to_email(self, mock_jira_client):
            mock_jira_client.get_user.side_effect = Exception("not found")
            mock_jira_client.search_users.return_value = []
            svc = UserService(mock_jira_client)
            result = svc.get_user_by_identifier("test@example.com")
            assert result is None


class TestIssueService:
    class TestStatementCoverage:
        def test_get_issue(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.get_issue("PROJ-123")
            mock_jira_client.get_issue.assert_called_once_with("PROJ-123")

        def test_update_issue_summary(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.update_issue_summary("PROJ-123", "New summary")
            mock_jira_client.update_issue.assert_called_once()

        def test_add_labels(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.add_labels_to_issue("PROJ-123", ["bug", "urgent"])
            mock_jira_client.update_issue.assert_called_once()

        def test_remove_labels(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.remove_labels_from_issue("PROJ-123", ["old"])
            mock_jira_client.update_issue.assert_called_once()

        def test_unassign_issue(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.unassign_issue("PROJ-123")
            mock_jira_client.assign_issue.assert_called_once()

        def test_get_available_transitions(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.get_available_transitions("PROJ-123")
            mock_jira_client.get_issue_transitions.assert_called_once()

    class TestBranchCoverage:
        def test_create_issue_with_assignee_email(self, mock_jira_client):
            user = MagicMock(account_id="acc1", email_address="user@test.com")
            mock_jira_client.search_users.return_value = [user]
            svc = IssueService(mock_jira_client)
            svc.create_issue(
                project_id="1", summary="Test", issue_type_id="10001",
                assignee_email="user@test.com",
            )
            mock_jira_client.create_issue.assert_called_once()

        def test_assign_issue_by_email_user_not_found(self, mock_jira_client):
            mock_jira_client.search_users.return_value = []
            svc = IssueService(mock_jira_client)
            with pytest.raises(ValueError, match="not found"):
                svc.assign_issue_by_email("PROJ-123", "nobody@test.com")

        def test_transition_by_name_not_found(self, mock_jira_client):
            mock_jira_client.get_issue_transitions.return_value = []
            svc = IssueService(mock_jira_client)
            with pytest.raises(ValueError, match="not found"):
                svc.transition_issue_by_name("PROJ-123", "Nonexistent")

        def test_transition_by_name_found(self, mock_jira_client):
            status = IssueStatus(id="1", name="Done")
            transition = IssueTransition(id="5", name="Done", to=status)
            mock_jira_client.get_issue_transitions.return_value = [transition]
            svc = IssueService(mock_jira_client)
            svc.transition_issue_by_name("PROJ-123", "Done")
            mock_jira_client.transition_issue.assert_called_once()

        def test_transition_by_id(self, mock_jira_client):
            svc = IssueService(mock_jira_client)
            svc.transition_issue_by_id("PROJ-123", "5", comment="test")
            mock_jira_client.transition_issue.assert_called_once()


class TestProjectService:
    class TestStatementCoverage:
        def test_get_project(self, mock_jira_client):
            svc = ProjectService(mock_jira_client)
            svc.get_project("PROJ")
            mock_jira_client.get_project.assert_called_once_with("PROJ")

        def test_get_project_versions(self, mock_jira_client):
            svc = ProjectService(mock_jira_client)
            svc.get_project_versions("PROJ")
            mock_jira_client.get_project_versions.assert_called_once()

        def test_get_issue_types(self, mock_jira_client):
            svc = ProjectService(mock_jira_client)
            svc.get_issue_types()
            mock_jira_client.get_issue_types.assert_called_once()

    class TestBranchCoverage:
        def test_get_released_versions(self, mock_jira_client):
            v1 = MagicMock(released=True, name="1.0")
            v2 = MagicMock(released=False, name="2.0")
            mock_jira_client.get_project_versions.return_value = [v1, v2]
            svc = ProjectService(mock_jira_client)
            result = svc.get_released_versions("PROJ")
            assert len(result) == 1
            assert result[0].name == "1.0"

        def test_get_unreleased_versions(self, mock_jira_client):
            v1 = MagicMock(released=True, name="1.0")
            v2 = MagicMock(released=False, name="2.0")
            mock_jira_client.get_project_versions.return_value = [v1, v2]
            svc = ProjectService(mock_jira_client)
            result = svc.get_unreleased_versions("PROJ")
            assert len(result) == 1
            assert result[0].name == "2.0"

        def test_get_version_by_name_found(self, mock_jira_client):
            v = MagicMock(name="1.0")
            mock_jira_client.get_project_versions.return_value = [v]
            svc = ProjectService(mock_jira_client)
            assert svc.get_version_by_name("PROJ", "1.0") == v

        def test_get_version_by_name_not_found(self, mock_jira_client):
            mock_jira_client.get_project_versions.return_value = []
            svc = ProjectService(mock_jira_client)
            assert svc.get_version_by_name("PROJ", "3.0") is None
