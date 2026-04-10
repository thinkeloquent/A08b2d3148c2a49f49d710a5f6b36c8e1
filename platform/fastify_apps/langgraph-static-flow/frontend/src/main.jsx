import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { PageShell } from './layout/PageShell.jsx'
import AppShell from './components/AppShell.jsx'
import App from './App.jsx'
import WorkflowReview from './pages/WorkflowReview.jsx'
import WorkflowDetail from './pages/WorkflowDetail.jsx'
import WorkflowContract from './pages/WorkflowContract.jsx'
import InstanceDetail from './pages/InstanceDetail.jsx'
import WorkflowNodes from './pages/WorkflowNodes.jsx'
import WorkflowNodeForm from './pages/WorkflowNodeForm.jsx'
import WorkflowConditions from './pages/WorkflowConditions.jsx'
import WorkflowConditionForm from './pages/WorkflowConditionForm.jsx'
import { useGraphStore } from './store/useGraphStore.js'
import { useWorkflowStore } from './store/useWorkflowStore.js'

// Load workflows from storage, then load graph definition
useWorkflowStore.getState().loadWorkflows()
  .then(() => useGraphStore.getState().loadGraphDef());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/apps/langgraph-static-flow">
      <PageShell>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<App />} />
          <Route path="/deployments" element={<App />} />
          <Route path="/release" element={<App />} />
          <Route path="/schemas" element={<App />} />
          <Route path="/session" element={<App />} />
          <Route path="/specs" element={<App />} />
          <Route path="/workflow-template/review/:templateId" element={<WorkflowReview />} />
          <Route path="/workflow/nodes" element={<WorkflowNodes />} />
          <Route path="/workflow/nodes/new" element={<WorkflowNodeForm />} />
          <Route path="/workflow/nodes/:nodeId/edit" element={<WorkflowNodeForm />} />
          <Route path="/workflow/conditions" element={<WorkflowConditions />} />
          <Route path="/workflow/conditions/new" element={<WorkflowConditionForm />} />
          <Route path="/workflow/conditions/:conditionName/edit" element={<WorkflowConditionForm />} />
          <Route path="/workflow-contract/:workflowId" element={<WorkflowContract />} />
          <Route path="/workflow/:workflowId" element={<WorkflowDetail />} />
          <Route path="/instance/:instanceId" element={<InstanceDetail />} />
          <Route path="/instance/:instanceId/:runId" element={<InstanceDetail />} />
        </Route>
      </Routes>
      </PageShell>
    </BrowserRouter>
  </StrictMode>,
)
