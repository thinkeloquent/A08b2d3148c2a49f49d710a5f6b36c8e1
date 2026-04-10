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
  let changed = false;

  const cond = workflow.conditions?.hasMoreVulnerabilities;
  if (cond && cond.field === 'currentIndex') {
    console.log('[migrate] Patching vuln-resolver condition: currentIndex → iterations');
    cond.field = 'iterations';
    cond.value = 'config.maxIterations';
    changed = true;
  }

  // Cap maxIterations to something reasonable if it was 100
  if (workflow.config?.maxIterations > 10) {
    console.log(`[migrate] Capping maxIterations from ${workflow.config.maxIterations} to 3`);
    workflow.config.maxIterations = 3;
    changed = true;
  }

  // Ensure interruptAfter includes load_dataset and validate_schema
  const hasLoadDataset = workflow.nodes?.some((n) => n.id === 'load_dataset');
  if (hasLoadDataset) {
    workflow.config.interruptAfter = workflow.config.interruptAfter ?? [];
    for (const nodeId of ['load_dataset', 'validate_schema']) {
      if (!workflow.config.interruptAfter.includes(nodeId)) {
        workflow.config.interruptAfter.push(nodeId);
        changed = true;
      }
    }

    // Ensure input_data_source is in interruptBefore
    workflow.config.interruptBefore = workflow.config.interruptBefore ?? [];
    if (!workflow.config.interruptBefore.includes('input_data_source')) {
      workflow.config.interruptBefore.push('input_data_source');
      changed = true;
    }

    // Update load_dataset to schema_mapping interruptType
    const loadNode = workflow.nodes.find((n) => n.id === 'load_dataset');
    if (loadNode?.data && loadNode.data.interruptType !== 'schema_mapping') {
      console.log('[migrate] Updating load_dataset interruptType to schema_mapping');
      loadNode.data.interruptType = 'schema_mapping';
      loadNode.data.g11n = { feedback: { title: 'Map Dataset to Schema', description: 'Assign each CSV column to the correct schema field', submitButton: 'Apply Mapping' } };
      changed = true;
    }
  }

  // Add input_data_source node if missing
  if (hasLoadDataset && !workflow.nodes?.some((n) => n.id === 'input_data_source')) {
    console.log('[migrate] Adding input_data_source node');
    const inputNode = {
      id: 'input_data_source', type: 'customNode', position: { x: 0, y: 0 },
      data: {
        nodeType: 'input_data_source', category: 'Input', label: 'Input Data Source', icon: '\ud83d\udccb',
        handler: 'inputDataSourceNode', interruptType: 'data_source_input',
        inputs: {},
        handles: { targets: ['input'], sources: ['output'] },
        style: { bgColor: '#fdf4ff', textColor: '#a21caf', borderColor: '#f0abfc', accentColor: '#d946ef', handleColor: '#d946ef', stageBadge: 'bg-fuchsia-100 text-fuchsia-700' },
        g11n: { feedback: { title: 'Provide Data Source', description: 'Paste CSV data or enter an API endpoint URL', submitButton: 'Load Data' } },
      },
    };
    const startIdx = workflow.nodes.findIndex((n) => n.id === '__start__');
    workflow.nodes.splice(startIdx + 1, 0, inputNode);
    workflow.config.entryPoint = 'input_data_source';

    // Rewire edges
    const startToLoad = workflow.edges.find((e) => e.source === '__start__' && (e.target === 'load_dataset' || e.target === 'input_data_source'));
    if (startToLoad) {
      startToLoad.target = 'input_data_source';
      startToLoad.targetHandle = 'input_data_source-input';
      startToLoad.id = 'e-start-input';
    }
    if (!workflow.edges.some((e) => e.source === 'input_data_source')) {
      workflow.edges.splice(1, 0, {
        id: 'e-input-load', source: 'input_data_source', sourceHandle: 'input_data_source-output',
        target: 'load_dataset', targetHandle: 'load_dataset-input',
        type: 'smoothstep', data: { color: '#d946ef', animated: true },
      });
    }
    changed = true;
  }

  // Add validate_schema node if missing
  if (hasLoadDataset && !workflow.nodes?.some((n) => n.id === 'validate_schema')) {
    console.log('[migrate] Adding validate_schema node');
    const validateNode = {
      id: 'validate_schema', type: 'customNode', position: { x: 0, y: 0 },
      data: {
        nodeType: 'validate_schema', category: 'Processing', label: 'Validate Schema', icon: '\ud83d\udee1',
        handler: 'validateSchemaNode', interruptType: 'presentation',
        inputs: {},
        handles: { targets: ['input'], sources: ['output'] },
        style: { bgColor: '#ecfdf5', textColor: '#065f46', borderColor: '#a7f3d0', accentColor: '#10b981', handleColor: '#10b981', stageBadge: 'bg-emerald-100 text-emerald-700' },
        g11n: { feedback: { title: 'Schema Validation Results', description: 'Review validation before proceeding', continueButton: 'Continue' } },
      },
    };
    const loadIdx = workflow.nodes.findIndex((n) => n.id === 'load_dataset');
    workflow.nodes.splice(loadIdx + 1, 0, validateNode);

    // Rewire: load_dataset → validate_schema (direct), validate_schema → condition edges
    // Find and update the conditional edges from load_dataset
    for (const edge of workflow.edges) {
      if (edge.source === 'load_dataset' && edge.data?.condition) {
        edge.source = 'validate_schema';
        edge.sourceHandle = edge.sourceHandle?.replace('load_dataset', 'validate_schema');
        edge.id = edge.id.replace('load', 'validate');
      }
    }
    // Add direct edge: load_dataset → validate_schema
    const loadEdgeIdx = workflow.edges.findIndex((e) => e.source === 'input_data_source' && e.target === 'load_dataset');
    workflow.edges.splice(loadEdgeIdx + 1, 0, {
      id: 'e-load-validate', source: 'load_dataset', sourceHandle: 'load_dataset-output',
      target: 'validate_schema', targetHandle: 'validate_schema-input',
      type: 'smoothstep', data: { color: '#3b82f6', animated: true },
    });
    changed = true;
  }

  // Migrate old loop structure → strictly linear (no back-loops)
  // Remove any conditional back-edge from update_dependency → fetch_file
  // and ensure update_dependency → review_changes is a direct edge.
  const hasUpdateToFetchLoop = workflow.edges?.some(
    (e) => e.source === 'update_dependency' && e.target === 'fetch_file' && e.data?.condition,
  );
  // Also catch the older create_pr → fetch_file loop
  const hasPrToFetchLoop = workflow.edges?.some(
    (e) => e.source === 'create_pr' && e.target === 'fetch_file' && e.data?.condition,
  );
  if (hasUpdateToFetchLoop || hasPrToFetchLoop) {
    console.log('[migrate] Removing back-loop edges → strictly linear pipeline');

    // Remove all conditional back-edges that create loops
    workflow.edges = workflow.edges.filter((e) => {
      // Remove update_dependency → fetch_file (conditional back-loop)
      if (e.source === 'update_dependency' && e.target === 'fetch_file' && e.data?.condition) return false;
      // Remove create_pr → fetch_file (older loop variant)
      if (e.source === 'create_pr' && e.target === 'fetch_file' && e.data?.condition) return false;
      // Remove old update → review conditional edge (will be replaced with direct)
      if (e.source === 'update_dependency' && e.target === 'review_changes' && e.data?.condition) return false;
      // Remove create_pr conditional edges
      if (e.source === 'create_pr' && e.data?.condition) return false;
      return true;
    });

    // Ensure update_dependency → review_changes is a direct edge
    if (!workflow.edges.some((e) => e.source === 'update_dependency' && e.target === 'review_changes')) {
      workflow.edges.push({
        id: 'e-update-review', source: 'update_dependency', sourceHandle: 'update_dependency-output',
        target: 'review_changes', targetHandle: 'review_changes-input',
        type: 'smoothstep', data: { color: '#eab308', animated: true },
      });
    }

    // Ensure create_pr → __end__ is a direct edge
    const prEndEdge = workflow.edges.find((e) => e.source === 'create_pr' && e.target === '__end__');
    if (prEndEdge) {
      delete prEndEdge.data?.condition;
      delete prEndEdge.data?.conditionResult;
    } else if (!workflow.edges.some((e) => e.source === 'create_pr' && e.target === '__end__')) {
      workflow.edges.push({
        id: 'e-pr-end', source: 'create_pr', sourceHandle: 'create_pr-output',
        target: '__end__', targetHandle: '__end__-input',
        type: 'smoothstep', data: { color: '#22c55e', animated: true },
      });
    }

    // Update condition to simple "has data" check instead of iteration loop
    if (workflow.conditions?.hasMoreVulnerabilities) {
      workflow.conditions.hasMoreVulnerabilities = {
        field: 'iterations',
        operator: 'gt',
        value: 0,
        trueResult: 'fetch_file',
        falseResult: '__end__',
      };
    }

    // Ensure fetch_file and update_dependency have proper interruptBehavior
    const fetchNode = workflow.nodes?.find((n) => n.id === 'fetch_file');
    if (fetchNode?.data && !fetchNode.data.interruptBehavior) {
      fetchNode.data.interruptBehavior = 'before';
    }
    const updateNode = workflow.nodes?.find((n) => n.id === 'update_dependency');
    if (updateNode?.data && !updateNode.data.interruptBehavior) {
      updateNode.data.interruptBehavior = 'after';
      updateNode.data.interruptType = 'presentation';
    }

    changed = true;
  }

  return changed;
}

function generateInstanceId() {
  return `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Derive config.interruptBefore and config.interruptAfter arrays
 * from per-node interruptBehavior. This is the bridge between the
 * per-node source of truth and LangGraph's compile() API.
 */
export function deriveInterruptArrays(nodes) {
  const interruptBefore = [];
  const interruptAfter = [];
  for (const node of nodes) {
    const behavior = node.data?.interruptBehavior;
    if (!behavior || behavior === 'bypass') continue;
    if (behavior === 'before' || behavior === 'both') interruptBefore.push(node.id);
    if (behavior === 'after' || behavior === 'both') interruptAfter.push(node.id);
  }
  return { interruptBefore, interruptAfter };
}

export const useWorkflowStore = create((set, get) => ({
  // --- state ---
  workflows: [],         // index entries: { id, name, presetId, createdAt, updatedAt }
  activeWorkflowId: null,
  activeWorkflow: null,  // full workflow definition (the template data)
  loading: false,
  pendingWorkflow: null,  // { presetId, customName } — set during create flow, consumed by review page

  // --- instance state ---
  instances: [],          // index entries: { id, name, workflowId, workflowName, createdAt, updatedAt, status }
  activeInstanceId: null,
  activeInstance: null,   // full workflow snapshot for this instance

  // --- actions ---

  /** Load workflow index, instances, and active instance from storage */
  async loadWorkflows() {
    set({ loading: true });
    const storage = getStorageAdapter();

    // Load workflow index
    const index = (await storage.get('workflow_index')) ?? [];

    // Load active workflow ID (for backward compat)
    const activeId = await storage.get('workflow_active_id');
    let activeWorkflow = null;

    if (activeId) {
      activeWorkflow = await storage.get(`workflow_${activeId}`);

      // Migrate old vuln-resolver workflows with broken condition
      if (activeWorkflow && _migrateVulnResolver(activeWorkflow)) {
        await storage.set(`workflow_${activeId}`, activeWorkflow);
      }
    }

    // Load instance index
    const instanceIndex = (await storage.get('instance_index')) ?? [];

    // Load active instance
    const activeInstId = await storage.get('instance_active_id');
    let activeInstance = null;
    if (activeInstId) {
      activeInstance = await storage.get(`instance_${activeInstId}`);
    }

    set({
      workflows: index,
      activeWorkflowId: activeId,
      activeWorkflow,
      instances: instanceIndex,
      activeInstanceId: activeInstId,
      activeInstance,
      loading: false,
    });
  },

  /** Create a new workflow from a preset template, applying user overrides from the review page */
  async createFromPreset(presetId, customName, overrides) {
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

    // Apply user overrides from the review page (interruptBefore, nodes, edges, etc.)
    if (overrides) {
      if (overrides.name) workflowData.name = overrides.name;
      if (overrides.description) workflowData.description = overrides.description;
      if (overrides.config) {
        workflowData.config = { ...workflowData.config, ...overrides.config };
      }
      if (overrides.nodes) workflowData.nodes = JSON.parse(JSON.stringify(overrides.nodes));
      if (overrides.edges) workflowData.edges = JSON.parse(JSON.stringify(overrides.edges));
      if (overrides.conditions) workflowData.conditions = JSON.parse(JSON.stringify(overrides.conditions));
      if (overrides.g11n) {
        workflowData.g11n = workflowData.g11n
          ? { ...workflowData.g11n, ...overrides.g11n }
          : overrides.g11n;
      }
    }

    // Derive config.interruptBefore/interruptAfter from per-node interruptBehavior
    const derived = deriveInterruptArrays(workflowData.nodes);
    workflowData.config.interruptBefore = derived.interruptBefore;
    workflowData.config.interruptAfter = derived.interruptAfter;

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

  // --- Instance CRUD ---

  /** Create a new instance from a workflow (snapshot the workflow definition) */
  async createInstance(workflowId, instanceName) {
    const storage = getStorageAdapter();
    const workflowData = await storage.get(`workflow_${workflowId}`);
    if (!workflowData) throw new Error(`Workflow not found: ${workflowId}`);
    if (!instanceName?.trim()) throw new Error('Instance name is required');

    const id = generateInstanceId();
    const now = Date.now();
    const name = instanceName.trim();

    // Find the workflow index entry for the name
    const index = (await storage.get('workflow_index')) ?? [];
    const wfEntry = index.find((w) => w.id === workflowId);
    const workflowName = wfEntry?.name ?? workflowData.name ?? 'Workflow';

    // Deep-clone the workflow as a frozen snapshot
    const snapshot = JSON.parse(JSON.stringify(workflowData));
    snapshot._instanceId = id;
    snapshot._workflowId = workflowId;
    snapshot._instanceName = name;

    await storage.set(`instance_${id}`, snapshot);

    // Update instance index
    const instIndex = (await storage.get('instance_index')) ?? [];
    instIndex.push({ id, name, workflowId, workflowName, createdAt: now, updatedAt: now, status: 'idle' });
    await storage.set('instance_index', instIndex);

    // Set as active instance
    await storage.set('instance_active_id', id);

    // Also set the parent workflow as active for consistency
    await storage.set('workflow_active_id', workflowId);

    set({
      instances: instIndex,
      activeInstanceId: id,
      activeInstance: snapshot,
      activeWorkflowId: workflowId,
      activeWorkflow: workflowData,
    });

    return id;
  },

  /** Set an instance as the active one (loads its snapshot for execution) */
  async setActiveInstance(id) {
    const storage = getStorageAdapter();
    const snapshot = await storage.get(`instance_${id}`);
    if (!snapshot) throw new Error(`Instance not found: ${id}`);

    await storage.set('instance_active_id', id);

    // Also set parent workflow as active
    if (snapshot._workflowId) {
      await storage.set('workflow_active_id', snapshot._workflowId);
      const workflowData = await storage.get(`workflow_${snapshot._workflowId}`);
      set({ activeWorkflowId: snapshot._workflowId, activeWorkflow: workflowData });
    }

    set({ activeInstanceId: id, activeInstance: snapshot });
  },

  /** Update instance status */
  async updateInstanceStatus(id, status) {
    const storage = getStorageAdapter();
    const instIndex = (await storage.get('instance_index')) ?? [];
    const entry = instIndex.find((inst) => inst.id === id);
    if (entry) {
      entry.status = status;
      entry.updatedAt = Date.now();
      await storage.set('instance_index', instIndex);
      set({ instances: [...instIndex] });
    }
  },

  /** Rename an instance */
  async renameInstance(id, newName) {
    const storage = getStorageAdapter();
    const instIndex = (await storage.get('instance_index')) ?? [];
    const entry = instIndex.find((inst) => inst.id === id);
    if (!entry) return;

    entry.name = newName;
    entry.updatedAt = Date.now();
    await storage.set('instance_index', instIndex);

    const snapshot = await storage.get(`instance_${id}`);
    if (snapshot) {
      snapshot._instanceName = newName;
      await storage.set(`instance_${id}`, snapshot);
      if (get().activeInstanceId === id) {
        set({ activeInstance: snapshot });
      }
    }

    set({ instances: [...instIndex] });
  },

  /** Delete an instance */
  async deleteInstance(id) {
    const storage = getStorageAdapter();
    await storage.delete(`instance_${id}`);

    const instIndex = (await storage.get('instance_index')) ?? [];
    const filtered = instIndex.filter((inst) => inst.id !== id);
    await storage.set('instance_index', filtered);

    const updates = { instances: filtered };

    if (get().activeInstanceId === id) {
      await storage.delete('instance_active_id');
      updates.activeInstanceId = null;
      updates.activeInstance = null;
    }

    set(updates);
  },

  /** Get available preset templates */
  getPresets() {
    return PRESET_TEMPLATES;
  },
}));
