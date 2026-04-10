import { useState } from 'react';
import ControlPanel, { AppBar } from './components/ControlPanel.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import FeedbackPanel from './components/FeedbackPanel.jsx';
import IterationTimeline from './components/IterationTimeline.jsx';
import CheckpointPanel from './components/CheckpointPanel.jsx';
import StageNavigator from './components/StageNavigator.jsx';
import SessionView from './components/SessionView.jsx';
import NodeInspector from './components/NodeInspector.jsx';
import WorkflowManager from './components/WorkflowManager.jsx';
import { t } from './graph/g11n.js';
import { useGraphStore } from './store/useGraphStore.js';
import { useWorkflowStore } from './store/useWorkflowStore.js';

const tabs = [
  { id: 'current', g11nKey: 'tabWorkflow' },
  { id: 'session', g11nKey: 'tabSession' },
  { id: 'workflows', label: 'Workflows' },
];

const sidebarTabs = [
  { id: 'timeline', g11nKey: 'sidebarTimeline' },
  { id: 'checkpoints', g11nKey: 'sidebarCheckpoints' },
];

export default function App() {
  const graphDef = useGraphStore((s) => s.graphDef);
  const activeWorkflowId = useWorkflowStore((s) => s.activeWorkflowId);
  const [activeTab, setActiveTab] = useState('current');
  const [activeSidebarTab, setActiveSidebarTab] = useState('timeline');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Persistent top app bar */}
      <AppBar />

      {/* Tabs */}
      <div className="flex items-center gap-0 px-4 bg-slate-50 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label ?? t(graphDef, tab.g11nKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'current' && (
        <>
        {/* Top control bar */}
        <ControlPanel />

        {!activeWorkflowId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-4xl mb-3">&#9881;</div>
              <p className="text-sm text-slate-500 mb-1">No workflow selected</p>
              <p className="text-xs text-slate-400">
                Select a workflow from the dropdown above, or go to the{' '}
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                >
                  Workflows
                </button>{' '}
                tab to create one.
              </p>
            </div>
          </div>
        ) : (
          <>
          {/* Stage navigator */}
          <StageNavigator />
          <div className="flex flex-1 overflow-hidden">
            {/* Graph canvas */}
            <div className="relative flex-1">
              <GraphCanvas />
              <FeedbackPanel />
            </div>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 flex items-center justify-center
                bg-slate-100 border border-slate-200 rounded-l-md hover:bg-slate-200 transition-colors"
              style={{ right: sidebarOpen ? '20rem' : 0 }}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <span className="text-slate-500 text-xs">{sidebarOpen ? '\u203A' : '\u2039'}</span>
            </button>

            {/* Right sidebar */}
            {sidebarOpen && (
              <div className="w-80 border-l border-slate-200 bg-[#f8fafc] flex flex-col overflow-hidden">
                {/* Sidebar tabs */}
                <div className="flex items-center gap-0 bg-slate-50 border-b border-slate-200 shrink-0">
                  {sidebarTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSidebarTab(tab.id)}
                      className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                        activeSidebarTab === tab.id
                          ? 'border-indigo-500 text-indigo-700 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {t(graphDef, tab.g11nKey)}
                    </button>
                  ))}
                </div>

                {/* Sidebar tab content */}
                <div className="flex-1 overflow-hidden">
                  {activeSidebarTab === 'timeline' && <IterationTimeline />}
                  {activeSidebarTab === 'checkpoints' && <CheckpointPanel />}
                </div>
              </div>
            )}
          </div>
          </>
        )}
        </>
      )}
      {activeTab === 'session' && (
        <div className="flex-1 overflow-hidden">
          <SessionView />
        </div>
      )}
      {activeTab === 'workflows' && (
        <div className="flex-1 overflow-hidden">
          <WorkflowManager />
        </div>
      )}
      {/* Node inspection drawer */}
      <NodeInspector />
    </div>
  );
}
