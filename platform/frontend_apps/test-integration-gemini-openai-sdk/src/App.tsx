import { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  MessageSquare,
  Zap,
  FileJson,
  Wrench,
  Code,
  MessagesSquare,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  Bot,
  LayoutGrid } from
'lucide-react';

import { services, loadRouterConfig, getEndpointsByTag, getEndpoint, type EndpointConfig, type ConversationMessage } from './services';
import { GeminiChatTab, StructuredChatTab } from './gemini-chat';
import type { StructuredChatResponse } from './gemini-chat';

/** Mask secrets: first 10 chars + *** + last 10 chars */
function maskSecret(value: string): string {
  if (value.length <= 20) return value.slice(0, 4) + '***';
  return value.slice(0, 10) + '***' + value.slice(-10);
}

/** Deep-mask string values that look like secrets in an object */
function maskSecrets(obj: unknown): unknown {
  if (typeof obj === 'string') {
    if (obj.length > 20 || /^(Bearer |sk-|ghp_|gho_|xox[bpsa]-|AKIA)/.test(obj)) {
      return maskSecret(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(maskSecrets);
  if (obj && typeof obj === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (/token|secret|key|password|auth|apikey|api_key/i.test(k) && typeof v === 'string') {
        masked[k] = maskSecret(v);
      } else {
        masked[k] = maskSecrets(v);
      }
    }
    return masked;
  }
  return obj;
}

type TabType = 'health' | 'chat' | 'stream' | 'structure' | 'tool-call' | 'json' | 'conversation' | 'gemini-chat' | 'gemini-structured';

const BASE_PATH = '/apps/test-integration/gemini-openai-sdk';
/** Provider route name for the Gemini OpenAI SDK service */
const SDK_PROVIDER_ROUTE = 'gemini-openai';
const ALL_TABS: TabType[] = ['health', 'chat', 'stream', 'structure', 'tool-call', 'json', 'conversation', 'gemini-chat', 'gemini-structured'];

function getTabFromPath(): TabType {
  const path = window.location.pathname;
  const suffix = path.replace(BASE_PATH, '').replace(/^\/+|\/+$/g, '');
  if (suffix && ALL_TABS.includes(suffix as TabType)) return suffix as TabType;
  return 'health';
}

function pushTabUrl(tab: TabType) {
  const url = `${BASE_PATH}/${tab}`;
  if (window.location.pathname !== url) {
    window.history.pushState(null, '', url);
  }
}

interface ErrorInfo {
  message: string;
  stack?: string;
}

interface RequestState {
  loading: boolean;
  error: ErrorInfo | null;
  request: unknown | null;
  response: unknown | null;
  duration: number | null;
}

const initialRequestState: RequestState = {
  loading: false,
  error: null,
  request: null,
  response: null,
  duration: null
};

type ResultTab = 'response' | 'request' | 'exception';

type ToolCategory = 'figma' | 'jira' | 'confluence' | 'github';

const TOOL_CATEGORIES: { id: ToolCategory; label: string; color: string }[] = [
  { id: 'figma', label: 'Figma', color: 'purple' },
  { id: 'jira', label: 'Jira', color: 'blue' },
  { id: 'confluence', label: 'Confluence', color: 'sky' },
  { id: 'github', label: 'GitHub', color: 'gray' },
];

const CATEGORY_STYLES: Record<ToolCategory, { active: string; inactive: string }> = {
  figma: { active: 'bg-purple-100 text-purple-700 border-purple-300', inactive: 'bg-gray-50 text-gray-400 border-gray-200' },
  jira: { active: 'bg-blue-100 text-blue-700 border-blue-300', inactive: 'bg-gray-50 text-gray-400 border-gray-200' },
  confluence: { active: 'bg-sky-100 text-sky-700 border-sky-300', inactive: 'bg-gray-50 text-gray-400 border-gray-200' },
  github: { active: 'bg-gray-200 text-gray-800 border-gray-400', inactive: 'bg-gray-50 text-gray-400 border-gray-200' },
};

interface ToolDefinition {
  name: string;
  label: string;
  category: ToolCategory;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

const ALL_TOOLS: ToolDefinition[] = [
  // ── Figma REST API (provider proxy) ──
  {
    name: 'figma_file_get',
    label: 'Get File',
    category: 'figma',
    description: 'Get a Figma file by its file key. Returns the document tree, components, and metadata.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key (from the file URL)' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_file_components',
    label: 'File Components',
    category: 'figma',
    description: 'Get all components in a Figma file. Returns component names, keys, and descriptions.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_file_nodes',
    label: 'File Nodes',
    category: 'figma',
    description: 'Get specific nodes from a Figma file by node IDs.',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'The Figma file key' },
        ids: { type: 'string', description: 'Comma-separated list of node IDs to retrieve' },
      },
      required: ['fileKey', 'ids'],
    },
  },
  {
    name: 'figma_variables_local',
    label: 'Local Variables',
    category: 'figma',
    description: 'Get local variables (design tokens) from a Figma file, including colors, spacing, and typography tokens.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_variables_published',
    label: 'Published Variables',
    category: 'figma',
    description: 'Get published variables from a Figma file. Returns shared design tokens available to other files.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_file_comments',
    label: 'File Comments',
    category: 'figma',
    description: 'Get all comments on a Figma file. Returns comment threads with authors and timestamps.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_file_versions',
    label: 'File Versions',
    category: 'figma',
    description: 'Get version history of a Figma file. Returns version labels, timestamps, and authors.',
    parameters: {
      type: 'object',
      properties: { fileKey: { type: 'string', description: 'The Figma file key' } },
      required: ['fileKey'],
    },
  },
  {
    name: 'figma_file_images',
    label: 'Export Images',
    category: 'figma',
    description: 'Export images from a Figma file. Renders nodes as PNG, SVG, JPG, or PDF.',
    parameters: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'The Figma file key' },
        ids: { type: 'string', description: 'Comma-separated node IDs to export' },
        format: { type: 'string', enum: ['png', 'svg', 'jpg', 'pdf'], description: 'Image export format' },
      },
      required: ['fileKey', 'ids'],
    },
  },
  {
    name: 'figma_team_projects',
    label: 'Team Projects',
    category: 'figma',
    description: 'Get all projects for a team. Returns project names and IDs.',
    parameters: {
      type: 'object',
      properties: { teamId: { type: 'string', description: 'The Figma team ID' } },
      required: ['teamId'],
    },
  },
  {
    name: 'figma_team_components',
    label: 'Team Components',
    category: 'figma',
    description: 'Get all published components for a team. Returns shared component library entries.',
    parameters: {
      type: 'object',
      properties: { teamId: { type: 'string', description: 'The Figma team ID' } },
      required: ['teamId'],
    },
  },
  {
    name: 'figma_team_styles',
    label: 'Team Styles',
    category: 'figma',
    description: 'Get all published styles for a team. Returns shared color, text, and effect styles.',
    parameters: {
      type: 'object',
      properties: { teamId: { type: 'string', description: 'The Figma team ID' } },
      required: ['teamId'],
    },
  },
  {
    name: 'figma_component_get',
    label: 'Get Component',
    category: 'figma',
    description: 'Get a specific component by its key. Returns component metadata and description.',
    parameters: {
      type: 'object',
      properties: { key: { type: 'string', description: 'The component key' } },
      required: ['key'],
    },
  },
  {
    name: 'figma_style_get',
    label: 'Get Style',
    category: 'figma',
    description: 'Get a specific style by its key. Returns style name, type, and description.',
    parameters: {
      type: 'object',
      properties: { key: { type: 'string', description: 'The style key' } },
      required: ['key'],
    },
  },
  // ── Figma Component Inspector ──
  {
    name: 'figma_inspector_health',
    label: 'Inspector Health',
    category: 'figma',
    description: 'Check the health status of the Figma Component Inspector service.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'figma_inspector_components',
    label: 'Inspector Components',
    category: 'figma',
    description: 'Get all components from a Figma file via the inspector. Returns parsed component data with properties and variants.',
    parameters: {
      type: 'object',
      properties: { fileId: { type: 'string', description: 'The Figma file ID' } },
      required: ['fileId'],
    },
  },
  {
    name: 'figma_inspector_file',
    label: 'Inspector File',
    category: 'figma',
    description: 'Get file metadata and structure from the Figma inspector.',
    parameters: {
      type: 'object',
      properties: { fileId: { type: 'string', description: 'The Figma file ID' } },
      required: ['fileId'],
    },
  },
  {
    name: 'figma_inspector_file_comments',
    label: 'Inspector File Comments',
    category: 'figma',
    description: 'Get comments on a Figma file via the inspector.',
    parameters: {
      type: 'object',
      properties: { fileId: { type: 'string', description: 'The Figma file ID' } },
      required: ['fileId'],
    },
  },
  {
    name: 'figma_inspector_images',
    label: 'Inspector Images',
    category: 'figma',
    description: 'Get exported images from a Figma file via the inspector.',
    parameters: {
      type: 'object',
      properties: { fileId: { type: 'string', description: 'The Figma file ID' } },
      required: ['fileId'],
    },
  },
  {
    name: 'figma_inspector_node',
    label: 'Inspector Node',
    category: 'figma',
    description: 'Get a specific node from a Figma file via the inspector. Returns node properties, styles, and children.',
    parameters: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The Figma file ID' },
        nodeId: { type: 'string', description: 'The node ID within the file' },
      },
      required: ['fileId', 'nodeId'],
    },
  },
  {
    name: 'figma_inspector_variables',
    label: 'Inspector Variables',
    category: 'figma',
    description: 'Get design variables/tokens from a Figma file via the inspector.',
    parameters: {
      type: 'object',
      properties: { fileId: { type: 'string', description: 'The Figma file ID' } },
      required: ['fileId'],
    },
  },
  {
    name: 'figma_inspector_comments_list',
    label: 'List Inspector Comments',
    category: 'figma',
    description: 'List all comments stored in the component inspector system.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'figma_inspector_comments_create',
    label: 'Create Inspector Comment',
    category: 'figma',
    description: 'Create a new comment in the component inspector. Provide comment text and optionally a fileId and nodeId.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The comment text' },
        fileId: { type: 'string', description: 'Optional Figma file ID to associate with' },
        nodeId: { type: 'string', description: 'Optional node ID to associate with' },
      },
      required: ['text'],
    },
  },
  {
    name: 'figma_inspector_comment_update',
    label: 'Update Inspector Comment',
    category: 'figma',
    description: 'Update an existing inspector comment by its ID.',
    parameters: {
      type: 'object',
      properties: {
        commentId: { type: 'string', description: 'The comment ID to update' },
        text: { type: 'string', description: 'Updated comment text' },
      },
      required: ['commentId', 'text'],
    },
  },
  {
    name: 'figma_inspector_comment_delete',
    label: 'Delete Inspector Comment',
    category: 'figma',
    description: 'Delete an inspector comment by its ID.',
    parameters: {
      type: 'object',
      properties: {
        commentId: { type: 'string', description: 'The comment ID to delete' },
      },
      required: ['commentId'],
    },
  },
  {
    name: 'figma_inspector_comment_reply',
    label: 'Reply to Inspector Comment',
    category: 'figma',
    description: 'Add a reply to an existing inspector comment.',
    parameters: {
      type: 'object',
      properties: {
        commentId: { type: 'string', description: 'The parent comment ID to reply to' },
        text: { type: 'string', description: 'The reply text' },
      },
      required: ['commentId', 'text'],
    },
  },
  // ── Health / Admin ──
  {
    name: 'figma_api_health',
    label: 'Figma API Health',
    category: 'figma',
    description: 'Check the health status of the Figma API provider integration.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'healthz_integration_figma',
    label: 'Figma Integration Health',
    category: 'figma',
    description: 'Get the health status of the Figma admin integration.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'healthz_integration_figma_config',
    label: 'Figma Integration Config',
    category: 'figma',
    description: 'Get the configuration details for the Figma integration.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  // ── Jira REST API ──
  { name: 'jira_issue_create', label: 'Create Issue', category: 'jira', description: 'Create a new Jira issue. Provide project key, summary, issue type, and optional description.', parameters: { type: 'object', properties: { projectKey: { type: 'string', description: 'The Jira project key (e.g. PROJ)' }, summary: { type: 'string', description: 'Issue summary/title' }, issueType: { type: 'string', description: 'Issue type (Bug, Task, Story, etc.)' }, description: { type: 'string', description: 'Optional issue description' } }, required: ['projectKey', 'summary', 'issueType'] } },
  { name: 'jira_issue_get', label: 'Get Issue', category: 'jira', description: 'Get a Jira issue by its key. Returns issue fields, status, assignee, and comments.', parameters: { type: 'object', properties: { issueKey: { type: 'string', description: 'The issue key (e.g. PROJ-123)' } }, required: ['issueKey'] } },
  { name: 'jira_issue_update', label: 'Update Issue', category: 'jira', description: 'Update fields on an existing Jira issue.', parameters: { type: 'object', properties: { issueKey: { type: 'string', description: 'The issue key' }, summary: { type: 'string', description: 'Updated summary' }, description: { type: 'string', description: 'Updated description' } }, required: ['issueKey'] } },
  { name: 'jira_transitions_list', label: 'List Transitions', category: 'jira', description: 'Get available workflow transitions for a Jira issue.', parameters: { type: 'object', properties: { issueKey: { type: 'string', description: 'The issue key' } }, required: ['issueKey'] } },
  { name: 'jira_transition', label: 'Transition Issue', category: 'jira', description: 'Move a Jira issue to a new workflow status via a transition.', parameters: { type: 'object', properties: { issueKey: { type: 'string', description: 'The issue key' }, transitionId: { type: 'string', description: 'The transition ID to execute' } }, required: ['issueKey', 'transitionId'] } },
  { name: 'jira_project_get', label: 'Get Project', category: 'jira', description: 'Get Jira project details by project key. Returns project info, lead, and issue types.', parameters: { type: 'object', properties: { projectKey: { type: 'string', description: 'The project key' } }, required: ['projectKey'] } },
  { name: 'jira_users_search', label: 'Search Users', category: 'jira', description: 'Search for Jira users by query string. Returns matching user accounts.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search query for username or display name' } }, required: ['query'] } },
  // ── Confluence REST API ──
  { name: 'confluence_content_list', label: 'List Content', category: 'confluence', description: 'List Confluence content (pages, blog posts). Supports filtering by space, type, and title.', parameters: { type: 'object', properties: { spaceKey: { type: 'string', description: 'Optional space key to filter by' }, type: { type: 'string', description: 'Content type: page or blogpost' }, title: { type: 'string', description: 'Optional title filter' } }, required: [] } },
  { name: 'confluence_content_create', label: 'Create Content', category: 'confluence', description: 'Create a new Confluence page or blog post in a space.', parameters: { type: 'object', properties: { spaceKey: { type: 'string', description: 'The space key to create content in' }, title: { type: 'string', description: 'Page title' }, type: { type: 'string', description: 'Content type: page or blogpost' }, body: { type: 'string', description: 'HTML body content' } }, required: ['spaceKey', 'title', 'type', 'body'] } },
  { name: 'confluence_content_get', label: 'Get Content', category: 'confluence', description: 'Get a specific Confluence page or post by its content ID.', parameters: { type: 'object', properties: { contentId: { type: 'string', description: 'The content ID' } }, required: ['contentId'] } },
  { name: 'confluence_content_update', label: 'Update Content', category: 'confluence', description: 'Update an existing Confluence page. Requires the current version number.', parameters: { type: 'object', properties: { contentId: { type: 'string', description: 'The content ID' }, title: { type: 'string', description: 'Updated title' }, body: { type: 'string', description: 'Updated HTML body' }, version: { type: 'string', description: 'Current version number (for conflict detection)' } }, required: ['contentId', 'title', 'body', 'version'] } },
  { name: 'confluence_content_delete', label: 'Delete Content', category: 'confluence', description: 'Delete a Confluence page or post by content ID.', parameters: { type: 'object', properties: { contentId: { type: 'string', description: 'The content ID to delete' } }, required: ['contentId'] } },
  { name: 'confluence_search', label: 'Search', category: 'confluence', description: 'Search Confluence using CQL (Confluence Query Language). Returns matching pages and spaces.', parameters: { type: 'object', properties: { cql: { type: 'string', description: 'CQL query string (e.g. type=page AND space=DEV)' } }, required: ['cql'] } },
  { name: 'confluence_space_list', label: 'List Spaces', category: 'confluence', description: 'List all Confluence spaces. Returns space keys, names, and types.', parameters: { type: 'object', properties: {}, required: [] } },
  { name: 'confluence_space_create', label: 'Create Space', category: 'confluence', description: 'Create a new Confluence space with a key and name.', parameters: { type: 'object', properties: { key: { type: 'string', description: 'Space key (short unique identifier)' }, name: { type: 'string', description: 'Space name' } }, required: ['key', 'name'] } },
  { name: 'confluence_space_get', label: 'Get Space', category: 'confluence', description: 'Get details of a specific Confluence space by its key.', parameters: { type: 'object', properties: { spaceKey: { type: 'string', description: 'The space key' } }, required: ['spaceKey'] } },
  { name: 'confluence_user_current', label: 'Current User', category: 'confluence', description: 'Get the currently authenticated Confluence user profile.', parameters: { type: 'object', properties: {}, required: [] } },
  { name: 'confluence_group_list', label: 'List Groups', category: 'confluence', description: 'List all Confluence groups.', parameters: { type: 'object', properties: {}, required: [] } },
  { name: 'confluence_group_members', label: 'Group Members', category: 'confluence', description: 'Get members of a specific Confluence group.', parameters: { type: 'object', properties: { groupName: { type: 'string', description: 'The group name' } }, required: ['groupName'] } },
  // ── GitHub REST API ──
  // GitHub instance is configured server-side via AppYamlConfig providers.github.base_url (per APP_ENV).
  // Set GITHUB_API_BASE_URL env var to target a GitHub Enterprise instance.
  { name: 'github_repo_get', label: 'Get Repo', category: 'github', description: 'Get repository details including description, stars, language, and default branch.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repository owner (user or org)' }, repo: { type: 'string', description: 'Repository name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_branches', label: 'List Branches', category: 'github', description: 'List all branches in a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_commits', label: 'List Commits', category: 'github', description: 'List recent commits on a repository. Optionally filter by branch.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' }, sha: { type: 'string', description: 'Optional branch name or SHA to list commits from' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_contents', label: 'Get Contents', category: 'github', description: 'Get file or directory contents from a repository at the root level.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_languages', label: 'Languages', category: 'github', description: 'Get the language breakdown for a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_contributors', label: 'Contributors', category: 'github', description: 'List contributors to a repository with commit counts.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_tags', label: 'List Tags', category: 'github', description: 'List tags in a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_releases', label: 'List Releases', category: 'github', description: 'List releases for a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_release_latest', label: 'Latest Release', category: 'github', description: 'Get the latest published release for a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_repo_collaborators', label: 'Collaborators', category: 'github', description: 'List collaborators on a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_actions_workflows', label: 'List Workflows', category: 'github', description: 'List GitHub Actions workflows configured for a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_actions_runs', label: 'List Workflow Runs', category: 'github', description: 'List recent workflow runs for a repository.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' } }, required: ['owner', 'repo'] } },
  { name: 'github_actions_run_get', label: 'Get Workflow Run', category: 'github', description: 'Get details of a specific workflow run by run ID.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' }, runId: { type: 'string', description: 'Workflow run ID' } }, required: ['owner', 'repo', 'runId'] } },
  { name: 'github_actions_run_jobs', label: 'Run Jobs', category: 'github', description: 'List jobs for a specific workflow run.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' }, runId: { type: 'string', description: 'Workflow run ID' } }, required: ['owner', 'repo', 'runId'] } },
  { name: 'github_actions_run_cancel', label: 'Cancel Run', category: 'github', description: 'Cancel a workflow run in progress.', parameters: { type: 'object', properties: { owner: { type: 'string', description: 'Repo owner' }, repo: { type: 'string', description: 'Repo name' }, runId: { type: 'string', description: 'Workflow run ID' } }, required: ['owner', 'repo', 'runId'] } },
  { name: 'github_repos_me', label: 'My Repos', category: 'github', description: 'List repositories for the authenticated user.', parameters: { type: 'object', properties: {}, required: [] } },
  { name: 'github_repos_org', label: 'Org Repos', category: 'github', description: 'List repositories for an organization.', parameters: { type: 'object', properties: { org: { type: 'string', description: 'The organization name' } }, required: ['org'] } },
];

interface ToolPreset {
  id: string;
  label: string;
  category?: ToolCategory | 'all';
  prompt: string;
  tools: string[];
}

const TOOL_PRESETS: ToolPreset[] = [
  // ── Figma Presets ──
  {
    id: 'inspect-components',
    label: 'Figma: Inspect Components',
    category: 'figma',
    prompt: 'I have a Figma file with key "abc123". Get all the components in the file, then retrieve the specific nodes for the main button and card components.',
    tools: ['figma_file_get', 'figma_file_components', 'figma_file_nodes'],
  },
  {
    id: 'design-tokens',
    label: 'Figma: Design Tokens',
    category: 'figma',
    prompt: 'Get the design tokens (local variables) from Figma file "abc123", including all color, spacing, and typography tokens. Also fetch the published styles.',
    tools: ['figma_variables_local', 'figma_file_styles'],
  },
  {
    id: 'team-library',
    label: 'Figma: Team Library',
    category: 'figma',
    prompt: 'List all published components and styles for team "design-system-team". I want to audit the shared component library and style guide.',
    tools: ['figma_team_components', 'figma_team_styles'],
  },
  {
    id: 'export-assets',
    label: 'Figma: Export Assets',
    category: 'figma',
    prompt: 'From Figma file "abc123", get the components list, then export images for the icon components as SVG format.',
    tools: ['figma_file_components', 'figma_file_images'],
  },
  {
    id: 'full-audit',
    label: 'Figma: Full Audit',
    category: 'figma',
    prompt: 'I have a Figma file with key "abc123". Get all the components in the file, look up the design tokens (local variables), fetch the team components for team "design-system-team", and export the main frame as PNG.',
    tools: ['figma_file_get', 'figma_file_components', 'figma_variables_local', 'figma_team_components', 'figma_file_images'],
  },
  {
    id: 'inspector-deep-dive',
    label: 'Figma: Inspector Deep Dive',
    category: 'figma',
    prompt: 'Inspect Figma file "abc123" using the component inspector: get the file metadata, list all components, extract design variables, and check the inspector health status.',
    tools: ['figma_inspector_health', 'figma_inspector_file', 'figma_inspector_components', 'figma_inspector_variables'],
  },
  {
    id: 'inspector-comments',
    label: 'Figma: Inspector Comments',
    category: 'figma',
    prompt: 'List all comments in the inspector system, then create a new comment saying "Review needed for spacing tokens" on file "abc123".',
    tools: ['figma_inspector_comments_list', 'figma_inspector_comments_create'],
  },
  {
    id: 'health-check-all',
    label: 'Figma: Health Check All',
    category: 'figma',
    prompt: 'Check the health status of all Figma-related services: the API provider, the component inspector, and the admin integration health endpoints.',
    tools: ['figma_api_health', 'figma_inspector_health', 'healthz_integration_figma', 'healthz_integration_figma_config'],
  },
  // ── Jira Presets ──
  { id: 'jira-issue-workflow', label: 'Jira: Issue Workflow', category: 'jira', prompt: 'Get the details of Jira issue "PROJ-123", check what transitions are available, then move it to "In Progress" status.', tools: ['jira_issue_get', 'jira_transitions_list', 'jira_transition'] },
  { id: 'jira-create-bug', label: 'Jira: Create Bug Report', category: 'jira', prompt: 'Create a new Bug in project "PROJ" with summary "Login page 500 error on invalid email" and description "Steps to reproduce: 1. Go to /login 2. Enter invalid email format 3. Click submit". Then get the project details.', tools: ['jira_issue_create', 'jira_project_get'] },
  { id: 'jira-team-lookup', label: 'Jira: Team Lookup', category: 'jira', prompt: 'Search for users with "john" in their name, then get the details of project "MOBILE" to see the team structure.', tools: ['jira_users_search', 'jira_project_get'] },
  // ── Confluence Presets ──
  { id: 'confluence-search-docs', label: 'Confluence: Search & Read', category: 'confluence', prompt: 'Search Confluence for pages about "API documentation" and then get the full content of the first result.', tools: ['confluence_search', 'confluence_content_get'] },
  { id: 'confluence-create-page', label: 'Confluence: Create Page', category: 'confluence', prompt: 'Get the DEV space details, then create a new page titled "Sprint 42 Retrospective" with a summary of action items in that space.', tools: ['confluence_space_get', 'confluence_content_create'] },
  { id: 'confluence-space-audit', label: 'Confluence: Space Audit', category: 'confluence', prompt: 'List all Confluence spaces, get details for the "ENG" space, list its content, and check what groups exist and who is in the "engineering" group.', tools: ['confluence_space_list', 'confluence_space_get', 'confluence_content_list', 'confluence_group_list', 'confluence_group_members'] },
  // ── GitHub Presets ──
  { id: 'github-repo-overview', label: 'GitHub: Repo Overview', category: 'github', prompt: 'Get the details of the "facebook/react" repository, list its languages, recent tags, and the latest release.', tools: ['github_repo_get', 'github_repo_languages', 'github_repo_tags', 'github_release_latest'] },
  { id: 'github-ci-status', label: 'GitHub: CI/CD Status', category: 'github', prompt: 'For repo "my-org/my-app", list the GitHub Actions workflows, get recent workflow runs, and check the jobs for the latest run.', tools: ['github_actions_workflows', 'github_actions_runs', 'github_actions_run_get', 'github_actions_run_jobs'] },
  { id: 'github-team-repos', label: 'GitHub: Org Repos', category: 'github', prompt: 'List all repositories for organization "my-org" and check the collaborators on the "my-org/platform" repo.', tools: ['github_repos_org', 'github_repo_collaborators'] },
  // ── Cross-Provider ──
  { id: 'cross-design-to-issue', label: 'Cross: Design → Issue', category: 'all', prompt: 'Get the components from Figma file "abc123", then create a Jira Bug in project "DESIGN" reporting that the Button component needs a hover state, and create a Confluence page documenting the design review findings.', tools: ['figma_file_components', 'jira_issue_create', 'confluence_content_create'] },
  {
    id: 'custom',
    label: 'Custom (select tools below)',
    prompt: '',
    tools: [],
  },
];

/**
 * Maps tool names to real API endpoint URL templates with HTTP method.
 * - `bodyParams`: params sent as JSON body (POST/PATCH)
 * - `headerParams`: params sent as HTTP request headers (e.g. GHE instance override)
 */
const TOOL_API_MAP: Record<string, { method: string; path: string; bodyParams?: string[]; headerParams?: Record<string, string> }> = {
  // ── Figma REST API (provider proxy) ──
  figma_file_get:        { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}' },
  figma_file_components: { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/components' },
  figma_file_nodes:      { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/nodes' },
  figma_file_images:     { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/images' },
  figma_file_comments:   { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/comments' },
  figma_file_versions:   { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/versions' },
  figma_variables_local: { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/variables/local' },
  figma_variables_published: { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/files/{fileKey}/variables/published' },
  figma_file_styles:     { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/styles/{key}' },
  figma_team_projects:   { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/teams/{teamId}/projects' },
  figma_team_components: { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/teams/{teamId}/components' },
  figma_team_styles:     { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/teams/{teamId}/styles' },
  figma_component_get:   { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/components/{key}' },
  figma_style_get:       { method: 'GET', path: '/~/api/rest/02-01-2026/providers/figma_api/v1/styles/{key}' },
  // ── Figma Component Inspector ──
  figma_inspector_health:          { method: 'GET',    path: '/~/api/figma_component_inspector/health' },
  figma_inspector_components:      { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}/components' },
  figma_inspector_file:            { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}' },
  figma_inspector_file_comments:   { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}/comments' },
  figma_inspector_images:          { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}/images' },
  figma_inspector_node:            { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}/nodes/{nodeId}' },
  figma_inspector_variables:       { method: 'GET',    path: '/~/api/figma_component_inspector/files/{fileId}/variables' },
  figma_inspector_comments_list:   { method: 'GET',    path: '/~/api/figma_component_inspector/comments' },
  figma_inspector_comments_create: { method: 'POST',   path: '/~/api/figma_component_inspector/comments', bodyParams: ['text', 'fileId', 'nodeId'] },
  figma_inspector_comment_update:  { method: 'PATCH',  path: '/~/api/figma_component_inspector/comments/{commentId}', bodyParams: ['text'] },
  figma_inspector_comment_delete:  { method: 'DELETE',  path: '/~/api/figma_component_inspector/comments/{commentId}' },
  figma_inspector_comment_reply:   { method: 'POST',   path: '/~/api/figma_component_inspector/comments/{commentId}/replies', bodyParams: ['text'] },
  // ── Health / Admin ──
  figma_api_health:                { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/figma_api/health' },
  healthz_integration_figma:       { method: 'GET',    path: '/admin/healthz/integrations/figma' },
  healthz_integration_figma_config:{ method: 'GET',    path: '/admin/healthz/integrations/figma/config' },
  // ── Jira REST API ──
  jira_issue_create:     { method: 'POST',  path: '/~/api/rest/02-01-2026/providers/jira_api/v3/issues', bodyParams: ['projectKey', 'summary', 'issueType', 'description'] },
  jira_issue_get:        { method: 'GET',   path: '/~/api/rest/02-01-2026/providers/jira_api/v3/issues/{issueKey}' },
  jira_issue_update:     { method: 'PATCH', path: '/~/api/rest/02-01-2026/providers/jira_api/v3/issues/{issueKey}', bodyParams: ['summary', 'description'] },
  jira_transitions_list: { method: 'GET',   path: '/~/api/rest/02-01-2026/providers/jira_api/v3/issues/{issueKey}/transitions' },
  jira_transition:       { method: 'POST',  path: '/~/api/rest/02-01-2026/providers/jira_api/v3/issues/{issueKey}/transitions', bodyParams: ['transitionId'] },
  jira_project_get:      { method: 'GET',   path: '/~/api/rest/02-01-2026/providers/jira_api/v3/projects/{projectKey}' },
  jira_users_search:     { method: 'GET',   path: '/~/api/rest/02-01-2026/providers/jira_api/v3/users/search' },
  // ── Confluence REST API ──
  confluence_content_list:   { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/content' },
  confluence_content_create: { method: 'POST',   path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/content', bodyParams: ['spaceKey', 'title', 'type', 'body'] },
  confluence_content_get:    { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/content/{contentId}' },
  confluence_content_update: { method: 'PUT',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/content/{contentId}', bodyParams: ['title', 'body', 'version'] },
  confluence_content_delete: { method: 'DELETE', path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/content/{contentId}' },
  confluence_search:         { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/search' },
  confluence_space_list:     { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/space' },
  confluence_space_create:   { method: 'POST',   path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/space', bodyParams: ['key', 'name'] },
  confluence_space_get:      { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/space/{spaceKey}' },
  confluence_user_current:   { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/user/current' },
  confluence_group_list:     { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/group' },
  confluence_group_members:  { method: 'GET',    path: '/~/api/rest/02-01-2026/providers/confluence_api/v9/group/{groupName}/member' },
  // ── GitHub REST API ──
  github_repo_get:            { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}' },
  github_repo_branches:       { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/branches' },
  github_repo_commits:        { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/commits' },
  github_repo_contents:       { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/contents' },
  github_repo_languages:      { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/languages' },
  github_repo_contributors:   { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/contributors' },
  github_repo_tags:           { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/tags' },
  github_repo_releases:       { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/releases' },
  github_release_latest:      { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/releases/latest' },
  github_repo_collaborators:  { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/collaborators' },
  github_actions_workflows:   { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/actions/workflows' },
  github_actions_runs:        { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/actions/runs' },
  github_actions_run_get:     { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/actions/runs/{runId}' },
  github_actions_run_jobs:    { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/actions/runs/{runId}/jobs' },
  github_actions_run_cancel:  { method: 'POST', path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/{owner}/{repo}/actions/runs/{runId}/cancel' },
  github_repos_me:            { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/me' },
  github_repos_org:           { method: 'GET',  path: '/~/api/rest/02-01-2026/providers/github_api/2022-11-28/repos/org/{org}' },
};

interface ToolCallResult {
  id: string;
  function: string;
  arguments: Record<string, string>;
  apiUrl: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  data?: unknown;
  error?: string;
  duration?: number;
}

/**
 * Build a real API URL from a tool call by substituting path params.
 * Query params (like `ids`, `format`) that aren't in the path template are appended as query string.
 */
function buildToolUrl(toolName: string, args: Record<string, string>): string | null {
  const mapping = TOOL_API_MAP[toolName];
  if (!mapping) return null;

  let url = mapping.path;
  const queryParams: Record<string, string> = {};
  const bodyParamSet = new Set(mapping.bodyParams ?? []);
  const headerParamKeys = new Set(Object.keys(mapping.headerParams ?? {}));

  for (const [key, value] of Object.entries(args)) {
    const placeholder = `{${key}}`;
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, encodeURIComponent(value));
    } else if (!bodyParamSet.has(key) && !headerParamKeys.has(key)) {
      // Only add to query string if it's not a body or header param
      queryParams[key] = value;
    }
  }

  const qs = new URLSearchParams(queryParams).toString();
  return qs ? `${url}?${qs}` : url;
}

/** Execute a single tool call against the real API (supports GET, POST, PATCH, DELETE, header overrides). */
async function executeSingleToolCall(
  toolName: string,
  args: Record<string, string>,
): Promise<{ data?: unknown; error?: string; url: string; method: string; duration: number }> {
  const mapping = TOOL_API_MAP[toolName];
  const url = buildToolUrl(toolName, args);
  if (!url || !mapping) {
    return { error: `No API mapping for tool: ${toolName}`, url: '', method: 'GET', duration: 0 };
  }

  const method = mapping.method;
  const headers: Record<string, string> = {};

  // Extract header params (e.g. githubInstance → X-GitHub-Base-URL)
  if (mapping.headerParams) {
    for (const [argName, headerName] of Object.entries(mapping.headerParams)) {
      if (args[argName]) {
        headers[headerName] = args[argName];
      }
    }
  }

  // For POST/PATCH/PUT, extract body params from args
  const fetchOpts: RequestInit = { method };
  if ((method === 'POST' || method === 'PATCH' || method === 'PUT') && mapping.bodyParams) {
    const body: Record<string, string> = {};
    for (const key of mapping.bodyParams) {
      if (args[key] !== undefined) body[key] = args[key];
    }
    if (Object.keys(body).length > 0) {
      headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(body);
    }
  }

  if (Object.keys(headers).length > 0) {
    fetchOpts.headers = headers;
  }

  const start = performance.now();
  try {
    const response = await fetch(url, fetchOpts);
    const duration = performance.now() - start;
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      return { error: `${response.status} ${response.statusText}: ${text}`, url, method, duration };
    }
    // DELETE may return 204 with no body
    if (response.status === 204) {
      return { data: { success: true }, url, method, duration };
    }
    const data = await response.json();
    return { data, url, method, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { error: err instanceof Error ? err.message : String(err), url, method, duration };
  }
}

/**
 * Expose tool functions on window for browser console / LLM-driven execution.
 * Usage from console:
 *   window.figmaTools.list()                       // list all tool names
 *   window.figmaTools.call('figma_file_get', { fileKey: 'abc123' })
 *   window.figmaTools.buildUrl('figma_file_get', { fileKey: 'abc123' })
 *   window.figmaTools.getMap()                     // full TOOL_API_MAP
 */
const figmaToolsApi = {
  list: () => ALL_TOOLS.map((t) => ({ name: t.name, label: t.label, category: t.category, description: t.description })),
  call: (toolName: string, args: Record<string, string> = {}) => executeSingleToolCall(toolName, args),
  buildUrl: (toolName: string, args: Record<string, string> = {}) => buildToolUrl(toolName, args),
  getMap: () => ({ ...TOOL_API_MAP }),
  getTools: () => [...ALL_TOOLS],
};

(window as unknown as Record<string, unknown>).figmaTools = figmaToolsApi;

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [apiEndpoints, setApiEndpoints] = useState<Array<{key: string;} & EndpointConfig>>([]);
  const [server, setServer] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath);
  const [requestState, setRequestState] = useState<RequestState>(initialRequestState);
  const [resultTab, setResultTab] = useState<ResultTab>('response');
  const [connectionConfig, setConnectionConfig] = useState<Record<string, unknown> | null>(null);

  // Sync URL on mount + handle browser back/forward
  useEffect(() => {
    // If user lands on bare path, set URL to current tab
    pushTabUrl(activeTab);
    const onPopState = () => setActiveTab(getTabFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    pushTabUrl(tab);
    setRequestState(initialRequestState);
  }, []);

  // Load config on mount
  useEffect(() => {
    loadRouterConfig().
    then(() => {
      const eps = getEndpointsByTag('api');
      setApiEndpoints(eps);
      if (eps.length > 0) setServer(eps[0].key);
      setConfigLoaded(true);
    }).
    catch((err) => {
      setConfigError(err.message);
    });
  }, []);

  // Fetch provider connection config (proxy, auth, ssl) from admin healthz
  useEffect(() => {
    if (!configLoaded || !server) return;
    const epConfig = getEndpoint(server);
    const adminUrl = `${epConfig.baseUrl}/healthz/admin/integration/${SDK_PROVIDER_ROUTE}`;
    (async () => {
      try {
        const res = await fetch(adminUrl);
        if (!res.ok) return;
        const data = await res.json();
        if (data.connection_details) {
          setConnectionConfig(data.connection_details);
        }
      } catch { /* non-critical */ }
    })();
  }, [configLoaded, server]);

  // Form states
  const [chatPrompt, setChatPrompt] = useState('Generate a React Banner component using TypeScript and Tailwind CSS. It should accept props for title (string), subtitle (optional string), variant (info | success | warning | error), and an optional onDismiss callback. Include an icon for each variant and a close button when onDismiss is provided.');
  const [chatModel, setChatModel] = useState('flash');
  const [chatTemp, setChatTemp] = useState(0.7);

  const [streamPrompt, setStreamPrompt] = useState('Generate a React Banner component using TypeScript and Tailwind CSS. It should accept props for title (string), subtitle (optional string), variant (info | success | warning | error), and an optional onDismiss callback. Include an icon for each variant and a close button when onDismiss is provided.');
  const [streamOutput, setStreamOutput] = useState('');

  const [structurePrompt, setStructurePrompt] = useState('Generate a React page called "DashboardPage" that uses the following components: a Header with title and user avatar, a Sidebar with navigation links, a StatsGrid showing 4 metric cards (total users, revenue, active sessions, conversion rate), a RecentActivityFeed with timestamps, and a Footer. Use TypeScript, Tailwind CSS, and React hooks for state management. Include loading and error states.');
  const [structureSchema, setStructureSchema] = useState(
    JSON.stringify({
      pageName: 'string',
      components: [{ name: 'string', props: [{ name: 'string', type: 'string', required: 'boolean' }], children: 'boolean' }],
      hooks: [{ name: 'string', purpose: 'string', returnType: 'string' }],
      state: [{ variable: 'string', type: 'string', initialValue: 'string', setter: 'string' }],
      imports: [{ module: 'string', namedExports: ['string'] }],
      layout: { type: 'string', sections: ['string'], responsive: 'boolean' }
    }, null, 2)
  );

  const [toolPrompt, setToolPrompt] = useState(TOOL_PRESETS[0].prompt);
  const [toolPreset, setToolPreset] = useState<string>(TOOL_PRESETS[0].id);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(() => new Set(TOOL_PRESETS[0].tools));
  const [toolResults, setToolResults] = useState<ToolCallResult[]>([]);
  const [toolAutoExecute, setToolAutoExecute] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<ToolCategory>>(new Set(['figma', 'jira', 'confluence', 'github']));

  const handlePresetChange = useCallback((presetId: string) => {
    setToolPreset(presetId);
    const preset = TOOL_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== 'custom') {
      setToolPrompt(preset.prompt);
      setEnabledTools(new Set(preset.tools));
      if (preset.category && preset.category !== 'all') {
        setActiveCategories(new Set([preset.category]));
      } else {
        setActiveCategories(new Set(['figma', 'jira', 'confluence', 'github']));
      }
    }
  }, []);

  const toggleTool = useCallback((toolName: string) => {
    setToolPreset('custom');
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolName)) next.delete(toolName);
      else next.add(toolName);
      return next;
    });
  }, []);

  const toggleAllTools = useCallback((checked: boolean) => {
    setToolPreset('custom');
    setEnabledTools(checked ? new Set(ALL_TOOLS.map((t) => t.name)) : new Set());
  }, []);

  const [jsonPrompt, setJsonPrompt] = useState('List 3 programming languages with their year of creation.');

  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
  { role: 'user', content: 'Hello!' }]
  );
  const [newMessage, setNewMessage] = useState('');

  // Only access services after config is loaded
  const service = configLoaded ? services[server] : null;

  const executeRequest = useCallback(
    async (request: unknown, fn: () => Promise<unknown>) => {
      setRequestState({ loading: true, error: null, request, response: null, duration: null });
      setResultTab('response');
      const start = performance.now();
      try {
        const response = await fn();
        const duration = performance.now() - start;
        setRequestState({ loading: false, error: null, request, response, duration });
      } catch (err) {
        const duration = performance.now() - start;
        const errorInfo: ErrorInfo = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        };
        setRequestState({
          loading: false,
          error: errorInfo,
          request,
          response: null,
          duration
        });
        setResultTab('exception');
      }
    },
    []
  );

  const baseUrl = service?.baseUrl ?? '';

  /** Build verbose request info including server-side connection config */
  const buildRequestInfo = useCallback((path: string, body: unknown) => {
    const epConfig = configLoaded ? getEndpoint(server) : null;
    const cd = connectionConfig;
    const obj = (v: unknown) => v && typeof v === 'object' && Object.keys(v as object).length > 0;
    return {
      method: 'POST',
      url: `${baseUrl}${path}`,
      headers: obj(cd?.headers) ? maskSecrets(cd!.headers) : (epConfig ? maskSecrets(epConfig.headers) : {}),
      auth: obj(cd?.auth) ? maskSecrets(cd!.auth) : '(not available)',
      resolved_auth_headers: obj(cd?.resolved_auth_headers) ? maskSecrets(cd!.resolved_auth_headers) : undefined,
      proxy: obj(cd?.proxy) ? maskSecrets(cd!.proxy) : (cd ? '(none)' : '(not available)'),
      ssl: obj(cd?.ssl) ? cd!.ssl : (cd ? '(none)' : '(not available)'),
      client: obj(cd?.client) ? cd!.client : undefined,
      endpoint_config: cd ? {
        base_url: cd.base_url,
        health_endpoint: cd.health_endpoint,
        method: cd.method,
        model: cd.model,
      } : {
        service_id: server,
        base_url: epConfig?.baseUrl,
        timeout: epConfig?.timeout,
      },
      env_vars_available: obj(cd?.env_vars_available) ? cd!.env_vars_available : undefined,
      body,
    };
  }, [configLoaded, server, baseUrl, connectionConfig]);

  const handleHealth = () => {
    return executeRequest(
      buildRequestInfo('/health', undefined),
      () => service!.health()
    );
  };

  const handleChat = () => {
    const body = { prompt: chatPrompt, model: chatModel, temperature: chatTemp };
    return executeRequest(
      buildRequestInfo('/chat', body),
      () => service!.chat(body)
    );
  };

  const handleStream = async () => {
    const body = { prompt: streamPrompt };
    const req = buildRequestInfo('/stream', body);
    setRequestState({ loading: true, error: null, request: req, response: null, duration: null });
    setResultTab('response');
    setStreamOutput('');
    const start = performance.now();
    try {
      for await (const chunk of service!.stream(body)) {
        setStreamOutput((prev) => prev + chunk);
      }
      const duration = performance.now() - start;
      setRequestState({ loading: false, error: null, request: req, response: { streamed: true }, duration });
    } catch (err) {
      const duration = performance.now() - start;
      const errorInfo: ErrorInfo = {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      };
      setRequestState({
        loading: false,
        error: errorInfo,
        request: req,
        response: null,
        duration
      });
      setResultTab('exception');
    }
  };

  const handleStructure = () => {
    let schema: Record<string, unknown>;
    try {
      schema = JSON.parse(structureSchema);
    } catch (err) {
      const errorInfo: ErrorInfo = {
        message: 'Invalid JSON schema',
        stack: err instanceof Error ? err.stack : undefined
      };
      setRequestState({
        loading: false,
        error: errorInfo,
        request: buildRequestInfo('/structure', { prompt: structurePrompt, schema: structureSchema }),
        response: null,
        duration: null
      });
      setResultTab('exception');
      return;
    }
    const body = { prompt: structurePrompt, schema };
    executeRequest(
      buildRequestInfo('/structure', body),
      () => service!.structure(body)
    );
  };

  const handleToolCall = async () => {
    const selectedTools = ALL_TOOLS
      .filter((t) => enabledTools.has(t.name))
      .map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));

    if (selectedTools.length === 0) return;

    const body = { prompt: toolPrompt, tools: selectedTools };
    const req = buildRequestInfo('/tool-call', body);

    setRequestState({ loading: true, error: null, request: req, response: null, duration: null });
    setResultTab('response');
    setToolResults([]);

    const start = performance.now();
    try {
      const llmResponse = await service!.toolCall(body) as unknown as {
        tool_calls?: Array<{ id: string; function: string; arguments: Record<string, string> }>;
        [key: string]: unknown;
      };
      const llmDuration = performance.now() - start;

      // If LLM returned tool_calls and auto-execute is on, run them against real APIs
      if (toolAutoExecute && llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
        const pending: ToolCallResult[] = llmResponse.tool_calls.map((tc) => ({
          id: tc.id,
          function: tc.function,
          arguments: tc.arguments,
          apiUrl: buildToolUrl(tc.function, tc.arguments) || '',
          status: 'pending' as const,
        }));
        setToolResults(pending);
        setRequestState({ loading: true, error: null, request: req, response: { llm: llmResponse, phase: 'executing_tools' }, duration: llmDuration });

        // Execute all tool calls in parallel
        const execResults = await Promise.all(
          llmResponse.tool_calls.map(async (tc, i) => {
            // Mark as loading
            setToolResults((prev) => prev.map((r, j) => j === i ? { ...r, status: 'loading' as const } : r));

            const result = await executeSingleToolCall(tc.function, tc.arguments);

            const updated: ToolCallResult = {
              id: tc.id,
              function: tc.function,
              arguments: tc.arguments,
              apiUrl: result.url,
              status: result.error ? 'error' : 'success',
              data: result.data,
              error: result.error,
              duration: result.duration,
            };

            setToolResults((prev) => prev.map((r, j) => j === i ? updated : r));
            return updated;
          })
        );

        const totalDuration = performance.now() - start;
        setRequestState({
          loading: false,
          error: null,
          request: req,
          response: {
            llm: llmResponse,
            llm_duration_ms: Math.round(llmDuration),
            tool_executions: execResults.map((r) => ({
              function: r.function,
              arguments: r.arguments,
              api_url: r.apiUrl,
              status: r.status,
              duration_ms: r.duration ? Math.round(r.duration) : null,
              data: r.data,
              error: r.error,
            })),
            total_duration_ms: Math.round(totalDuration),
          },
          duration: totalDuration,
        });
      } else {
        // No tool calls or auto-execute off — show raw LLM response
        setRequestState({ loading: false, error: null, request: req, response: llmResponse, duration: llmDuration });
      }
    } catch (err) {
      const duration = performance.now() - start;
      const errorInfo: ErrorInfo = {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      };
      setRequestState({ loading: false, error: errorInfo, request: req, response: null, duration });
      setResultTab('exception');
    }
  };

  /** Manually execute a single pending tool call result. */
  const executeOneToolCall = async (index: number) => {
    const tc = toolResults[index];
    if (!tc || tc.status === 'loading') return;

    setToolResults((prev) => prev.map((r, i) => i === index ? { ...r, status: 'loading' } : r));
    const result = await executeSingleToolCall(tc.function, tc.arguments);
    setToolResults((prev) => prev.map((r, i) => i === index ? {
      ...r,
      apiUrl: result.url,
      status: result.error ? 'error' : 'success',
      data: result.data,
      error: result.error,
      duration: result.duration,
    } : r));
  };

  const handleJson = () => {
    const body = { prompt: jsonPrompt };
    return executeRequest(
      buildRequestInfo('/json', body),
      () => service!.json(body)
    );
  };

  const handleConversation = () => {
    const body = { messages: conversationMessages };
    return executeRequest(
      buildRequestInfo('/conversation', body),
      () => service!.conversation(body)
    );
  };

  const addMessage = () => {
    if (!newMessage.trim()) return;
    setConversationMessages((prev) => [...prev, { role: 'user', content: newMessage }]);
    setNewMessage('');
  };

  // Gemini Chat handlers
  const handleGeminiChatMessage = useCallback(
    async (messages: {role: string;content: string;}[]) => {
      const typedMessages: ConversationMessage[] = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));
      const body = { messages: typedMessages };
      const request = { method: 'POST', url: `${baseUrl}/conversation`, body };

      setRequestState({ loading: true, error: null, request, response: null, duration: null });
      setResultTab('response');
      const start = performance.now();

      try {
        const response = (await service!.conversation(body)) as {
          assistant_message?: {content?: string;};
          content?: string;
          model?: string;
          usage?: {prompt_tokens?: number;completion_tokens?: number;total_tokens?: number;};
        };
        const duration = performance.now() - start;

        // SDK returns assistant_message.content for conversation endpoint
        const content = response.assistant_message?.content || response.content || '';

        setRequestState({ loading: false, error: null, request, response, duration });

        return {
          content,
          model: response.model,
          usage: response.usage
        };
      } catch (err) {
        const duration = performance.now() - start;
        const errorInfo: ErrorInfo = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        };
        setRequestState({ loading: false, error: errorInfo, request, response: null, duration });
        setResultTab('exception');
        throw err;
      }
    },
    [service, baseUrl]
  );

  const handleGeminiStructuredMessage = useCallback(
    async (prompt: string, schema: Record<string, unknown>): Promise<StructuredChatResponse> => {
      const body = { prompt, schema };
      const request = { method: 'POST', url: `${baseUrl}/structure`, body };

      setRequestState({ loading: true, error: null, request, response: null, duration: null });
      setResultTab('response');
      const start = performance.now();

      try {
        const response = (await service!.structure({ prompt, schema })) as {
          parsed?: Record<string, unknown>;
          data?: unknown;
          content?: string;
          model?: string;
          usage?: {prompt_tokens?: number;completion_tokens?: number;total_tokens?: number;};
        };
        const duration = performance.now() - start;

        // SDK returns parsed for structured output
        const data = response.parsed || response.data;

        setRequestState({ loading: false, error: null, request, response, duration });

        return {
          success: true,
          data: data as Record<string, unknown>,
          raw: JSON.stringify(data, null, 2),
          model: response.model || 'gemini',
          usage: response.usage
        };
      } catch (err) {
        const duration = performance.now() - start;
        const errorInfo: ErrorInfo = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        };
        setRequestState({ loading: false, error: errorInfo, request, response: null, duration });
        setResultTab('exception');

        return {
          success: false,
          raw: '',
          error: err instanceof Error ? err.message : 'Failed to get structured response',
          model: ''
        };
      }
    },
    [service, baseUrl]
  );

  const sdkTabs: {id: TabType;label: string;icon: React.ReactNode;}[] = [
  { id: 'health', label: 'Health', icon: <Activity className="w-4 h-4" /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'stream', label: 'Stream', icon: <Zap className="w-4 h-4" /> },
  { id: 'structure', label: 'Structure', icon: <FileJson className="w-4 h-4" /> },
  { id: 'tool-call', label: 'Tool Call', icon: <Wrench className="w-4 h-4" /> },
  { id: 'json', label: 'JSON', icon: <Code className="w-4 h-4" /> },
  { id: 'conversation', label: 'Conversation', icon: <MessagesSquare className="w-4 h-4" /> }];


  const geminiChatTabs: {id: TabType;label: string;icon: React.ReactNode;}[] = [
  { id: 'gemini-chat', label: 'Chat', icon: <Bot className="w-4 h-4" /> },
  { id: 'gemini-structured', label: 'Structured', icon: <LayoutGrid className="w-4 h-4" /> }];


  // Show loading/error state for config
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2">Configuration Error</h2>
          <p className="text-sm">{configError}</p>
        </div>
      </div>);

  }

  if (!configLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading configuration...</span>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4" data-test-id="div-20330950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gemini OpenAI SDK Tester</h1>
              <p className="text-sm text-gray-500">Test integration endpoints</p>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-white"
                disabled={!configLoaded}>

                {apiEndpoints.map((ep) =>
                <option key={ep.key} value={ep.key}>{ep.name || ep.key} — {ep.baseUrl}</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-4">
              {/* SDK Endpoints Section */}
              <div data-test-id="div-ac2f4578">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  SDK Endpoints
                </h3>
                <div className="space-y-1">
                  {sdkTabs.map((tab) =>
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id ?
                    'bg-blue-50 text-blue-700 font-medium' :
                    'text-gray-600 hover:bg-gray-100'}`
                    }>

                      {tab.icon}
                      {tab.label}
                    </button>
                  )}
                </div>
              </div>

              {/* Gemini Chat Section */}
              <div data-test-id="div-dbd1259a">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Gemini Chat
                </h3>
                <div className="space-y-1">
                  {geminiChatTabs.map((tab) =>
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id ?
                    'bg-purple-50 text-purple-700 font-medium' :
                    'text-gray-600 hover:bg-gray-100'}`
                    }>

                      {tab.icon}
                      {tab.label}
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Health Tab */}
            {activeTab === 'health' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Health Check</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/chat &mdash; sends <code className="bg-gray-100 px-1 rounded">{"{ prompt: \"hi\" }"}</code>
                </p>
                <button
                onClick={handleHealth}
                disabled={requestState.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                  {requestState.loading ? 'Checking...' : 'Check Health'}
                </button>
              </div>
            }

            {/* Chat Tab */}
            {activeTab === 'chat' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Chat Completion</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/chat
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm" />

                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <select
                      value={chatModel}
                      onChange={(e) => setChatModel(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm">

                        <option value="flash">flash</option>
                        <option value="pro">pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                      type="number"
                      value={chatTemp}
                      onChange={(e) => setChatTemp(parseFloat(e.target.value))}
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-24 border rounded-md px-3 py-2 text-sm" />

                    </div>
                  </div>
                  <button
                  onClick={handleChat}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            }

            {/* Stream Tab */}
            {activeTab === 'stream' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">SSE Streaming</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/stream
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                    value={streamPrompt}
                    onChange={(e) => setStreamPrompt(e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm" />

                  </div>
                  <button
                  onClick={handleStream}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Streaming...' : 'Start Stream'}
                  </button>
                  {streamOutput &&
                <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stream Output
                      </label>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                        {streamOutput}
                      </div>
                    </div>
                }
                </div>
              </div>
            }

            {/* Structure Tab */}
            {activeTab === 'structure' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Structured JSON Output</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/structure
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                    value={structurePrompt}
                    onChange={(e) => setStructurePrompt(e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm" />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      JSON Schema
                    </label>
                    <textarea
                    value={structureSchema}
                    onChange={(e) => setStructureSchema(e.target.value)}
                    rows={4}
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono" />

                  </div>
                  <button
                  onClick={handleStructure}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Processing...' : 'Extract'}
                  </button>
                </div>
              </div>
            }

            {/* Tool Call Tab */}
            {activeTab === 'tool-call' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Function Calling</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/tool-call
                </p>
                <div className="space-y-4">
                  {/* Preset dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preset</label>
                    <select
                      value={toolPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                      <optgroup label="Figma">
                        {TOOL_PRESETS.filter((p) => p.category === 'figma').map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Jira">
                        {TOOL_PRESETS.filter((p) => p.category === 'jira').map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Confluence">
                        {TOOL_PRESETS.filter((p) => p.category === 'confluence').map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="GitHub">
                        {TOOL_PRESETS.filter((p) => p.category === 'github').map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Cross-Provider">
                        {TOOL_PRESETS.filter((p) => p.category === 'all').map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </optgroup>
                      <option value="custom">Custom (select tools below)</option>
                    </select>
                  </div>

                  {/* Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                      value={toolPrompt}
                      onChange={(e) => { setToolPrompt(e.target.value); setToolPreset('custom'); }}
                      rows={3}
                      className="w-full border rounded-md px-3 py-2 text-sm" />
                  </div>

                  {/* Tool checkboxes */}
                  <div className="bg-gray-50 border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tools ({enabledTools.size}/{ALL_TOOLS.length} selected)
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAllTools(true)}
                          className="text-xs text-blue-600 hover:text-blue-800">
                          All
                        </button>
                        <span className="text-xs text-gray-300">|</span>
                        <button
                          onClick={() => toggleAllTools(false)}
                          className="text-xs text-blue-600 hover:text-blue-800">
                          None
                        </button>
                      </div>
                    </div>
                    {/* Category filter buttons */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Filter:</p>
                      {TOOL_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategories((prev) => {
                            const next = new Set(prev);
                            if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                            return next;
                          })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                            activeCategories.has(cat.id)
                              ? CATEGORY_STYLES[cat.id].active
                              : CATEGORY_STYLES[cat.id].inactive
                          }`}>
                          {cat.label} ({ALL_TOOLS.filter((t) => t.category === cat.id).length})
                        </button>
                      ))}
                    </div>
                    {TOOL_CATEGORIES.filter((cat) => activeCategories.has(cat.id)).map((cat) => {
                      const catTools = ALL_TOOLS.filter((t) => t.category === cat.id);
                      if (catTools.length === 0) return null;
                      return (
                        <div key={cat.id} className="mb-2">
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                            CATEGORY_STYLES[cat.id].active.split(' ').find((c) => c.startsWith('text-')) || 'text-gray-500'
                          }`}>{cat.label}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {catTools.map((tool) => (
                              <label
                                key={tool.name}
                                className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors ${
                                  enabledTools.has(tool.name) ? 'bg-blue-50' : 'hover:bg-gray-100'
                                }`}>
                                <input
                                  type="checkbox"
                                  checked={enabledTools.has(tool.name)}
                                  onChange={() => toggleTool(tool.name)}
                                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-gray-800 block">{tool.label}</span>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tool.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Auto-execute toggle + Call button */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleToolCall}
                      disabled={requestState.loading || enabledTools.size === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                      {requestState.loading ? 'Calling...' : `Call Tool (${enabledTools.size} tools)`}
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toolAutoExecute}
                        onChange={(e) => setToolAutoExecute(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">Auto-execute tool calls against real API</span>
                    </label>
                  </div>

                  {/* Tool Execution Results */}
                  {toolResults.length > 0 && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-800 px-3 py-2">
                        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Tool Execution ({toolResults.filter((r) => r.status === 'success').length}/{toolResults.length} succeeded)
                        </p>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {toolResults.map((result, i) => (
                          <div key={result.id} className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {result.status === 'loading' && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                                {result.status === 'success' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                {result.status === 'error' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                {result.status === 'pending' && (
                                  <button
                                    onClick={() => executeOneToolCall(i)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                    Run
                                  </button>
                                )}
                                <code className="text-sm font-medium text-gray-800">{result.function}</code>
                                <code className="text-xs text-gray-400">({Object.entries(result.arguments).map(([k, v]) => `${k}: "${v}"`).join(', ')})</code>
                              </div>
                              {result.duration != null && (
                                <span className="text-xs text-gray-400">{Math.round(result.duration)}ms</span>
                              )}
                            </div>
                            {result.apiUrl && (
                              <p className="text-xs text-gray-400 font-mono mb-1">GET {result.apiUrl}</p>
                            )}
                            {result.error && (
                              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-xs mt-1">
                                {result.error}
                              </div>
                            )}
                            {result.data != null && (
                              <details className="mt-1">
                                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                  View response data
                                </summary>
                                <pre className="bg-gray-900 text-green-300 p-3 rounded text-xs mt-1 overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            }

            {/* JSON Tab */}
            {activeTab === 'json' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">JSON Mode</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/json
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                    value={jsonPrompt}
                    onChange={(e) => setJsonPrompt(e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm" />

                  </div>
                  <button
                  onClick={handleJson}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Processing...' : 'Get JSON'}
                  </button>
                </div>
              </div>
            }

            {/* Conversation Tab */}
            {activeTab === 'conversation' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Multi-turn Conversation</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-v1/conversation
                </p>
                <div className="space-y-4">
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {conversationMessages.map((msg, i) =>
                  <div
                    key={i}
                    className={`text-sm p-2 rounded ${
                    msg.role === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-gray-50'}`
                    }>

                        <span className="font-medium">{msg.role}:</span> {msg.content}
                      </div>
                  )}
                  </div>
                  <div className="flex gap-2">
                    <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMessage()}
                    placeholder="Add a message..."
                    className="flex-1 border rounded-md px-3 py-2 text-sm" />

                    <button
                    onClick={addMessage}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">

                      Add
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                    onClick={handleConversation}
                    disabled={requestState.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                      {requestState.loading ? 'Sending...' : 'Send Conversation'}
                    </button>
                    <button
                    onClick={() => setConversationMessages([{ role: 'user', content: 'Hello!' }])}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">

                      Reset
                    </button>
                  </div>
                </div>
              </div>
            }

            {/* Gemini Chat Tab */}
            {activeTab === 'gemini-chat' &&
            <GeminiChatTab
              onSendMessage={handleGeminiChatMessage}
              isLoading={requestState.loading} />

            }

            {/* Gemini Structured Tab */}
            {activeTab === 'gemini-structured' &&
            <StructuredChatTab
              onSendMessage={handleGeminiStructuredMessage}
              isLoading={requestState.loading} />

            }

            {/* Request/Response Panel */}
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setResultTab('response')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  resultTab === 'response' ?
                  'border-blue-500 text-blue-600' :
                  'border-transparent text-gray-500 hover:text-gray-700'}`
                  }>

                  Response
                </button>
                <button
                  onClick={() => setResultTab('request')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  resultTab === 'request' ?
                  'border-blue-500 text-blue-600' :
                  'border-transparent text-gray-500 hover:text-gray-700'}`
                  }>

                  Request
                </button>
                {requestState.error &&
                <button
                  onClick={() => setResultTab('exception')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1 ${
                  resultTab === 'exception' ?
                  'border-red-500 text-red-600' :
                  'border-transparent text-red-400 hover:text-red-600'}`
                  }>

                    <XCircle className="w-3 h-3" />
                    Exception
                  </button>
                }
                <div className="flex-1 flex items-center justify-end px-4 gap-2">
                  {requestState.duration !== null &&
                  <span className="text-xs text-gray-500">
                      {requestState.duration.toFixed(0)}ms
                    </span>
                  }
                  {requestState.loading &&
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  }
                  {requestState.response !== null && !requestState.loading &&
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  }
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {resultTab === 'response' &&
                <>
                    {requestState.error &&
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        <span className="font-medium">Error:</span> {requestState.error.message}
                      </div>
                  }
                    {requestState.response !== null &&
                  <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
                        {JSON.stringify(requestState.response, null, 2)}
                      </pre>
                  }
                    {!requestState.loading && requestState.response === null && !requestState.error &&
                  <p className="text-gray-400 text-sm">No response yet. Make a request above.</p>
                  }
                  </>
                }

                {resultTab === 'request' &&
                <>
                    {requestState.request !== null ?
                  <pre className="bg-gray-900 text-blue-300 p-4 rounded-md text-sm overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
                        {JSON.stringify(requestState.request, null, 2)}
                      </pre> :

                  <p className="text-gray-400 text-sm">No request yet. Make a request above.</p>
                  }
                  </>
                }

                {resultTab === 'exception' && requestState.error &&
                <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                      <span className="font-semibold">Error:</span> {requestState.error.message}
                    </div>
                    {requestState.error.stack &&
                  <div>
                        <p className="text-xs text-gray-500 mb-1 font-medium">Stack Trace:</p>
                        <pre className="bg-gray-900 text-red-300 p-4 rounded-md text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">
                          {requestState.error.stack}
                        </pre>
                      </div>
                  }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

export default App;