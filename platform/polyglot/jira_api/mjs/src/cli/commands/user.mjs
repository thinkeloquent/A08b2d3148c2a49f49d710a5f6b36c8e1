/**
 * @module cli/commands/user
 * @description CLI user commands for the Jira API client.
 */

/**
 * Register user commands on the Commander program.
 * @param {import('commander').Command} program
 * @param {() => import('../../client/JiraFetchClient.mjs').JiraFetchClient} getClient
 */
export function registerUserCommands(program, getClient) {
  const user = program.command('user').description('User operations');

  user
    .command('search <query>')
    .description('Search for users')
    .option('-m, --max <n>', 'Maximum results', '50')
    .action(async (query, opts) => {
      const { UserService } = await import('../../services/user-service.mjs');
      const client = getClient();
      const svc = new UserService(client);
      const users = await svc.searchUsers(query, parseInt(opts.max, 10));
      if (!users.length) {
        console.log(`No users found matching '${query}'`);
        return;
      }
      console.log(`Users matching '${query}':`);
      for (const u of users) {
        console.log(`  ${u.displayName}  ${u.emailAddress || 'N/A'}  ${u.accountId}`);
      }
    });

  user
    .command('get <identifier>')
    .description('Get a user by account ID or email')
    .action(async (identifier) => {
      const { UserService } = await import('../../services/user-service.mjs');
      const client = getClient();
      const svc = new UserService(client);
      const result = await svc.getUserByIdentifier(identifier);
      if (!result) {
        console.log(`User '${identifier}' not found`);
        return;
      }
      console.log(`Display Name: ${result.displayName}`);
      console.log(`Email:        ${result.emailAddress || 'N/A'}`);
      console.log(`Account ID:   ${result.accountId}`);
      console.log(`Active:       ${result.active ? 'Yes' : 'No'}`);
    });
}
