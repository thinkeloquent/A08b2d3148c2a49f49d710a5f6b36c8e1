export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "/~/api/github_workflow_action_ui",
  githubApiBase:
    "/~/api/rest/02-01-2026/providers/github_api/2022-11-28",
  basePath:
    import.meta.env.VITE_BASE_PATH ||
    window.INITIAL_STATE?.basePath ||
    "/admin/apps/github-workflow-action-ui/",
} as const;
