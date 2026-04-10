To test interactively:
node platform/tools/analysis_github_component_usage_audit/cli.mjs

# Enter "themeselection, mui" for org → query should show "org:themeselection org:mui"

To test non-interactively (REST tools):
node platform/polyglot/github_sdk_api_all_user_commit/mjs/cli.mjs --org "facebook,microsoft" --token $GH_TOKEN --ignoreDateRange

# Should fetch repos from both orgs
