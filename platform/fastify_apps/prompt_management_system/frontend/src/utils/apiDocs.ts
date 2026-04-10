import type { Prompt, PromptVersion } from '../types';

export function buildApiMarkdown(prompt: Prompt, version: PromptVersion, baseUrl: string): string {
  const slug = prompt.slug;
  const vars = version.variables ?? [];

  const sampleVars = vars.reduce<Record<string, string>>((acc, v) => {
    acc[v.key] = v.default_value || `<${v.key}>`;
    return acc;
  }, {});

  const renderBody = JSON.stringify({ environment: 'production', variables: sampleVars }, null, 2);

  let md = `# API Documentation — ${prompt.name} v${version.version_number}\n\n`;
  md += `Slug: \`${slug}\`\n\n`;
  md += `---\n\n`;

  // Retrieve
  md += `## Retrieve Deployed Prompt\n\n`;
  md += `Returns the deployed version for a given environment.\n\n`;
  md += `\`\`\`\nGET ${baseUrl}/prompts/${slug}/:environment\n\`\`\`\n\n`;
  md += `### Example\n\n`;
  md += `\`\`\`bash\ncurl ${baseUrl}/prompts/${slug}/production\n\`\`\`\n\n`;

  // Render
  md += `## Render Prompt with Variables\n\n`;
  md += `Substitutes \`{{variables}}\` in the template and returns the rendered string.\n\n`;
  md += `\`\`\`\nPOST ${baseUrl}/prompts/${slug}/render\n\`\`\`\n\n`;
  md += `### Request Body\n\n`;
  md += `| Field | Type | Description |\n`;
  md += `|-------|------|-------------|\n`;
  md += `| \`environment\` | string | Target environment (default: \`production\`) |\n`;
  md += `| \`variables\` | object | Key-value pairs for template substitution |\n\n`;
  md += `### Example\n\n`;
  md += `\`\`\`bash\ncurl -X POST ${baseUrl}/prompts/${slug}/render \\\n`;
  md += `  -H "Content-Type: application/json" \\\n`;
  md += `  -d '${renderBody}'\n\`\`\`\n\n`;

  // Variables
  if (vars.length > 0) {
    md += `## Variables\n\n`;
    md += `| Key | Type | Required | Default | Description |\n`;
    md += `|-----|------|----------|---------|-------------|\n`;
    for (const v of vars) {
      md += `| \`${v.key}\` | ${v.type} | ${v.required ? 'Yes' : 'No'} | ${v.default_value ?? '—'} | ${v.description ?? '—'} |\n`;
    }
    md += `\n`;
  }

  // Notes
  md += `---\n\n`;
  md += `> Replace \`production\` with your target environment (\`staging\`, \`dev\`, etc.). `;
  md += `The prompt must be deployed to the environment before it can be retrieved.\n`;

  return md;
}
