/**
 * @module cli/commands/issue
 * @description CLI issue commands for the Jira API client.
 */

/**
 * Register issue commands on the Commander program.
 * @param {import('commander').Command} program
 * @param {() => import('../../client/JiraFetchClient.mjs').JiraFetchClient} getClient
 */
export function registerIssueCommands(program, getClient) {
  const issue = program.command('issue').description('Issue operations');

  issue
    .command('get <key>')
    .description('Get an issue by key')
    .option('--json', 'Output as JSON')
    .action(async (key, opts) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      const result = await svc.getIssue(key);
      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        _printIssue(result);
      }
    });

  issue
    .command('create')
    .description('Create a new issue')
    .requiredOption('-p, --project <id>', 'Project ID')
    .requiredOption('-s, --summary <text>', 'Issue summary')
    .requiredOption('-t, --type <id>', 'Issue type ID')
    .option('-d, --description <text>', 'Description')
    .option('-a, --assignee <email>', 'Assignee email')
    .option('-l, --labels <labels>', 'Comma-separated labels')
    .action(async (opts) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const { ProjectService } = await import('../../services/project-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      const labels = opts.labels ? opts.labels.split(',').map((l) => l.trim()) : [];
      const result = await svc.createIssue({
        projectId: opts.project,
        summary: opts.summary,
        issueTypeId: opts.type,
        description: opts.description,
        assigneeEmail: opts.assignee,
        labels,
      });
      console.log(`Issue created: ${result.key}`);
      _printIssue(result);
    });

  issue
    .command('update <key>')
    .description('Update an issue')
    .option('-s, --summary <text>', 'New summary')
    .option('--add-labels <labels>', 'Labels to add (comma-separated)')
    .option('--remove-labels <labels>', 'Labels to remove (comma-separated)')
    .action(async (key, opts) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      if (opts.summary) {
        await svc.updateIssueSummary(key, opts.summary);
        console.log(`Updated summary for ${key}`);
      }
      if (opts.addLabels) {
        const labels = opts.addLabels.split(',').map((l) => l.trim());
        await svc.addLabels(key, labels);
        console.log(`Added labels to ${key}: ${labels.join(', ')}`);
      }
      if (opts.removeLabels) {
        const labels = opts.removeLabels.split(',').map((l) => l.trim());
        await svc.removeLabels(key, labels);
        console.log(`Removed labels from ${key}: ${labels.join(', ')}`);
      }
    });

  issue
    .command('assign <key> <email>')
    .description('Assign an issue to a user')
    .action(async (key, email) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      await svc.assignIssueByEmail(key, email);
      console.log(`Assigned ${key} to ${email}`);
    });

  issue
    .command('transitions <key>')
    .description('List available transitions')
    .action(async (key) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      const transitions = await svc.getAvailableTransitions(key);
      if (!transitions.length) {
        console.log(`No transitions available for ${key}`);
        return;
      }
      console.log(`Transitions for ${key}:`);
      for (const t of transitions) {
        console.log(`  ${t.id}  ${t.name}  -> ${t.to?.name || 'unknown'}`);
      }
    });

  issue
    .command('transition <key> <name>')
    .description('Transition an issue')
    .option('-c, --comment <text>', 'Transition comment')
    .option('-r, --resolution <name>', 'Resolution name')
    .action(async (key, name, opts) => {
      const { IssueService } = await import('../../services/issue-service.mjs');
      const client = getClient();
      const svc = new IssueService(client);
      await svc.transitionIssueByName(key, name, opts.comment, opts.resolution);
      console.log(`Transitioned ${key} using '${name}'`);
    });
}

function _printIssue(issue) {
  const f = issue.fields || {};
  console.log(`Key:      ${issue.key}`);
  console.log(`Summary:  ${f.summary || ''}`);
  console.log(`Status:   ${f.status?.name || ''}`);
  console.log(`Type:     ${f.issuetype?.name || ''}`);
  console.log(`Project:  ${f.project?.name || ''} (${f.project?.key || ''})`);
  console.log(`Assignee: ${f.assignee?.displayName || 'Unassigned'}`);
  if (f.labels?.length) console.log(`Labels:   ${f.labels.join(', ')}`);
}
