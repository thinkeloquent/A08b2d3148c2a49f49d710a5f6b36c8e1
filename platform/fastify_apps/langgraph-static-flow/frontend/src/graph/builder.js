/**
 * LangGraph StateGraph builder — driven entirely by graph.json.
 *
 * The JSON follows the universal React Flow schema where execution
 * metadata lives inside each node's `data` object and edge routing
 * logic lives inside each edge's `data` object.
 */
import {
  StateGraph,
  MemorySaver,
  Annotation,
} from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { evaluateCondition } from './loader.js';
import { resolveTemplate } from './g11n.js';

// ─── State schema ────────────────────────────────────────────────────────────
export const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (cur, upd) => (cur ? [...cur, ...upd] : upd),
    default: () => [],
  }),
  iterations: Annotation({
    reducer: (_, v) => v,
    default: () => 0,
  }),
});

// ─── Client-side content generators ─────────────────────────────────────────

function extractTopic(messages) {
  const first = messages[0];
  return first?.content ?? 'the given topic';
}

function extractFeedback(messages) {
  const feedbackMsgs = messages.filter(
    (m) => m._getType?.() === 'human' && m.content?.startsWith?.('User feedback:')
  );
  return feedbackMsgs.map((m) => m.content.replace('User feedback: ', ''));
}

function generateReportContent(topic, iteration, feedback, templates) {
  const ctx = { topic, iteration };
  const tpl = (key) => resolveTemplate(templates[key] ?? '', ctx);

  const sections = [
    tpl('reportTitle'),
    '',
    tpl('executiveSummary'),
    '',
    tpl('backgroundContext'),
    '',
    tpl('keyFindings'),
  ];

  if (feedback.length > 0) {
    sections.push(
      '',
      tpl('revisionsHeader'),
      ...feedback.map((f, i) => resolveTemplate(templates.feedbackItem ?? '', { index: i + 1, feedback: f })),
      '',
      resolveTemplate(templates.revisionsFooter ?? '', { count: feedback.length }),
    );
  }

  sections.push(
    '',
    tpl('methodology'),
    '',
    tpl('conclusions'),
    '',
    tpl('draftFooter'),
  );

  return sections.join('\n');
}

function generateReflectionContent(topic, iteration, reportContent, templates) {
  const ctx = { topic, iteration };
  const tpl = (key) => resolveTemplate(templates[key] ?? '', ctx);

  return [
    tpl('reflectionTitle'),
    '',
    tpl('contentAccuracy'),
    '',
    tpl(iteration === 1 ? 'structureEarly' : 'structureLater'),
    '',
    tpl(iteration < 2 ? 'depthEarly' : 'depthLater'),
    '',
    tpl('suggestionsHeader'),
    tpl('suggestion1'),
    tpl('suggestion2'),
    tpl('suggestion3'),
    tpl(iteration < 2 ? 'suggestion4Early' : 'suggestion4Later'),
    '',
    tpl('reflectionFooter'),
  ].join('\n');
}

// ─── Vulnerability data helpers ──────────────────────────────────────────────
// Extract mappedData from validation_results message in state.

function _findMappedData(state) {
  for (const msg of [...state.messages].reverse()) {
    if (msg._getType?.() === 'ai') {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.type === 'validation_results' && Array.isArray(parsed.mappedData)) {
          return parsed.mappedData;
        }
      } catch { /* skip non-JSON */ }
    }
  }
  return [];
}

function _getAllVulnItems(state) {
  return _findMappedData(state);
}

function _getVulnItem(state, index) {
  const items = _findMappedData(state);
  const idx = index ?? state.iterations;
  return items[idx] ?? null;
}

function _getVulnTotal(state) {
  return _findMappedData(state).length;
}

// ─── Handler factory ─────────────────────────────────────────────────────────
// Returns handlers bound to the graph definition's templates.
function createNodeHandlers(graphDef) {
  const templates = graphDef.g11n?.templates ?? {};

  return {
    async generationNode(state) {
      console.log('[handler] generationNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const topic = extractTopic(state.messages);
      const feedback = extractFeedback(state.messages);
      const iteration = state.iterations + 1;
      const content = generateReportContent(topic, iteration, feedback, templates);
      await new Promise((r) => setTimeout(r, 600));
      console.log('[handler] generationNode → returning iteration:', iteration);
      return { messages: [new AIMessage(content)], iterations: iteration };
    },

    async reflectionNode(state) {
      console.log('[handler] reflectionNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const topic = extractTopic(state.messages);
      const lastAI = [...state.messages].reverse().find((m) => m._getType?.() === 'ai');
      const reportContent = lastAI?.content ?? '';
      const content = generateReflectionContent(topic, state.iterations, reportContent, templates);
      await new Promise((r) => setTimeout(r, 400));
      console.log('[handler] reflectionNode → done');
      return { messages: [new HumanMessage(content)] };
    },

    async userFeedbackNode(state) {
      console.log('[handler] userFeedbackNode — passthrough (interrupt node)');
      return state;
    },

    // ── Vulnerability Resolver handlers ──────────────────────────

    /**
     * inputDataSourceNode — runs AFTER user provides CSV/API input via interruptBefore.
     * Parses the user-provided CSV from the latest HumanMessage("User feedback: ...").
     * Outputs parsed { headers, rows } as JSON AIMessage.
     */
    async inputDataSourceNode(state) {
      console.log('[handler] inputDataSourceNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Find the user's data source input (submitted via feedback before this node ran)
      const feedbackMsgs = state.messages.filter(
        (m) => m._getType?.() === 'human' && m.content?.startsWith?.('User feedback:'),
      );
      const rawInput = feedbackMsgs.length > 0
        ? feedbackMsgs[feedbackMsgs.length - 1].content.replace('User feedback: ', '')
        : '';

      let headers = [];
      let rows = [];

      if (rawInput.trim()) {
        // Parse CSV lines
        const lines = rawInput.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          headers = lines[0].split(',').map((h) => h.trim());
          rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
        }
      }

      // If no user input or empty, use sample data
      if (rows.length === 0) {
        headers = ['package', 'severity', 'current_version', 'fixed_version', 'repository', 'file', 'cve'];
        rows = [
          ['lodash', 'high', '4.17.15', '4.17.21', 'acme/web-app', 'package.json', 'CVE-2021-23337'],
          ['express', 'medium', '4.17.1', '4.18.2', 'acme/api-server', 'package.json', 'CVE-2022-24999'],
          ['axios', 'high', '0.21.1', '0.21.4', 'acme/web-app', 'package.json', 'CVE-2021-3749'],
          ['minimist', 'critical', '1.2.5', '1.2.8', 'acme/cli-tools', 'package.json', 'CVE-2021-44906'],
          ['node-fetch', 'medium', '2.6.1', '2.6.7', 'acme/api-server', 'package.json', 'CVE-2022-0235'],
        ];
      }

      const content = JSON.stringify({ type: 'parsed_csv', headers, rows }, null, 2);
      await new Promise((r) => setTimeout(r, 300));
      console.log('[handler] inputDataSourceNode → parsed', rows.length, 'rows,', headers.length, 'columns');
      return { messages: [new AIMessage(content)], iterations: 0 };
    },

    /**
     * loadDatasetNode — reads parsed CSV from inputDataSourceNode, outputs it for
     * the schema_mapping interrupt modal (user maps columns to schema fields).
     * Also suggests auto-mapping based on header name similarity.
     */
    async loadDatasetNode(state) {
      console.log('[handler] loadDatasetNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Read parsed CSV from the latest AIMessage
      const lastAI = [...state.messages].reverse().find((m) => m._getType?.() === 'ai');
      let headers = [];
      let rows = [];
      try {
        const parsed = JSON.parse(lastAI?.content ?? '{}');
        headers = parsed.headers ?? [];
        rows = parsed.rows ?? [];
      } catch {
        console.warn('[handler] loadDatasetNode — failed to parse, using empty');
      }

      // Schema fields the user needs to map to
      const schemaFields = ['package', 'severity', 'currentVersion', 'fixedVersion', 'repo', 'file', 'cve'];

      // Auto-suggest mapping by fuzzy-matching header names to schema fields
      const aliases = {
        package: ['package', 'pkg', 'name', 'dependency', 'lib', 'library'],
        severity: ['severity', 'sev', 'level', 'priority', 'risk'],
        currentVersion: ['current_version', 'currentversion', 'current', 'from', 'from_version', 'installed'],
        fixedVersion: ['fixed_version', 'fixedversion', 'fixed', 'to', 'to_version', 'patched', 'target'],
        repo: ['repository', 'repo', 'project', 'source_repo', 'github'],
        file: ['file', 'filepath', 'file_path', 'manifest', 'lockfile', 'filename'],
        cve: ['cve', 'cve_id', 'vuln_id', 'vulnerability_id', 'advisory'],
      };
      const suggestedMapping = {};
      for (const [field, names] of Object.entries(aliases)) {
        const idx = headers.findIndex((h) => names.includes(h.toLowerCase().replace(/[^a-z0-9_]/g, '')));
        if (idx >= 0) suggestedMapping[field] = idx;
      }

      const content = JSON.stringify({
        type: 'dataset_preview',
        headers,
        rows,
        schemaFields,
        suggestedMapping,
      }, null, 2);

      await new Promise((r) => setTimeout(r, 400));
      console.log('[handler] loadDatasetNode →', rows.length, 'rows, suggestedMapping:', suggestedMapping);
      return { messages: [new AIMessage(content)], iterations: 1 };
    },

    /**
     * validateSchemaNode — reads the user's field mapping (from feedback) and
     * validates each row against the required schema.
     * Outputs validation results as a structured AIMessage.
     */
    async validateSchemaNode(state) {
      console.log('[handler] validateSchemaNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Find the dataset preview message (from loadDatasetNode)
      let headers = [];
      let rows = [];
      let schemaFields = [];
      for (const msg of [...state.messages].reverse()) {
        if (msg._getType?.() === 'ai') {
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.type === 'dataset_preview') {
              headers = parsed.headers;
              rows = parsed.rows;
              schemaFields = parsed.schemaFields;
              break;
            }
          } catch { /* skip non-JSON */ }
        }
      }

      // Find the user's mapping (from the feedback message after load_dataset)
      let mapping = {};
      const feedbackMsgs = state.messages.filter(
        (m) => m._getType?.() === 'human' && m.content?.startsWith?.('User feedback:'),
      );
      if (feedbackMsgs.length > 0) {
        const lastFeedback = feedbackMsgs[feedbackMsgs.length - 1].content.replace('User feedback: ', '');
        try {
          const parsed = JSON.parse(lastFeedback);
          mapping = parsed.mapping ?? {};
        } catch { /* not JSON — ignore */ }
      }

      // If no mapping provided, use identity (column index = order)
      if (Object.keys(mapping).length === 0) {
        schemaFields.forEach((f, i) => { if (i < headers.length) mapping[f] = i; });
      }

      // Validate each row
      const requiredFields = ['package', 'currentVersion', 'fixedVersion', 'repo', 'file'];
      const semverRe = /^\d+\.\d+\.\d+/;
      const errors = [];
      const mappedData = [];

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const mapped = {};
        for (const [field, colIdx] of Object.entries(mapping)) {
          mapped[field] = row[colIdx] ?? '';
        }
        mappedData.push(mapped);

        // Required field checks
        for (const req of requiredFields) {
          if (!mapped[req]?.trim()) {
            errors.push({ row: r + 1, field: req, message: `Missing required field "${req}"` });
          }
        }
        // Semver checks
        if (mapped.currentVersion && !semverRe.test(mapped.currentVersion)) {
          errors.push({ row: r + 1, field: 'currentVersion', message: `Invalid version: "${mapped.currentVersion}"` });
        }
        if (mapped.fixedVersion && !semverRe.test(mapped.fixedVersion)) {
          errors.push({ row: r + 1, field: 'fixedVersion', message: `Invalid version: "${mapped.fixedVersion}"` });
        }
        // Repo format check (should contain /)
        if (mapped.repo && !mapped.repo.includes('/')) {
          errors.push({ row: r + 1, field: 'repo', message: `Expected "owner/repo" format: "${mapped.repo}"` });
        }
      }

      const valid = errors.length === 0;
      const content = JSON.stringify({
        type: 'validation_results',
        valid,
        totalRows: rows.length,
        validRows: rows.length - new Set(errors.map((e) => e.row)).size,
        errors,
        mappedData,
      }, null, 2);

      await new Promise((r) => setTimeout(r, 300));
      console.log('[handler] validateSchemaNode →', valid ? 'VALID' : `${errors.length} errors`, 'across', rows.length, 'rows');
      return { messages: [new AIMessage(content)], iterations: state.iterations };
    },

    async fetchFileNode(state) {
      console.log('[handler] fetchFileNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Batch: fetch ALL dependency files for every vulnerability in one pass
      const allItems = _getAllVulnItems(state);
      const total = allItems.length;
      const lines = ['## Fetching Dependency Files', ''];

      for (let i = 0; i < total; i++) {
        const item = allItems[i];
        const ctx = {
          filePath: item?.file ?? 'package.json',
          repo: item?.repo ?? 'owner/repo',
          index: i + 1,
          total,
        };
        lines.push(resolveTemplate(
          templates.fetchDescription ?? '{index}/{total} — Pulling `{filePath}` from `{repo}` via GitHub API.',
          ctx,
        ));
      }

      lines.push('', `Fetched ${total} dependency file(s).`);
      const content = lines.join('\n');
      await new Promise((r) => setTimeout(r, 400));
      console.log('[handler] fetchFileNode → batch-fetched', total, 'files');
      return { messages: [new AIMessage(content)], iterations: total };
    },

    async updateDependencyNode(state) {
      console.log('[handler] updateDependencyNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Batch: update ALL dependency versions in one pass
      const allItems = _getAllVulnItems(state);
      const total = allItems.length;
      const lines = ['## Updating Dependencies', ''];

      for (let i = 0; i < total; i++) {
        const item = allItems[i];
        const ctx = {
          package: item?.package ?? 'example-pkg',
          fromVersion: item?.currentVersion ?? '1.0.0',
          toVersion: item?.fixedVersion ?? '1.0.1',
          filePath: item?.file ?? 'package.json',
        };
        lines.push(resolveTemplate(
          templates.updateDescription ?? 'Upgrading `{package}` from `{fromVersion}` to `{toVersion}` in `{filePath}`.',
          ctx,
        ));
      }

      lines.push('', `Updated ${total} dependency version(s).`);

      // Build structured JSON for the presentation panel
      const updateSummary = JSON.stringify({
        type: 'update_summary',
        total,
        updates: allItems.map((item) => ({
          package: item?.package,
          from: item?.currentVersion,
          to: item?.fixedVersion,
          file: item?.file,
          repo: item?.repo,
        })),
        markdown: lines.join('\n'),
      }, null, 2);

      await new Promise((r) => setTimeout(r, 300));
      console.log('[handler] updateDependencyNode → batch-updated', total, 'deps');
      return { messages: [new AIMessage(updateSummary)], iterations: state.iterations };
    },

    async reviewChangesNode(state) {
      console.log('[handler] reviewChangesNode — iterations:', state.iterations, 'messages:', state.messages.length);

      // Aggregate all updates processed so far into a summary for review
      const allItems = _getAllVulnItems(state);
      const processed = Math.min(state.iterations, allItems.length);
      const lines = [
        '## Review All Changes',
        '',
        `**${processed} dependency update(s)** ready for review:`,
        '',
      ];
      for (let i = 0; i < processed; i++) {
        const item = allItems[i];
        lines.push(`${i + 1}. **${item.package}** ${item.currentVersion} → ${item.fixedVersion} in \`${item.file}\` (${item.repo})`);
      }
      lines.push('', 'Approve to create a single pull request for all changes.');

      const content = lines.join('\n');
      await new Promise((r) => setTimeout(r, 200));
      console.log('[handler] reviewChangesNode → summarized', processed, 'changes for review');
      return { messages: [new AIMessage(content)], iterations: state.iterations };
    },

    async createPrNode(state) {
      console.log('[handler] createPrNode — iterations:', state.iterations, 'messages:', state.messages.length);

      const allItems = _getAllVulnItems(state);
      const processed = Math.min(state.iterations, allItems.length);
      const repos = [...new Set(allItems.slice(0, processed).map((v) => v.repo))];
      const pkgList = allItems.slice(0, processed).map((v) => v.package).join(', ');

      const ctx = {
        repo: repos.join(', '),
        package: pkgList,
        processed,
        total: allItems.length,
        prCount: 1,
      };

      const content = resolveTemplate(templates.prTitle ?? '## Creating Pull Request', ctx)
        + '\n' + resolveTemplate(templates.prDescription ?? 'Opening PR for all dependency updates...', ctx)
        + `\n\nOpening **1 PR** covering ${processed} dependency update(s) across ${repos.length} repo(s).`;
      await new Promise((r) => setTimeout(r, 400));
      const result = { messages: [new AIMessage(content)], iterations: state.iterations };
      console.log('[handler] createPrNode → single PR for', processed, 'updates');
      return result;
    },
  };
}

// ─── Build graph from JSON definition ────────────────────────────────────────
export function buildGraph(graphDef, { maxIterations } = {}) {
  const config = { ...graphDef.config };
  if (maxIterations != null) config.maxIterations = maxIterations;

  // Override config in the def for condition evaluation
  const resolvedDef = { ...graphDef, config };

  const builder = new StateGraph(GraphState);
  const nodeHandlers = createNodeHandlers(resolvedDef);

  // Add nodes — handler reference lives in data.handler
  for (const node of graphDef.nodes) {
    if (node.id === '__start__' || node.id === '__end__') continue;
    const handlerName = node.data?.handler;
    if (!handlerName) continue;
    const handler = nodeHandlers[handlerName];
    if (!handler) throw new Error(`No handler registered for node "${node.id}" (handler: ${handlerName})`);
    builder.addNode(node.id, handler);
  }

  // Set entry point
  builder.setEntryPoint(config.entryPoint);

  // Group edges by source; condition/routing metadata lives in edge.data
  const edgesBySource = {};
  for (const edge of graphDef.edges) {
    if (edge.source === '__start__') continue; // handled by entryPoint
    if (!edgesBySource[edge.source]) edgesBySource[edge.source] = [];
    edgesBySource[edge.source].push(edge);
  }

  console.group('[buildGraph] wiring edges');
  for (const [source, edges] of Object.entries(edgesBySource)) {
    const conditionalEdges = edges.filter((e) => e.data?.condition);
    const directEdges = edges.filter((e) => !e.data?.condition);

    if (conditionalEdges.length > 0) {
      const conditionName = conditionalEdges[0].data.condition;
      const routingMap = {};
      for (const ce of conditionalEdges) {
        routingMap[ce.data.conditionResult] = ce.target === '__end__' ? '__end__' : ce.target;
      }
      console.log(`conditional: ${source} → condition "${conditionName}" → routingMap:`, routingMap);

      builder.addConditionalEdges(
        source,
        (state) => evaluateCondition(resolvedDef, conditionName, state),
        routingMap,
      );
    } else {
      for (const edge of directEdges) {
        console.log(`direct: ${source} → ${edge.target}`);
        builder.addEdge(source, edge.target);
      }
    }
  }
  console.groupEnd();

  const memory = new MemorySaver();
  const compileOpts = {
    checkpointer: memory,
    interruptBefore: config.interruptBefore ?? [],
  };
  if (config.interruptAfter?.length) {
    compileOpts.interruptAfter = config.interruptAfter;
  }
  const graph = builder.compile(compileOpts);

  return { graph, memory };
}
