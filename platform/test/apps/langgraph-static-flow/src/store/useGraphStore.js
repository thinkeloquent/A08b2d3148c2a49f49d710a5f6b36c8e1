/**
 * Zustand store — single source of truth for graph execution state.
 *
 * The graph definition is loaded from /graph.json at boot.
 */
import { create } from 'zustand';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from '../graph/builder.js';
import { loadGraphDefinition, clearGraphCache } from '../graph/loader.js';
import { getStorageAdapter } from '../storage/index.js';

// ─── helpers ────────────────────────────────────────────────────────────────
function serializeMessages(messages) {
  return messages.map((m) => ({
    type: m._getType?.() ?? m.type ?? 'unknown',
    content: m.content,
  }));
}

// ─── store ──────────────────────────────────────────────────────────────────
export const useGraphStore = create((set, get) => ({
  // --- config ---
  maxIterations: 3,

  // --- graph definition (from JSON) ---
  graphDef: null,

  // --- runtime ---
  graph: null,
  memory: null,
  threadConfig: null,
  isRunning: false,
  isPaused: false,
  error: null,
  _abortController: null,

  // --- data ---
  topic: '',
  iterations: [],      // { stage, content, timestamp }
  currentStage: null,  // 'generate' | 'reflect' | 'user_feedback' | 'end'
  stageHistory: [],    // ordered list of visited stages
  checkpoints: [],     // saved snapshots
  activeNodeId: null,
  inspectedNodeId: null,
  activeCheckpointId: null,   // key of the checkpoint currently being viewed
  diffCheckpointIds: null,    // [keyA, keyB] for visual diff comparison

  // --- actions ---

  setInspectedNodeId: (id) => set({ inspectedNodeId: id }),

  setActiveCheckpoint: (key) => set({ activeCheckpointId: key }),

  /** Toggle a checkpoint for diff comparison (select up to 2) */
  toggleDiffCheckpoint(key) {
    const { diffCheckpointIds } = get();
    if (!diffCheckpointIds) {
      set({ diffCheckpointIds: [key, null] });
    } else if (diffCheckpointIds[0] === key) {
      set({ diffCheckpointIds: null });
    } else if (diffCheckpointIds[1] === key) {
      set({ diffCheckpointIds: [diffCheckpointIds[0], null] });
    } else {
      set({ diffCheckpointIds: [diffCheckpointIds[0], key] });
    }
  },

  clearDiffCheckpoints: () => set({ diffCheckpointIds: null }),

  setMaxIterations: (n) => set({ maxIterations: n }),

  /** Load graph definition (from storage or static fallback) */
  async loadGraphDef({ force = false } = {}) {
    try {
      if (force) clearGraphCache();
      const graphDef = await loadGraphDefinition({ force });
      set({ graphDef, maxIterations: graphDef.config?.maxIterations ?? 3 });
    } catch (err) {
      set({ error: `Failed to load graph: ${err.message}` });
    }
  },

  /** Initialise the LangGraph graph and start execution */
  async startGraph(topic) {
    const { maxIterations, graphDef } = get();
    console.group('[graph] startGraph');
    console.log('topic:', topic);
    console.log('maxIterations:', maxIterations);
    console.log('entryPoint:', graphDef?.config?.entryPoint);
    console.log('interruptBefore:', graphDef?.config?.interruptBefore);
    console.log('nodes:', graphDef?.nodes?.map((n) => `${n.id} (handler: ${n.data?.handler ?? 'none'})`));
    console.log('edges:', graphDef?.edges?.map((e) => `${e.source} → ${e.target}${e.data?.condition ? ` [${e.data.condition}=${e.data.conditionResult}]` : ''}`));

    if (!topic.trim()) { console.warn('ABORT: empty topic'); console.groupEnd(); set({ error: 'Please enter a topic' }); return; }
    if (!graphDef) { console.warn('ABORT: no graphDef'); console.groupEnd(); set({ error: 'Graph definition not loaded' }); return; }

    const { graph, memory } = buildGraph(graphDef, { maxIterations });
    const threadConfig = { configurable: { thread_id: Date.now().toString() } };
    const abortController = new AbortController();
    console.log('threadId:', threadConfig.configurable.thread_id);

    set({
      graph, memory, threadConfig, topic,
      isRunning: true, isPaused: false, error: null,
      iterations: [], stageHistory: [],
      currentStage: graphDef.config.entryPoint, activeNodeId: graphDef.config.entryPoint,
      _abortController: abortController,
    });
    console.log('state set → isRunning: true, currentStage:', graphDef.config.entryPoint);
    console.groupEnd();

    await get()._runGraph(true);
  },

  /** Stop execution mid-flow */
  stopGraph() {
    const { _abortController } = get();
    if (_abortController) _abortController.abort();
    set({
      isRunning: false, isPaused: false,
      _abortController: null,
      currentStage: 'stopped',
    });
  },

  /** Internal: stream events from the graph */
  async _runGraph(isFirst) {
    const { graph, threadConfig, topic, graphDef } = get();
    console.group(`[graph] _runGraph (isFirst: ${isFirst})`);
    try {
      const input = isFirst ? { messages: [new HumanMessage(topic)] } : null;
      console.log('streaming with input:', input ? 'HumanMessage' : 'null (resume)');
      const events = await graph.stream(input, threadConfig);

      // Dynamically handle events based on node IDs from graphDef
      const handlerNodeIds = graphDef.nodes
        .filter((n) => n.data?.handler)
        .map((n) => n.id);
      console.log('handlerNodeIds:', handlerNodeIds);

      let eventIndex = 0;
      for await (const event of events) {
        eventIndex++;
        const eventKeys = Object.keys(event);
        console.log(`[stream] event #${eventIndex} keys:`, eventKeys);

        if (get()._abortController?.signal?.aborted) {
          console.warn('[stream] aborted');
          break;
        }
        for (const nodeId of handlerNodeIds) {
          if (nodeId in event) {
            const nodeEvent = event[nodeId];
            const msgs = nodeEvent.messages;
            const last = msgs?.[msgs.length - 1];
            console.log(`[stream] node "${nodeId}" fired — messages: ${msgs?.length ?? 0}, iterations: ${nodeEvent.iterations ?? 'n/a'}, content preview: "${(last?.content ?? '').slice(0, 60)}..."`);
            set((s) => ({
              currentStage: nodeId,
              activeNodeId: nodeId,
              iterations: [
                ...s.iterations,
                {
                  stage: nodeId,
                  content: last?.content,
                  ...(nodeEvent.iterations != null ? { iteration: nodeEvent.iterations } : {}),
                  timestamp: Date.now(),
                },
              ],
              stageHistory: [...s.stageHistory, nodeId],
            }));
            console.log(`[stream] state updated → currentStage: "${nodeId}", stageHistory:`, get().stageHistory);
          }
        }
      }
      console.log(`[stream] ended after ${eventIndex} events`);

      // Check graph state after stream ends
      const state = await graph.getState(threadConfig);
      console.log('[post-stream] graph state.next:', state.next);
      console.log('[post-stream] graph state.values.iterations:', state.values?.iterations);
      console.log('[post-stream] graph state.values.messages count:', state.values?.messages?.length);

      const interruptNodes = graphDef.config.interruptBefore ?? [];
      console.log('[post-stream] interruptBefore config:', interruptNodes);

      const pauseAt = interruptNodes.find((n) => state.next?.includes(n));
      if (pauseAt) {
        console.log(`[post-stream] PAUSING at "${pauseAt}" — state.next includes interrupt node`);
        set({
          isPaused: true,
          currentStage: pauseAt,
          activeNodeId: pauseAt,
          stageHistory: [...get().stageHistory, pauseAt],
        });
        console.log('[post-stream] state set → isPaused: true, currentStage:', pauseAt, 'stageHistory:', get().stageHistory);
        await get()._saveCheckpoint();
      } else {
        console.log('[post-stream] NO interrupt — graph complete');
        set({
          isRunning: false, isPaused: false,
          currentStage: 'end', activeNodeId: '__end__',
          stageHistory: [...get().stageHistory, 'end'],
        });
        console.log('[post-stream] state set → isRunning: false, currentStage: end, stageHistory:', get().stageHistory);
        await get()._saveCheckpoint();
      }
    } catch (err) {
      console.error('[graph] _runGraph ERROR:', err.message, err.stack);
      set({ error: err.message, isRunning: false });
    }
    console.groupEnd();
  },

  /** Submit user feedback and resume the graph */
  async submitFeedback(feedback) {
    const { graph, threadConfig, currentStage, graphDef } = get();
    console.group('[graph] submitFeedback');
    console.log('feedback:', feedback ? `"${feedback.slice(0, 80)}..."` : '(empty/skip)');
    console.log('currentStage before resume:', currentStage);
    console.log('isPaused before resume:', get().isPaused);

    if (!graph || !threadConfig) {
      console.warn('ABORT: no graph or threadConfig');
      console.groupEnd();
      return;
    }

    if (feedback.trim()) {
      console.log('updating graph state with feedback message...');
      await graph.updateState(threadConfig, {
        messages: [new HumanMessage(`User feedback: ${feedback}`)],
      });
      console.log('graph state updated with feedback');
    }

    // Check state before resuming
    const preState = await graph.getState(threadConfig);
    console.log('[pre-resume] state.next:', preState.next);
    console.log('[pre-resume] state.values.iterations:', preState.values?.iterations);

    set((s) => ({
      isPaused: false,
      iterations: feedback.trim()
        ? [...s.iterations, { stage: 'feedback', content: feedback, timestamp: Date.now() }]
        : s.iterations,
      stageHistory: [...s.stageHistory, 'feedback_submitted'],
    }));
    console.log('state set → isPaused: false, stageHistory:', get().stageHistory);
    console.groupEnd();

    await get()._runGraph(false);
  },

  /** Skip feedback and continue */
  async skipFeedback() {
    console.log('[graph] skipFeedback called');
    await get().submitFeedback('');
  },

  /** Navigate to a previous stage (view only) */
  viewStage(index) {
    set({ activeNodeId: get().stageHistory[index] ?? null });
  },

  /** Save the graphDef once per session (keyed by thread ID) */
  async _saveSessionGraphDef() {
    const storage = getStorageAdapter();
    const { threadConfig, graphDef } = get();
    if (!threadConfig || !graphDef) return;
    const sessionKey = `session_graphdef_${threadConfig.configurable.thread_id}`;
    // Only write if not already stored for this thread
    const existing = await storage.get(sessionKey);
    if (!existing) {
      await storage.set(sessionKey, JSON.parse(JSON.stringify(graphDef)));
    }
  },

  /** Save a checkpoint to storage */
  async _saveCheckpoint() {
    const storage = getStorageAdapter();
    const { threadConfig, iterations, stageHistory, topic, currentStage } = get();
    const checkpoint = {
      threadId: threadConfig.configurable.thread_id,
      topic,
      currentStage,
      iterations: iterations.map((it) => ({ ...it })),
      stageHistory: [...stageHistory],
      timestamp: Date.now(),
    };
    const key = `checkpoint_${checkpoint.threadId}_${checkpoint.timestamp}`;
    await storage.set(key, checkpoint);

    // Persist the graphDef once per session
    await get()._saveSessionGraphDef();

    set((s) => ({ checkpoints: [...s.checkpoints, checkpoint] }));
  },

  /** Load all saved checkpoints and session graphDefs from storage */
  async loadCheckpoints() {
    const storage = getStorageAdapter();

    // Load checkpoints
    const cpKeys = await storage.list('checkpoint_');
    const checkpoints = [];
    for (const k of cpKeys) {
      const cp = await storage.get(k);
      if (cp) checkpoints.push(cp);
    }
    checkpoints.sort((a, b) => a.timestamp - b.timestamp);

    // Load session graphDefs and attach to checkpoints
    const graphDefKeys = await storage.list('session_graphdef_');
    const graphDefMap = {};
    for (const k of graphDefKeys) {
      const gd = await storage.get(k);
      if (gd) {
        // key format: session_graphdef_<threadId>
        const threadId = k.replace('session_graphdef_', '');
        graphDefMap[threadId] = gd;
      }
    }
    for (const cp of checkpoints) {
      if (graphDefMap[cp.threadId]) {
        cp.graphDef = graphDefMap[cp.threadId];
      }
    }

    set({ checkpoints });
  },

  /** Reset the store */
  reset() {
    set({
      graph: null, memory: null, threadConfig: null,
      isRunning: false, isPaused: false, error: null,
      _abortController: null,
      topic: '', iterations: [], currentStage: null,
      stageHistory: [], activeNodeId: null, inspectedNodeId: null,
      activeCheckpointId: null, diffCheckpointIds: null,
    });
  },
}));
