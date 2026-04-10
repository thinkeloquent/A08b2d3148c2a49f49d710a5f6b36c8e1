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
import { useRunStore } from './useRunStore.js';
import { useWorkflowStore } from './useWorkflowStore.js';

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
  isPauseAfter: false,
  _isStreaming: false,
  error: null,
  _abortController: null,

  // --- data ---
  topicInput: '',     // draft topic (bound to input field in AppBar)
  topic: '',
  iterations: [],      // { stage, content, timestamp }
  currentStage: null,  // 'generate' | 'reflect' | 'user_feedback' | 'end'
  stageHistory: [],    // ordered list of visited stages
  checkpoints: [],     // saved snapshots
  activeNodeId: null,
  activeStageIndex: null, // index into stageHistory for disambiguation
  inspectedNodeId: null,
  activeWorkflowRunId: null,  // current workflow run ID
  activeCheckpointId: null,   // key of the checkpoint currently being viewed
  diffCheckpointIds: null,    // [keyA, keyB] for visual diff comparison

  // --- actions ---

  setTopicInput: (v) => set({ topicInput: v }),

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
    console.log('interruptAfter:', graphDef?.config?.interruptAfter);
    console.log('nodes:', graphDef?.nodes?.map((n) => `${n.id} (handler: ${n.data?.handler ?? 'none'})`));
    console.log('edges:', graphDef?.edges?.map((e) => `${e.source} → ${e.target}${e.data?.condition ? ` [${e.data.condition}=${e.data.conditionResult}]` : ''}`));

    if (!graphDef) { console.warn('ABORT: no graphDef'); console.groupEnd(); set({ error: 'Graph definition not loaded' }); return; }

    const { graph, memory } = buildGraph(graphDef, { maxIterations });
    const threadConfig = { configurable: { thread_id: Date.now().toString() } };
    const abortController = new AbortController();
    console.log('threadId:', threadConfig.configurable.thread_id);

    // Create a workflow run
    const { activeInstanceId } = useWorkflowStore.getState();
    const wfrunId = await useRunStore.getState().createWorkflowRun(
      activeInstanceId, topic, threadConfig.configurable.thread_id,
    );

    set({
      graph, memory, threadConfig, topic,
      isRunning: true, isPaused: false, error: null,
      iterations: [], stageHistory: [],
      currentStage: graphDef.config.entryPoint, activeNodeId: graphDef.config.entryPoint, activeStageIndex: null,
      _abortController: abortController,
      activeWorkflowRunId: wfrunId,
    });
    console.log('state set → isRunning: true, currentStage:', graphDef.config.entryPoint, 'wfrunId:', wfrunId);
    console.groupEnd();

    await get()._runGraph(true);
  },

  /** Stop execution mid-flow */
  stopGraph() {
    const { _abortController, activeWorkflowRunId } = get();
    if (_abortController) _abortController.abort();
    if (activeWorkflowRunId) {
      useRunStore.getState().updateWorkflowRunStatus(activeWorkflowRunId, 'stopped');
    }
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
      const input = isFirst
        ? { messages: topic?.trim() ? [new HumanMessage(topic)] : [] }
        : null;
      console.log('streaming with input:', input ? 'HumanMessage' : 'null (resume)');
      set({ _isStreaming: true });
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
            const taskTimestamp = Date.now();
            console.log(`[stream] node "${nodeId}" fired — messages: ${msgs?.length ?? 0}, iterations: ${nodeEvent.iterations ?? 'n/a'}, content preview: "${(last?.content ?? '').slice(0, 60)}..."`);
            set((s) => ({
              currentStage: nodeId,
              activeNodeId: nodeId,
              activeStageIndex: s.stageHistory.length, // index of the about-to-be-appended entry
              iterations: [
                ...s.iterations,
                {
                  stage: nodeId,
                  content: last?.content,
                  ...(nodeEvent.iterations != null ? { iteration: nodeEvent.iterations } : {}),
                  timestamp: taskTimestamp,
                },
              ],
              stageHistory: [...s.stageHistory, nodeId],
            }));

            // Record task run
            const wfrunId = get().activeWorkflowRunId;
            if (wfrunId) {
              useRunStore.getState().addTaskRun(wfrunId, {
                nodeId,
                stage: nodeId,
                content: last?.content,
                iteration: nodeEvent.iterations ?? null,
                status: 'completed',
                timestamp: taskTimestamp,
              });
            }
            console.log(`[stream] state updated → currentStage: "${nodeId}", stageHistory:`, get().stageHistory);
          }
        }
      }
      console.log(`[stream] ended after ${eventIndex} events`);
      set({ _isStreaming: false });

      // Check graph state after stream ends
      const state = await graph.getState(threadConfig);
      console.log('[post-stream] graph state.next:', state.next);
      console.log('[post-stream] graph state.values.iterations:', state.values?.iterations);
      console.log('[post-stream] graph state.values.messages count:', state.values?.messages?.length);

      const interruptBefore = graphDef.config.interruptBefore ?? [];
      const interruptAfter = graphDef.config.interruptAfter ?? [];
      const allInterruptNodes = [...interruptBefore, ...interruptAfter];
      console.log('[post-stream] interruptBefore config:', interruptBefore);
      console.log('[post-stream] interruptAfter config:', interruptAfter);

      // For interruptAfter, the graph pauses after the node ran — state.next
      // contains the *next* node, but we detect the pause by checking if any
      // interruptAfter node just executed (it will be the last in stageHistory).
      const lastExecuted = get().stageHistory[get().stageHistory.length - 1];
      const pauseAtBefore = interruptBefore.find((n) => state.next?.includes(n));
      const pauseAtAfter = interruptAfter.includes(lastExecuted) ? lastExecuted : null;
      // interruptAfter takes priority — the node already ran and has data
      // that may need user attention (e.g. schema_mapping, presentation).
      // The interruptBefore for the next node will fire on the next resume.
      const pauseAt = pauseAtAfter ?? pauseAtBefore;
      if (pauseAt) {
        const isAfterPause = pauseAt === pauseAtAfter;
        console.log(`[post-stream] PAUSING at "${pauseAt}" (${isAfterPause ? 'interruptAfter' : 'interruptBefore'})`);
        // Don't append to stageHistory for interruptBefore — the node hasn't
        // executed yet. It will be added by the stream event handler when it
        // actually runs on resume. For interruptAfter the node already ran
        // and is already in stageHistory from the stream handler.
        set({
          isPaused: true,
          isPauseAfter: isAfterPause,
          currentStage: pauseAt,
          activeNodeId: pauseAt,
        });
        // Update workflow run status to paused
        const wfrunId = get().activeWorkflowRunId;
        if (wfrunId) useRunStore.getState().updateWorkflowRunStatus(wfrunId, 'paused');
        console.log('[post-stream] state set → isPaused: true, currentStage:', pauseAt, 'stageHistory:', get().stageHistory);
        await get()._saveCheckpoint();
      } else {
        console.log('[post-stream] NO interrupt — graph complete');
        set({
          isRunning: false, isPaused: false,
          currentStage: 'end', activeNodeId: '__end__',
          stageHistory: [...get().stageHistory, 'end'],
        });
        // Update workflow run status to completed
        const wfrunId = get().activeWorkflowRunId;
        if (wfrunId) useRunStore.getState().updateWorkflowRunStatus(wfrunId, 'completed');
        console.log('[post-stream] state set → isRunning: false, currentStage: end, stageHistory:', get().stageHistory);
        await get()._saveCheckpoint();
      }
    } catch (err) {
      console.error('[graph] _runGraph ERROR:', err.message, err.stack);
      const wfrunId = get().activeWorkflowRunId;
      if (wfrunId) useRunStore.getState().updateWorkflowRunStatus(wfrunId, 'failed');
      set({ error: err.message, isRunning: false, _isStreaming: false });
    }
    console.groupEnd();
  },

  /** Submit user feedback and resume the graph */
  async submitFeedback(feedback) {
    const { graph, threadConfig, currentStage, graphDef, isPauseAfter: wasPauseAfter } = get();
    console.group('[graph] submitFeedback');
    console.log('feedback:', feedback ? `"${feedback.slice(0, 80)}..."` : '(empty/skip)');
    console.log('currentStage before resume:', currentStage);
    console.log('isPaused before resume:', get().isPaused);
    console.log('wasPauseAfter:', wasPauseAfter);

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

    const feedbackTimestamp = Date.now();
    set((s) => ({
      isPaused: false,
      isPauseAfter: false,
      iterations: feedback.trim()
        ? [...s.iterations, { stage: 'feedback', content: feedback, timestamp: feedbackTimestamp }]
        : s.iterations,
      stageHistory: [...s.stageHistory, 'feedback_submitted'],
    }));

    // Record feedback as a task run
    const wfrunId = get().activeWorkflowRunId;
    if (wfrunId && feedback.trim()) {
      useRunStore.getState().addTaskRun(wfrunId, {
        nodeId: 'user_feedback',
        stage: 'feedback',
        content: feedback,
        status: 'completed',
        timestamp: feedbackTimestamp,
      });
    }
    // Resume run status to running
    if (wfrunId) useRunStore.getState().updateWorkflowRunStatus(wfrunId, 'running');

    console.log('state set → isPaused: false, stageHistory:', get().stageHistory);

    // ── Sequential gate: honour interruptBefore for the next node ──
    // LangGraph skips interruptBefore on resume (the resume *is* the approval),
    // but for sequential workflows we need each interruptBefore to pause the UI
    // so the user sees a checkpoint before the node executes.
    // Only gate when coming from an interruptAfter pause (isPauseAfter was true
    // before we cleared it above). If we're already at an interruptBefore
    // checkpoint the user just approved, let _runGraph proceed.
    const interruptBefore = graphDef?.config?.interruptBefore ?? [];
    const nextNodeId = preState.next?.[0];
    if (wasPauseAfter && nextNodeId && interruptBefore.includes(nextNodeId)) {
      console.log(`[pre-resume] next node "${nextNodeId}" has interruptBefore — pausing at gate`);
      set({
        isPaused: true,
        isPauseAfter: false,
        currentStage: nextNodeId,
        activeNodeId: nextNodeId,
      });
      if (wfrunId) useRunStore.getState().updateWorkflowRunStatus(wfrunId, 'paused');
      console.groupEnd();
      return;
    }

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
    set({ activeNodeId: get().stageHistory[index] ?? null, activeStageIndex: index });
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
    const { threadConfig, iterations, stageHistory, topic, currentStage, activeWorkflowRunId } = get();
    const checkpoint = {
      threadId: threadConfig.configurable.thread_id,
      topic,
      currentStage,
      iterations: iterations.map((it) => ({ ...it })),
      stageHistory: [...stageHistory],
      timestamp: Date.now(),
      workflowRunId: activeWorkflowRunId ?? null,
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

  /**
   * Restore graph view state from a workflow run's task runs.
   * Called when switching between runs so the canvas, stage navigator,
   * and timeline reflect the selected run — not the live execution.
   */
  async restoreRunView(run, taskRuns) {
    if (!run || !taskRuns) return;

    // Rebuild iterations and stageHistory from persisted task runs
    const iterations = [];
    const stageHistory = [];

    for (const tr of taskRuns) {
      if (tr.nodeId === 'user_feedback') {
        // Feedback entries appear as 'feedback_submitted' in stageHistory
        stageHistory.push('feedback_submitted');
        if (tr.content) {
          iterations.push({ stage: 'feedback', content: tr.content, timestamp: tr.timestamp });
        }
      } else {
        stageHistory.push(tr.stage ?? tr.nodeId);
        iterations.push({
          stage: tr.stage ?? tr.nodeId,
          content: tr.content,
          ...(tr.iteration != null ? { iteration: tr.iteration } : {}),
          timestamp: tr.timestamp,
        });
      }
    }

    // Determine terminal state from run status
    const isComplete = run.status === 'completed';
    const isStopped = run.status === 'stopped' || run.status === 'failed';
    const isPaused = run.status === 'paused';
    const isRunning = run.status === 'running';

    const lastStage = stageHistory.filter((s) => s !== 'feedback_submitted').at(-1) ?? null;
    // If paused with no task runs yet (paused at entry before first execution),
    // fall back to the graph's entry point so FeedbackPanel can resolve the node.
    const entryPoint = get().graphDef?.config?.entryPoint ?? null;
    const pausedFallback = isPaused && !lastStage ? entryPoint : lastStage;
    const currentStage = isComplete ? 'end' : isStopped ? 'stopped' : pausedFallback;
    const activeNodeId = isComplete ? '__end__' : pausedFallback;

    if (isComplete) stageHistory.push('end');

    set({
      topic: run.topic ?? '',
      iterations,
      stageHistory,
      currentStage,
      activeNodeId,
      activeStageIndex: stageHistory.length > 0 ? stageHistory.length - 1 : null,
      isRunning: isRunning && !isPaused,
      isPaused,
      isPauseAfter: false,
      error: null,
      activeWorkflowRunId: run.id,
    });

    // ── Rebuild graph runtime for paused runs ──
    // The compiled graph and MemorySaver are in-memory only. When restoring a
    // paused run (page load, navigation), we must rebuild the graph and replay
    // execution to recreate the checkpoint at the pause point.
    if (isPaused && !get().graph) {
      const { graphDef, maxIterations } = get();
      if (!graphDef) return;

      console.group('[restoreRunView] rebuilding graph for paused run');
      const { graph, memory } = buildGraph(graphDef, { maxIterations });
      const threadConfig = { configurable: { thread_id: run.threadId ?? Date.now().toString() } };
      console.log('threadId:', threadConfig.configurable.thread_id);

      set({ graph, memory, threadConfig });

      // Replay: stream with the original topic to reach the first interruptBefore
      // checkpoint. For runs paused at entry (no task runs), this recreates the
      // initial checkpoint so submitFeedback can resume.
      try {
        const topic = run.topic ?? '';
        const input = { messages: topic.trim() ? [new HumanMessage(topic)] : [] };
        const events = await graph.stream(input, threadConfig);
        // Consume events silently — we only need the checkpoint side-effect
        for await (const _event of events) { /* drain */ }
        console.log('[restoreRunView] graph replayed to pause point');
      } catch (err) {
        console.warn('[restoreRunView] replay error:', err.message);
      }
      console.groupEnd();
    }
  },

  /** Reset the store */
  reset() {
    set({
      graph: null, memory: null, threadConfig: null,
      isRunning: false, isPaused: false, isPauseAfter: false, _isStreaming: false, error: null,
      _abortController: null,
      topic: '', iterations: [], currentStage: null,
      stageHistory: [], activeNodeId: null, activeStageIndex: null, inspectedNodeId: null,
      activeCheckpointId: null, diffCheckpointIds: null,
      activeWorkflowRunId: null,
    });
  },
}));
