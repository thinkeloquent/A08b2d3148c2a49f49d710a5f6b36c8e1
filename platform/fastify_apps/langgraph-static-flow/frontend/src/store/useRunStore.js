/**
 * Zustand store for Workflow Runs and Task Runs.
 *
 * A Workflow Run is created each time the user clicks "Run" on an instance.
 * Task Runs track individual node executions within a workflow run.
 */
import { create } from 'zustand';
import { getStorageAdapter } from '../storage/index.js';

function generateId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export const useRunStore = create((set, get) => ({
  // --- state ---
  workflowRuns: [],
  activeWorkflowRunId: null,
  taskRuns: [],

  // --- derived ---
  get activeWorkflowRun() {
    const { workflowRuns, activeWorkflowRunId } = get();
    return workflowRuns.find((r) => r.id === activeWorkflowRunId) ?? null;
  },

  // --- actions ---

  /** Load all workflow runs for an instance from storage */
  async loadRunsForInstance(instanceId) {
    const storage = getStorageAdapter();
    const indexKey = `wfrun_index_${instanceId}`;
    const runIds = (await storage.get(indexKey)) ?? [];
    const runs = [];
    for (const id of runIds) {
      const run = await storage.get(`wfrun_${id}`);
      if (run) runs.push(run);
    }
    runs.sort((a, b) => b.createdAt - a.createdAt);
    // Preserve activeWorkflowRunId if it exists in the loaded runs (avoids
    // resetting a live run reference when reloading the run list).
    const currentActiveId = get().activeWorkflowRunId;
    const preserveActive = currentActiveId && runs.some((r) => r.id === currentActiveId);
    set({
      workflowRuns: runs,
      activeWorkflowRunId: preserveActive ? currentActiveId : null,
      taskRuns: preserveActive ? get().taskRuns : [],
    });
  },

  /** Create a new workflow run and persist it */
  async createWorkflowRun(instanceId, topic, threadId) {
    const storage = getStorageAdapter();
    const id = generateId('wfrun');
    const run = {
      id,
      instanceId,
      threadId,
      topic,
      status: 'running',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
    };

    // Persist the run
    await storage.set(`wfrun_${id}`, run);

    // Update the index
    const indexKey = `wfrun_index_${instanceId}`;
    const existing = (await storage.get(indexKey)) ?? [];
    await storage.set(indexKey, [...existing, id]);

    // Init empty task runs array
    await storage.set(`taskrun_${id}`, []);

    set((s) => ({
      workflowRuns: [run, ...s.workflowRuns],
      activeWorkflowRunId: id,
      taskRuns: [],
    }));

    return id;
  },

  /** Update the status of a workflow run */
  async updateWorkflowRunStatus(id, status) {
    const storage = getStorageAdapter();
    const run = await storage.get(`wfrun_${id}`);
    if (!run) return;

    run.status = status;
    run.updatedAt = Date.now();
    if (status === 'completed' || status === 'failed' || status === 'stopped') {
      run.completedAt = Date.now();
    }

    await storage.set(`wfrun_${id}`, run);

    set((s) => ({
      workflowRuns: s.workflowRuns.map((r) => (r.id === id ? { ...run } : r)),
    }));
  },

  /** Add a task run to a workflow run */
  async addTaskRun(wfrunId, data) {
    const storage = getStorageAdapter();
    const taskRun = {
      id: generateId('taskrun'),
      workflowRunId: wfrunId,
      nodeId: data.nodeId,
      stage: data.stage,
      content: data.content,
      iteration: data.iteration ?? null,
      status: data.status ?? 'completed',
      timestamp: data.timestamp ?? Date.now(),
      durationMs: data.durationMs ?? null,
    };

    // Persist
    const key = `taskrun_${wfrunId}`;
    const existing = (await storage.get(key)) ?? [];
    existing.push(taskRun);
    await storage.set(key, existing);

    set((s) => ({
      taskRuns: [...s.taskRuns, taskRun],
    }));

    return taskRun;
  },

  /** Set the active workflow run, load its task runs, and restore graph view */
  async setActiveWorkflowRun(id) {
    const storage = getStorageAdapter();
    const taskRuns = (await storage.get(`taskrun_${id}`)) ?? [];
    set({ activeWorkflowRunId: id, taskRuns });

    // Restore the graph canvas/timeline/navigator to this run's state
    const run = get().workflowRuns.find((r) => r.id === id);
    if (run) {
      const { useGraphStore } = await import('./useGraphStore.js');
      await useGraphStore.getState().restoreRunView(run, taskRuns);
    }
  },

  /** Load task runs for a specific workflow run */
  async loadTaskRuns(wfrunId) {
    const storage = getStorageAdapter();
    const taskRuns = (await storage.get(`taskrun_${wfrunId}`)) ?? [];
    set({ taskRuns });
  },

  /** Reset run state */
  resetRuns() {
    set({ workflowRuns: [], activeWorkflowRunId: null, taskRuns: [] });
  },
}));
