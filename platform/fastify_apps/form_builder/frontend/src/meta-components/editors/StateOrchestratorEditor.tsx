import { useState } from 'react';
import { Plus, Trash2, GripVertical, ArrowRight, Circle, CircleDot } from 'lucide-react';
import { StateMetaComponent, StateDefinition, StateTransition } from '../../types';
import { MetaComponentEditor } from '../types';

// Generate unique IDs
const generateStateId = () => `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTransitionId = () => `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create default state
const createDefaultState = (): StateDefinition => ({
  id: generateStateId(),
  name: '',
  stateType: 'normal'
});

// Create default transition
const createDefaultTransition = (states: StateDefinition[]): StateTransition => ({
  id: generateTransitionId(),
  from: states[0]?.id ?? '',
  to: states[1]?.id ?? states[0]?.id ?? '',
  event: 'trigger'
});

// State item component
interface StateItemProps {
  state: StateDefinition;
  index: number;
  isInitial: boolean;
  onUpdate: (state: StateDefinition) => void;
  onRemove: () => void;
  onSetInitial: () => void;
}

const StateItem = ({
  state,
  index: _index,
  isInitial,
  onUpdate,
  onRemove,
  onSetInitial
}: StateItemProps) => {
  void _index; // Used for drag-drop ordering in future enhancement
  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md">
      <div className="flex-shrink-0 text-gray-400">
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={onSetInitial}
        className={`flex-shrink-0 ${isInitial ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
        title={isInitial ? 'Initial stage' : 'Set as initial'}>

        {isInitial ? <CircleDot className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      </button>

      <input
        type="text"
        value={state.name}
        onChange={(e) => onUpdate({ ...state, name: e.target.value })}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        placeholder="Stage name" />


      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500">

        <Trash2 className="h-4 w-4" />
      </button>
    </div>);

};

// Transition item component - editable inline
interface TransitionItemProps {
  transition: StateTransition;
  states: StateDefinition[];
  onUpdate: (transition: StateTransition) => void;
  onRemove: () => void;
}

const TransitionItem = ({
  transition,
  states,
  onUpdate,
  onRemove
}: TransitionItemProps) => {
  return (
    <div className="flex items-center gap-2 px-2 py-2 bg-white border border-gray-200 rounded-md text-sm">
      <input
        type="text"
        value={transition.event}
        onChange={(e) => onUpdate({ ...transition, event: e.target.value })}
        className="w-1/2 px-2 py-1 text-xs border border-gray-300 rounded placeholder:text-gray-400"
        placeholder="trigger" />

      <select
        value={transition.from}
        onChange={(e) => onUpdate({ ...transition, from: e.target.value })}
        className="w-1/4 px-1.5 py-1 text-xs border border-gray-300 rounded">

        <option value="">from</option>
        {states.map((s) =>
        <option key={s.id} value={s.id}>{s.name || '...'}</option>
        )}
      </select>
      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
      <select
        value={transition.to}
        onChange={(e) => onUpdate({ ...transition, to: e.target.value })}
        className="w-1/4 px-1.5 py-1 text-xs border border-gray-300 rounded">

        <option value="">to</option>
        {states.map((s) =>
        <option key={s.id} value={s.id}>{s.name || '...'}</option>
        )}
      </select>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0">

        <Trash2 className="h-4 w-4" />
      </button>
    </div>);

};

export const StateOrchestratorEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements
}) => {
  const stateMeta = meta as StateMetaComponent;
  const spec = stateMeta.stateSpec ?? {
    stateMachineId: '',
    states: [],
    transitions: [],
    initialState: ''
  };

  const [activeTab, setActiveTab] = useState<'states' | 'transitions'>('states');

  // Find the source element (first target element - now read-only)
  const sourceElementId = stateMeta.targetElementIds?.[0] ?? '';
  const sourceElement = availableElements.find((el) => el.id === sourceElementId);

  // Update spec helper
  const updateSpec = (updates: Partial<typeof spec>) => {
    onUpdate({
      ...stateMeta,
      stateSpec: { ...spec, ...updates }
    });
  };

  // State handlers
  const handleAddState = () => {
    const newState = createDefaultState();
    const newStates = [...spec.states, newState];
    updateSpec({
      states: newStates,
      initialState: spec.initialState || newState.id
    });
  };

  const handleUpdateState = (index: number, updated: StateDefinition) => {
    const newStates = [...spec.states];
    newStates[index] = updated;
    updateSpec({ states: newStates });
  };

  const handleRemoveState = (index: number) => {
    const stateId = spec.states[index].id;
    const newStates = spec.states.filter((_, i) => i !== index);
    const newTransitions = spec.transitions.filter(
      (t) => t.from !== stateId && t.to !== stateId
    );
    updateSpec({
      states: newStates,
      transitions: newTransitions,
      initialState: spec.initialState === stateId ? newStates[0]?.id ?? '' : spec.initialState
    });
  };

  const handleSetInitial = (stateId: string) => {
    updateSpec({ initialState: stateId });
  };

  // Transition handlers
  const handleAddTransition = () => {
    if (spec.states.length < 2) return;
    const newTransition = createDefaultTransition(spec.states);
    updateSpec({ transitions: [...spec.transitions, newTransition] });
  };

  const handleUpdateTransition = (index: number, updated: StateTransition) => {
    const newTransitions = [...spec.transitions];
    newTransitions[index] = updated;
    updateSpec({ transitions: newTransitions });
  };

  const handleRemoveTransition = (index: number) => {
    updateSpec({ transitions: spec.transitions.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={stateMeta.name}
          onChange={(e) => onUpdate({ ...stateMeta, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />

      </div>

      {/* Source Element (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source Element
        </label>
        <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-600">
          {sourceElement ?
          <>
              <span className="font-medium">{sourceElement.label}</span>
              <span className="text-gray-400 ml-2">({sourceElement.type})</span>
            </> :

          <span className="text-gray-400">No element attached</span>
          }
        </div>
        <p className="mt-1 text-xs text-gray-400">
          This state machine is attached to this element
        </p>
      </div>

      {/* State Machine ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">State Machine ID</label>
        <input
          type="text"
          value={spec.stateMachineId}
          onChange={(e) => updateSpec({ stateMachineId: e.target.value })}
          placeholder="e.g., checkout-flow, wizard-nav"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />

      </div>

      {/* Status Summary - removed Initial field */}
      <div className="bg-indigo-50 rounded-md p-3">
        <div className="text-sm font-medium text-indigo-900 mb-1">State Machine Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-indigo-600">Stages:</span>{' '}
            <span className="font-medium">{spec.states.length}</span>
          </div>
          <div>
            <span className="text-indigo-600">Transitions:</span>{' '}
            <span className="font-medium">{spec.transitions.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('states')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
            activeTab === 'states' ?
            'border-indigo-500 text-indigo-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-70e97245">

            State Stages ({spec.states.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transitions')}
            className={`py-2 px-1 border-b-2 text-sm font-medium ${
            activeTab === 'transitions' ?
            'border-indigo-500 text-indigo-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            } data-test-id="button-dacff769">

            Transitions ({spec.transitions.length})
          </button>
        </nav>
      </div>

      {/* States Tab */}
      {activeTab === 'states' &&
      <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">State Stages</label>
            <button
            type="button"
            onClick={handleAddState}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200">

              <Plus className="h-3 w-3" />
              Add Stage
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {spec.states.length === 0 ?
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <p className="text-sm text-gray-400">
                  No stages defined. Add stages to create a state machine.
                </p>
              </div> :

          spec.states.map((state, index) =>
          <StateItem
            key={state.id}
            state={state}
            index={index}
            isInitial={state.id === spec.initialState}
            onUpdate={(updated) => handleUpdateState(index, updated)}
            onRemove={() => handleRemoveState(index)}
            onSetInitial={() => handleSetInitial(state.id)} />

          )
          }
          </div>
        </div>
      }

      {/* Transitions Tab */}
      {activeTab === 'transitions' &&
      <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Transitions</label>
            <button
            type="button"
            onClick={handleAddTransition}
            disabled={spec.states.length < 2}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">

              <Plus className="h-3 w-3" />
              Add Transition
            </button>
          </div>

          {spec.states.length < 2 &&
        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
              Add at least 2 stages to define transitions.
            </div>
        }

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {spec.transitions.length === 0 ?
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <p className="text-sm text-gray-400">
                  No transitions defined.
                </p>
              </div> :

          spec.transitions.map((transition, index) =>
          <TransitionItem
            key={transition.id}
            transition={transition}
            states={spec.states}
            onUpdate={(updated) => handleUpdateTransition(index, updated)}
            onRemove={() => handleRemoveTransition(index)} />

          )
          }
          </div>
        </div>
      }
    </div>);

};