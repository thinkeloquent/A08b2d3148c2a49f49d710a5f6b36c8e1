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
    async loadDatasetNode(state) {
      console.log('[handler] loadDatasetNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const topic = extractTopic(state.messages);
      const content = resolveTemplate(templates.loadTitle ?? '## Loading Dataset', {})
        + '\n' + resolveTemplate(templates.loadDescription ?? 'Loading vulnerability data...', { source: 'csv', count: 0 });
      await new Promise((r) => setTimeout(r, 500));
      const result = { messages: [new AIMessage(content)], iterations: 1 };
      console.log('[handler] loadDatasetNode → returning iterations:', result.iterations);
      return result;
    },

    async fetchFileNode(state) {
      console.log('[handler] fetchFileNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const content = resolveTemplate(templates.fetchTitle ?? '## Fetching File', {})
        + '\n' + resolveTemplate(templates.fetchDescription ?? 'Fetching dependency file from GitHub...', { filePath: 'package.json', repo: 'owner/repo', index: state.iterations, total: '?' });
      await new Promise((r) => setTimeout(r, 400));
      const result = { messages: [new AIMessage(content)], iterations: state.iterations + 1 };
      console.log('[handler] fetchFileNode → returning iterations:', result.iterations);
      return result;
    },

    async updateDependencyNode(state) {
      console.log('[handler] updateDependencyNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const content = resolveTemplate(templates.updateTitle ?? '## Updating Dependency', {})
        + '\n' + resolveTemplate(templates.updateDescription ?? 'Updating dependency version...', { package: 'example-pkg', fromVersion: '1.0.0', toVersion: '1.0.1', filePath: 'package.json' });
      await new Promise((r) => setTimeout(r, 300));
      const result = { messages: [new AIMessage(content)], iterations: state.iterations };
      console.log('[handler] updateDependencyNode → returning iterations:', result.iterations);
      return result;
    },

    async reviewChangesNode(state) {
      console.log('[handler] reviewChangesNode — iterations:', state.iterations, 'messages:', state.messages.length);
      console.log('[handler] reviewChangesNode → passthrough (interrupt node)');
      return state;
    },

    async createPrNode(state) {
      console.log('[handler] createPrNode — iterations:', state.iterations, 'messages:', state.messages.length);
      const content = resolveTemplate(templates.prTitle ?? '## Creating PR', {})
        + '\n' + resolveTemplate(templates.prDescription ?? 'Creating pull request...', { repo: 'owner/repo', package: 'example-pkg', fromVersion: '1.0.0', toVersion: '1.0.1' });
      await new Promise((r) => setTimeout(r, 400));
      const result = { messages: [new AIMessage(content)], iterations: state.iterations };
      console.log('[handler] createPrNode → returning iterations:', result.iterations);
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
  const graph = builder.compile({
    checkpointer: memory,
    interruptBefore: config.interruptBefore ?? [],
  });

  return { graph, memory };
}
