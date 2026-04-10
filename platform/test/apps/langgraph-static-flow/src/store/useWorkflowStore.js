/**
 * Zustand store for workflow CRUD operations.
 *
 * Workflows are persisted to the active storage adapter under:
 *   - workflow_<id>      — individual workflow definitions
 *   - workflow_index     — list of { id, name, presetId, createdAt, updatedAt }
 *   - workflow_active_id — the currently active workflow ID
 */
import { create } from 'zustand';
import { getStorageAdapter } from '../storage/index.js';
import { PRESET_TEMPLATES, getPresetById } from '../presets/templates.js';

function generateId() {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Migrate old vuln-resolver workflows that used currentIndex/vulnerabilities
 * (fields not in GraphState) to use iterations/config.maxIterations instead.
 * Returns true if migration was applied.
 */
function _migrateVulnResolver(workflow) {
  const cond = workflow.conditions?.hasMoreVulnerabilities;
  if (!cond || cond.field !== 'currentIndex') return false;

  console.log('[migrate] Patching vuln-resolver condition: currentIndex → iterations');
  cond.field = 'iterations';
  cond.value = 'config.maxIterations';

  // Cap maxIterations to something reasonable if it was 100
  if (workflow.config?.maxIterations > 10) {
    console.log(`[migrate] Capping maxIterations from ${workflow.config.maxIterations} to 3`);
    workflow.config.maxIterations = 3;
  }

  return true;
}

export const useWorkflowStore = create((set, get) => ({
  // --- state ---
  workflows: [],         // index entries: { id, name, presetId, createdAt, updatedAt }
  activeWorkflowId: null,
  activeWorkflow: null,  // full workflow definition (the template data)
  loading: false,
  pendingWorkflow: null,  // { presetId, customName } — set during create flow, consumed by review page

  // --- actions ---

  /** Load workflow index and active workflow from storage */
  async loadWorkflows() {
    set({ loading: true });
    const storage = getStorageAdapter();

    // Load index
    const index = (await storage.get('workflow_index')) ?? [];

    // Load active ID
    const activeId = await storage.get('workflow_active_id');
    let activeWorkflow = null;

    if (activeId) {
      activeWorkflow = await storage.get(`workflow_${activeId}`);

      // Migrate old vuln-resolver workflows with broken condition
      if (activeWorkflow && _migrateVulnResolver(activeWorkflow)) {
        await storage.set(`workflow_${activeId}`, activeWorkflow);
      }
    }

    set({ workflows: index, activeWorkflowId: activeId, activeWorkflow, loading: false });
  },

  /** Create a new workflow from a preset template */
  async createFromPreset(presetId, customName) {
    const preset = getPresetById(presetId);
    if (!preset) throw new Error(`Unknown preset: ${presetId}`);
    if (!customName?.trim()) throw new Error('Workflow name is required');

    const storage = getStorageAdapter();
    const id = generateId();
    const now = Date.now();
    const name = customName.trim();

    // Deep-clone the template
    const workflowData = JSON.parse(JSON.stringify(preset.template));
    workflowData._workflowId = id;

    // Save the workflow data
    await storage.set(`workflow_${id}`, workflowData);

    // Update index
    const index = (await storage.get('workflow_index')) ?? [];
    index.push({ id, name, presetId, createdAt: now, updatedAt: now });
    await storage.set('workflow_index', index);

    // Set as active
    await storage.set('workflow_active_id', id);

    set({
      workflows: index,
      activeWorkflowId: id,
      activeWorkflow: workflowData,
    });

    return id;
  },

  /** Duplicate an existing workflow */
  async duplicateWorkflow(sourceId) {
    const storage = getStorageAdapter();
    const source = await storage.get(`workflow_${sourceId}`);
    if (!source) throw new Error(`Workflow not found: ${sourceId}`);

    const id = generateId();
    const now = Date.now();
    const workflowData = JSON.parse(JSON.stringify(source));
    workflowData._workflowId = id;

    const index = (await storage.get('workflow_index')) ?? [];
    const sourceEntry = index.find((w) => w.id === sourceId);
    const name = `${sourceEntry?.name ?? source.name ?? 'Workflow'} (copy)`;

    await storage.set(`workflow_${id}`, workflowData);
    index.push({ id, name, presetId: sourceEntry?.presetId ?? null, createdAt: now, updatedAt: now });
    await storage.set('workflow_index', index);

    set({ workflows: index });
    return id;
  },

  /** Rename a workflow */
  async renameWorkflow(id, newName) {
    const storage = getStorageAdapter();
    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === id);
    if (!entry) return;

    entry.name = newName;
    entry.updatedAt = Date.now();
    await storage.set('workflow_index', index);

    // Also update the name in the workflow data
    const data = await storage.get(`workflow_${id}`);
    if (data) {
      data.name = newName;
      await storage.set(`workflow_${id}`, data);
      if (get().activeWorkflowId === id) {
        set({ activeWorkflow: data });
      }
    }

    set({ workflows: [...index] });
  },

  /** Delete a workflow */
  async deleteWorkflow(id) {
    const storage = getStorageAdapter();
    await storage.delete(`workflow_${id}`);

    const index = (await storage.get('workflow_index')) ?? [];
    const filtered = index.filter((w) => w.id !== id);
    await storage.set('workflow_index', filtered);

    const updates = { workflows: filtered };

    // If we deleted the active workflow, clear it
    if (get().activeWorkflowId === id) {
      await storage.delete('workflow_active_id');
      updates.activeWorkflowId = null;
      updates.activeWorkflow = null;
    }

    set(updates);
  },

  /** Set a workflow as the active one */
  async setActiveWorkflow(id) {
    const storage = getStorageAdapter();
    const workflowData = await storage.get(`workflow_${id}`);
    if (!workflowData) throw new Error(`Workflow not found: ${id}`);

    // Migrate old workflows on activation
    if (_migrateVulnResolver(workflowData)) {
      await storage.set(`workflow_${id}`, workflowData);
    }

    await storage.set('workflow_active_id', id);
    set({ activeWorkflowId: id, activeWorkflow: workflowData });
  },

  /** Stage a pending workflow for the review page */
  setPendingWorkflow(presetId, customName) {
    set({ pendingWorkflow: { presetId, customName } });
  },

  /** Clear pending workflow */
  clearPendingWorkflow() {
    set({ pendingWorkflow: null });
  },

  // --- Node CRUD ---

  /** Add a node to the active workflow */
  async addNode(node) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    // Validate unique ID
    if (activeWorkflow.nodes.some((n) => n.id === node.id)) {
      throw new Error(`Node ID "${node.id}" already exists`);
    }

    activeWorkflow.nodes.push(node);
    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    // Update index timestamp
    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  /** Update a node in the active workflow */
  async updateNode(nodeId, updates) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    const idx = activeWorkflow.nodes.findIndex((n) => n.id === nodeId);
    if (idx === -1) throw new Error(`Node "${nodeId}" not found`);

    // If ID changed, check uniqueness and update edges
    if (updates.id && updates.id !== nodeId) {
      if (activeWorkflow.nodes.some((n) => n.id === updates.id)) {
        throw new Error(`Node ID "${updates.id}" already exists`);
      }
      // Rewrite edges referencing old ID
      for (const edge of activeWorkflow.edges) {
        if (edge.source === nodeId) {
          edge.source = updates.id;
          if (edge.sourceHandle) edge.sourceHandle = edge.sourceHandle.replace(nodeId, updates.id);
        }
        if (edge.target === nodeId) {
          edge.target = updates.id;
          if (edge.targetHandle) edge.targetHandle = edge.targetHandle.replace(nodeId, updates.id);
        }
      }
      // Update config references
      if (activeWorkflow.config?.entryPoint === nodeId) activeWorkflow.config.entryPoint = updates.id;
      if (activeWorkflow.config?.interruptBefore) {
        activeWorkflow.config.interruptBefore = activeWorkflow.config.interruptBefore.map(
          (n) => (n === nodeId ? updates.id : n),
        );
      }
    }

    activeWorkflow.nodes[idx] = { ...activeWorkflow.nodes[idx], ...updates };
    if (updates.data) {
      activeWorkflow.nodes[idx].data = { ...activeWorkflow.nodes[idx].data, ...updates.data };
    }
    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  /** Delete a node from the active workflow (and its connected edges) */
  async deleteNode(nodeId) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    activeWorkflow.nodes = activeWorkflow.nodes.filter((n) => n.id !== nodeId);
    activeWorkflow.edges = activeWorkflow.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId,
    );

    // Clean config references
    if (activeWorkflow.config?.entryPoint === nodeId) activeWorkflow.config.entryPoint = '';
    if (activeWorkflow.config?.interruptBefore) {
      activeWorkflow.config.interruptBefore = activeWorkflow.config.interruptBefore.filter(
        (n) => n !== nodeId,
      );
    }

    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  // --- Condition CRUD ---

  /** Add a condition to the active workflow */
  async addCondition(name, condition) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    if (!activeWorkflow.conditions) activeWorkflow.conditions = {};
    if (activeWorkflow.conditions[name]) {
      throw new Error(`Condition "${name}" already exists`);
    }

    activeWorkflow.conditions[name] = condition;
    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  /** Update a condition in the active workflow */
  async updateCondition(oldName, newName, condition) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    if (!activeWorkflow.conditions?.[oldName]) throw new Error(`Condition "${oldName}" not found`);

    // If renamed, check uniqueness and update edge references
    if (newName !== oldName) {
      if (activeWorkflow.conditions[newName]) {
        throw new Error(`Condition "${newName}" already exists`);
      }
      delete activeWorkflow.conditions[oldName];
      // Update edges referencing the old name
      for (const edge of activeWorkflow.edges) {
        if (edge.data?.condition === oldName) edge.data.condition = newName;
      }
    }

    activeWorkflow.conditions[newName] = condition;
    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  /** Delete a condition from the active workflow (and clear edge references) */
  async deleteCondition(name) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    delete activeWorkflow.conditions[name];
    // Clear edge references
    for (const edge of activeWorkflow.edges) {
      if (edge.data?.condition === name) {
        delete edge.data.condition;
        delete edge.data.conditionResult;
      }
    }

    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    const index = (await storage.get('workflow_index')) ?? [];
    const entry = index.find((w) => w.id === activeWorkflowId);
    if (entry) { entry.updatedAt = Date.now(); await storage.set('workflow_index', index); }

    set({ activeWorkflow: { ...activeWorkflow }, workflows: [...index] });
  },

  /** Reorder nodes in the active workflow */
  async reorderNodes(fromIndex, toIndex) {
    const storage = getStorageAdapter();
    const { activeWorkflowId, activeWorkflow } = get();
    if (!activeWorkflowId || !activeWorkflow) throw new Error('No active workflow');

    const nodes = [...activeWorkflow.nodes];
    const [moved] = nodes.splice(fromIndex, 1);
    nodes.splice(toIndex, 0, moved);
    activeWorkflow.nodes = nodes;
    activeWorkflow._updatedAt = Date.now();
    await storage.set(`workflow_${activeWorkflowId}`, activeWorkflow);

    set({ activeWorkflow: { ...activeWorkflow } });
  },

  /** Get available preset templates */
  getPresets() {
    return PRESET_TEMPLATES;
  },
}));
