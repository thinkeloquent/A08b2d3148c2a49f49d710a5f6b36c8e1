/**
 * @module cli/commands/project
 * @description CLI project commands for the Jira API client.
 */

/**
 * Register project commands on the Commander program.
 * @param {import('commander').Command} program
 * @param {() => import('../../client/JiraFetchClient.mjs').JiraFetchClient} getClient
 */
export function registerProjectCommands(program, getClient) {
  const project = program.command('project').description('Project operations');

  project
    .command('get <key>')
    .description('Get project details')
    .option('--versions', 'Show project versions')
    .action(async (key, opts) => {
      const { ProjectService } = await import('../../services/project-service.mjs');
      const client = getClient();
      const svc = new ProjectService(client);
      const result = await svc.getProject(key);
      console.log(`Key:         ${result.key}`);
      console.log(`Name:        ${result.name}`);
      console.log(`ID:          ${result.id}`);
      if (result.description) console.log(`Description: ${result.description}`);
      if (result.projectTypeKey) console.log(`Type:        ${result.projectTypeKey}`);

      if (opts.versions) {
        const versions = await svc.getProjectVersions(key);
        if (versions.length) {
          console.log(`\nVersions:`);
          for (const v of versions) {
            const status = v.released ? 'Released' : 'Unreleased';
            console.log(`  ${v.name}  [${status}]  ${v.description || ''}`);
          }
        } else {
          console.log(`\nNo versions found for project ${key}`);
        }
      }
    });

  project
    .command('create-version <projectKey> <name>')
    .description('Create a new version')
    .option('-d, --description <text>', 'Version description')
    .action(async (projectKey, name, opts) => {
      const { ProjectService } = await import('../../services/project-service.mjs');
      const client = getClient();
      const svc = new ProjectService(client);
      const version = await svc.createVersion({
        projectKey, versionName: name, description: opts.description,
      });
      console.log(`Version '${name}' created for project ${projectKey}`);
      console.log(`  ID:       ${version.id}`);
      console.log(`  Released: ${version.released ? 'Yes' : 'No'}`);
    });
}
