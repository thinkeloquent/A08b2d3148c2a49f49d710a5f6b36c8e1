/**
 * Output Writer
 * Builds rule tree payloads and writes JSON files.
 * Output format is compatible with the rule-tree-table API (POST /trees).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Convert extracted rules into a flat rule tree structure for the API.
 * @param {object[]} rules - Nested rule items from the extractor
 * @returns {{ root: object, stats: { total: number, groups: number, conditions: number, folders: number, enabled: number } }}
 */
function buildRuleTreeStructure(rules) {
  let groups = 0;
  let conditions = 0;
  let folders = 0;
  let enabled = 0;

  function assignSortOrder(items) {
    return items.map((item, index) => {
      const ordered = { ...item, sort_order: index };
      if (item.type === 'folder') {
        folders++;
        if (item.enabled) enabled++;
        if (item.conditions) {
          ordered.conditions = assignSortOrder(item.conditions);
        }
      } else if (item.type === 'structural') {
        groups++; // count structural nodes in groups for stats
        if (item.enabled) enabled++;
        if (item.conditions) {
          ordered.conditions = assignSortOrder(item.conditions);
        }
      } else if (item.type === 'group') {
        groups++;
        if (item.enabled) enabled++;
        if (item.conditions) {
          ordered.conditions = assignSortOrder(item.conditions);
        }
      } else {
        conditions++;
        if (item.enabled) enabled++;
      }
      return ordered;
    });
  }

  const orderedRules = assignSortOrder(rules);

  return {
    root: {
      id: randomUUID(),
      type: 'group',
      name: 'Root',
      logic: 'AND',
      enabled: true,
      color: '#3B82F6',
      description: 'Auto-extracted conditional logic',
      sort_order: 0,
      conditions: orderedRules,
    },
    stats: {
      total: groups + conditions + folders + 1, // +1 for root
      groups: groups + 1,
      conditions,
      folders,
      enabled: enabled + 1,
    },
  };
}

/**
 * Recursively assign source_url to all items in a tree based on file path and source_line.
 */
function assignSourceUrls(items, repoFullName, branch, filePath) {
  const baseUrl = `https://github.com/${repoFullName}/blob/${branch}/${filePath}`;
  function walk(item) {
    if (item.source_line) {
      item.source_url = `${baseUrl}#L${item.source_line}`;
    } else if (item.type === 'folder') {
      // Folders represent files — link to the file itself
      item.source_url = baseUrl;
    } else {
      item.source_url = baseUrl;
    }
    if (item.conditions) {
      item.conditions.forEach(walk);
    }
  }
  items.forEach(walk);
}

export function buildOutputPayload({ owner, repo, branch, ruleTreeName, fileResults, commitSha, gitTag }) {
  const repoFullName = `${owner}/${repo}`;
  const repoUrl = `https://github.com/${repoFullName}`;
  const generatedAt = new Date().toISOString();

  // Aggregate all rules into a single tree, organized by file → function
  const allRules = [];

  for (const { filePath, rules, functionRules } of fileResults) {
    const fileRules = [];

    // Top-level rules (not in a function)
    if (rules.length > 0) {
      fileRules.push(...rules);
    }

    // Function-scoped rules
    for (const { name, rules: fnRules } of functionRules) {
      if (fnRules.length === 1) {
        // Single rule — just label it with the function name
        const rule = { ...fnRules[0] };
        if (rule.type === 'group') {
          rule.name = `${name} → ${rule.name}`;
        }
        rule.description = `${filePath} → ${name}()`;
        fileRules.push(rule);
      } else if (fnRules.length > 1) {
        fileRules.push({
          id: randomUUID(),
          type: 'group',
          name: `${name}()`,
          logic: 'AND',
          enabled: true,
          color: '#8B5CF6',
          description: `${filePath} → ${name}()`,
          conditions: fnRules,
        });
      }
    }

    // Assign source_url to all items within this file
    assignSourceUrls(fileRules, repoFullName, branch, filePath);

    if (fileRules.length > 0) {
      // Wrap file rules in a folder named after the full file path from repo root
      allRules.push({
        id: randomUUID(),
        type: 'folder',
        name: filePath,
        enabled: true,
        description: `Source: https://github.com/${repoFullName}/blob/${branch}/${filePath}`,
        source_url: `https://github.com/${repoFullName}/blob/${branch}/${filePath}`,
        conditions: fileRules,
      });
    }
  }

  const { root, stats } = buildRuleTreeStructure(allRules);

  return {
    metadata: {
      tool: 'github_extract_conditional_logic_rule_tree_table',
      version: '0.1.0',
      generatedAt,
      source: {
        repo: repoFullName,
        branch,
        url: `https://github.com/${repoFullName}/tree/${branch}`,
        commitSha: commitSha || null,
        gitTag: gitTag || null,
      },
      ruleTreeName,
      totalFiles: fileResults.length,
      filesWithRules: fileResults.filter(f => f.rules.length > 0 || f.functionRules.length > 0).length,
      stats,
    },
    ruleTree: {
      name: ruleTreeName,
      description: `Auto-extracted conditional rules from ${repoFullName} (${branch})`,
      is_active: true,
      repo_url: repoUrl,
      branch,
      commit_sha: commitSha || null,
      git_tag: gitTag || null,
      rules: root,
    },
  };
}

/**
 * Write output payload to a JSON file.
 * @param {object} payload
 * @param {string} outputDir
 * @param {string} filename
 * @returns {string} Path to written file
 */
export function writeOutputFile(payload, outputDir, filename) {
  const outPath = resolve(outputDir, filename);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  return outPath;
}
